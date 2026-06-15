/**
 * 赛马娘评分计算器
 * 
 * 核心功能：
 * 1. 评分反推：总评分 → 去掉技能分 → 纯属性分
 * 2. 最优分析：通过历史数据分析最优决策
 * 3. 开局校准：对比数据库验证开局属性
 * 
 * 评分算法参考（逆向工程）：
 * - 总评分 = 属性评分 + 技能评分
 * - 属性评分 ≈ (五维总和 / 5) * 距离适性系数
 * - 技能评分 = 技能触发率 * 影响度 的总和
 */

import type { FiveStats, NurtureLog, TurnRecord } from "@/data/trainingLog";
import { getUmaBaseStats, getStarStats } from "@/data/umaBaseStats";

// ========== 评分反推 ==========

/**
 * 从总评分反推纯属性分
 * @param totalEval 总评分（游戏显示）
 * @param skillEval 技能分（游戏结束时有详细评分页）
 * @returns 纯属性分
 */
export function extractStatEvaluation(totalEval: number, skillEval: number): number {
  return Math.max(0, totalEval - skillEval);
}

/**
 * 估算技能分（如果不知道精确值）
 * 基于学到的技能进行估算
 */
export function estimateSkillEvaluation(
  totalSkillPt: number,
  skillCount: number
): number {
  // 经验公式：总pt * 0.01 + 技能数量 * 2
  // 这个系数需要大量数据校准
  return Math.round(totalSkillPt * 0.01 + skillCount * 2);
}

/**
 * 计算属性评分（纯五维贡献）
 * 参考UmaSimulator的评分公式
 */
export function calculateStatScore(
  stats: FiveStats,
  distance: "short" | "mile" | "middle" | "long"
): number {
  const avg = (stats.speed + stats.stamina + stats.power + stats.guts + stats.wit) / 5;
  
  // 距离适性权重
  const weights = getDistanceWeights(distance);
  const weighted = stats.speed * weights.speed
                 + stats.stamina * weights.stamina
                 + stats.power * weights.power
                 + stats.guts * weights.guts
                 + stats.wit * weights.wit;
  
  // 属性分 = 加权平均 * 基础系数
  const baseScore = weighted * 0.5;
  
  // 极端属性惩罚（过度偏科）
  const values = [stats.speed, stats.stamina, stats.power, stats.guts, stats.wit];
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const imbalance = maxVal - minVal;
  
  let penalty = 0;
  if (imbalance > 800) penalty = (imbalance - 800) * 0.05;
  if (imbalance > 1200) penalty = (imbalance - 1200) * 0.1;
  
  return Math.round(baseScore - penalty);
}

/** 距离适性权重 */
function getDistanceWeights(d: "short" | "mile" | "middle" | "long") {
  switch (d) {
    case "short":  return { speed: 0.30, stamina: 0.10, power: 0.25, guts: 0.20, wit: 0.15 };
    case "mile":   return { speed: 0.25, stamina: 0.15, power: 0.25, guts: 0.15, wit: 0.20 };
    case "middle": return { speed: 0.20, stamina: 0.25, power: 0.20, guts: 0.15, wit: 0.20 };
    case "long":   return { speed: 0.15, stamina: 0.30, power: 0.15, guts: 0.20, wit: 0.20 };
  }
}

// ========== 最优决策分析 ==========

/** 分析最优训练路径 */
export function analyzeOptimalPath(logs: NurtureLog[]): OptimalAnalysis {
  if (logs.length === 0) return getDefaultAnalysis();
  
  // 按总评分排序
  const sorted = [...logs].sort((a, b) => b.finalEvaluation - a.finalEvaluation);
  const best = sorted[0];
  
  // 统计每个回合的行动分布（取前10%高分记录）
  const topCount = Math.max(1, Math.ceil(sorted.length * 0.1));
  const topLogs = sorted.slice(0, topCount);
  
  const actionDistribution: { [key: string]: number[] } = {};
  
  for (const log of topLogs) {
    for (const turn of log.turns) {
      const key = `${turn.turn}_${turn.action}`;
      if (!actionDistribution[key]) actionDistribution[key] = [];
      actionDistribution[key].push(log.finalEvaluation);
    }
  }
  
  // 计算每个回合的最优行动
  const turnRecommendations: TurnRecommendation[] = [];
  for (let turn = 1; turn <= 72; turn++) {
    const actions = ["train-speed", "train-stamina", "train-power", "train-guts", "train-wit", "rest", "outing", "race"] as const;
    let bestAction = actions[0];
    let bestAvgScore = 0;
    
    for (const action of actions) {
      const key = `${turn}_${action}`;
      const scores = actionDistribution[key];
      if (scores && scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > bestAvgScore) {
          bestAvgScore = avg;
          bestAction = action;
        }
      }
    }
    
    turnRecommendations.push({ turn, action: bestAction, avgScore: bestAvgScore });
  }
  
  return {
    bestLog: best,
    totalLogsAnalyzed: logs.length,
    avgEvaluation: sorted.reduce((s, l) => s + l.finalEvaluation, 0) / sorted.length,
    turnRecommendations,
    keyInsights: generateInsights(topLogs)
  };
}

/** 生成关键洞察 */
function generateInsights(topLogs: NurtureLog[]): string[] {
  const insights: string[] = [];
  
  // 平均最终属性
  const avgStats = topLogs.reduce((acc, log) => {
    acc.speed += log.finalStats.speed;
    acc.stamina += log.finalStats.stamina;
    acc.power += log.finalStats.power;
    acc.guts += log.finalStats.guts;
    acc.wit += log.finalStats.wit;
    return acc;
  }, { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 });
  
  const n = topLogs.length;
  insights.push(`高分记录平均属性: 速${Math.round(avgStats.speed/n)} 耐${Math.round(avgStats.stamina/n)} 力${Math.round(avgStats.power/n)} 根${Math.round(avgStats.guts/n)} 智${Math.round(avgStats.wit/n)}`);
  
  // 训练频率统计
  const trainCounts: { [key: string]: number } = {};
  let totalTrains = 0;
  for (const log of topLogs) {
    for (const turn of log.turns) {
      if (turn.action.startsWith("train-")) {
        trainCounts[turn.action] = (trainCounts[turn.action] || 0) + 1;
        totalTrains++;
      }
    }
  }
  
  const sortedTrains = Object.entries(trainCounts).sort((a, b) => b[1] - a[1]);
  if (sortedTrains.length > 0) {
    const [topAction, topCount] = sortedTrains[0];
    const pct = Math.round((topCount / totalTrains) * 100);
    const name = topAction.replace("train-", "");
    insights.push(`最优训练: ${name} (${pct}%频率)`);
  }
  
  // 休息频率
  let restCount = 0;
  let outingCount = 0;
  for (const log of topLogs) {
    for (const turn of log.turns) {
      if (turn.action === "rest") restCount++;
      if (turn.action === "outing") outingCount++;
    }
  }
  const avgRest = (restCount / topLogs.length).toFixed(1);
  const avgOuting = (outingCount / topLogs.length).toFixed(1);
  insights.push(`平均休息${avgRest}次/育成，外出${avgOuting}次/育成`);
  
  return insights;
}

function getDefaultAnalysis(): OptimalAnalysis {
  return {
    bestLog: null,
    totalLogsAnalyzed: 0,
    avgEvaluation: 0,
    turnRecommendations: [],
    keyInsights: ["暂无数据，请先录入训练记录"]
  };
}

// ========== 开局校准 ==========

/**
 * 校准开局属性
 * 对比数据库中的标准值，计算偏差
 */
export function calibrateBaseStats(
  cardId: string,
  star: 3 | 4 | 5,
  actualStats: FiveStats
): CalibrationResult {
  const dbStats = getStarStats(cardId, star);
  if (!dbStats) {
    return { calibrated: false, diff: null, message: "数据库中未找到该马娘" };
  }
  
  const diff: FiveStats = {
    speed: actualStats.speed - dbStats.speed,
    stamina: actualStats.stamina - dbStats.stamina,
    power: actualStats.power - dbStats.power,
    guts: actualStats.guts - dbStats.guts,
    wit: actualStats.wit - dbStats.wit
  };
  
  const maxDiff = Math.max(
    Math.abs(diff.speed),
    Math.abs(diff.stamina),
    Math.abs(diff.power),
    Math.abs(diff.guts),
    Math.abs(diff.wit)
  );
  
  if (maxDiff <= 3) {
    return { calibrated: true, diff, message: "开局属性与数据库匹配" };
  } else {
    return {
      calibrated: true,
      diff,
      message: `开局偏差 detected (最大${maxDiff}点)，已校准。建议检查星级/因子加成。`,
      warning: true
    };
  }
}

// ========== 类型定义 ==========

export interface OptimalAnalysis {
  bestLog: NurtureLog | null;
  totalLogsAnalyzed: number;
  avgEvaluation: number;
  turnRecommendations: TurnRecommendation[];
  keyInsights: string[];
}

export interface TurnRecommendation {
  turn: number;
  action: string;
  avgScore: number;
}

export interface CalibrationResult {
  calibrated: boolean;
  diff: FiveStats | null;
  message: string;
  warning?: boolean;
}
