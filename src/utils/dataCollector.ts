/**
 * 训练数据收集器
 * 
 * 核心设计：只保存OCR提取后的数值文本，不保存图片
 * 截图 → OCR识别 → 提取五维数字 → 保存JSON → 图片立即删除
 * 
 * 72回合的全部数据 ≈ 10-20KB（纯文本）
 * 
 * 收集方式：
 * 1. 截图OCR自动收集（推荐）
 * 2. 手动输入（最准）
 * 3. 关键节点记录（省时间）
 */

import type { FiveStats } from "@/data/trainingLog";

// ========== 单条收集记录 ==========

export interface CollectedTurn {
  turn: number;           // 回合数
  action: string;         // 本次行动
  stats: FiveStats;       // 行动后五维（OCR或手动输入）
  vital: number;          // 体力
  motivation: number;     // 心情 1-5
  skillPt: number;        // 技能点
  isFat: boolean;         // 吃胖
  scenarioEvent?: string; // 剧本事件（如有）
  timestamp: number;      // 记录时间
}

// ========== 完整收集会话 ==========

export interface CollectionSession {
  id: string;
  umaCardId: string;
  umaName: string;
  star: number;
  scenario: string;
  parent1Factor: string;  // 种马1因子描述
  parent2Factor: string;  // 种马2因子描述
  supportCards: string[]; // 支援卡
  turns: CollectedTurn[]; // 收集的数据
  isComplete: boolean;    // 是否完成72回合
}

const COLLECT_KEY = "uma_collection_sessions";

// ========== 存储 ==========

export function getAllSessions(): CollectionSession[] {
  try {
    const raw = localStorage.getItem(COLLECT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSession(session: CollectionSession): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(COLLECT_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getAllSessions().filter(s => s.id !== id);
  localStorage.setItem(COLLECT_KEY, JSON.stringify(sessions));
}

// ========== 创建会话 ==========

export function createSession(
  umaCardId: string, umaName: string, star: number, scenario: string,
  parent1Factor: string, parent2Factor: string, supportCards: string[]
): CollectionSession {
  return {
    id: `col_${Date.now()}`,
    umaCardId, umaName, star, scenario,
    parent1Factor, parent2Factor, supportCards,
    turns: [], isComplete: false
  };
}

// ========== 添加记录 ==========

export function addTurnRecord(
  session: CollectionSession,
  turn: number,
  action: string,
  stats: FiveStats,
  vital: number,
  motivation: number,
  skillPt: number,
  isFat: boolean
): void {
  // 查找是否已有该回合记录（覆盖更新）
  const idx = session.turns.findIndex(t => t.turn === turn);
  const record: CollectedTurn = {
    turn, action, stats, vital, motivation, skillPt, isFat,
    timestamp: Date.now()
  };
  
  if (idx >= 0) {
    session.turns[idx] = record; // 覆盖
  } else {
    session.turns.push(record);
  }
  
  // 自动排序
  session.turns.sort((a, b) => a.turn - b.turn);
  
  // 检查是否完成
  if (session.turns.length >= 72) {
    session.isComplete = true;
  }
  
  saveSession(session);
}

// ========== OCR结果解析 ==========

/**
 * 从OCR文本中提取五维数值
 * 赛马娘训练界面通常按固定顺序显示：速度 耐力 力量 根性 智力
 */
export function parseStatsFromOCR(ocrText: string): {
  stats: FiveStats | null;
  vital: number;
  skillPt: number;
  confidence: number; // 置信度 0-1
} {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let speed = 0, stamina = 0, power = 0, guts = 0, wit = 0;
  let vital = 0, skillPt = 0;
  let foundStats = 0;
  
  for (const line of lines) {
    const nums = line.match(/\d+/g)?.map(n => parseInt(n)) || [];
    if (nums.length === 0) continue;
    
    const txt = line.toLowerCase();
    
    // 速度 / スピード
    if ((txt.includes('速度') || txt.includes('スピ') || txt.includes('speed')) && nums[0] > 50) {
      speed = nums[0]; foundStats++;
    }
    // 耐力 / スタミナ
    else if ((txt.includes('耐力') || txt.includes('スタ') || txt.includes('stamina')) && nums[0] > 50) {
      stamina = nums[0]; foundStats++;
    }
    // 力量 / パワー
    else if ((txt.includes('力量') || txt.includes('パワ') || txt.includes('power')) && nums[0] > 50) {
      power = nums[0]; foundStats++;
    }
    // 根性
    else if ((txt.includes('根性') || txt.includes('guts')) && nums[0] > 50) {
      guts = nums[0]; foundStats++;
    }
    // 智力 / 賢さ
    else if ((txt.includes('智力') || txt.includes('賢') || txt.includes('wiz') || txt.includes('int')) && nums[0] > 50) {
      wit = nums[0]; foundStats++;
    }
    // 体力
    else if ((txt.includes('体力') || txt.includes('hp')) && nums[0] <= 100) {
      vital = nums[0];
    }
    // 技能点 / Pt
    else if ((txt.includes('pt') || txt.includes('スキル') || txt.includes('技能')) && nums[0] > 100) {
      skillPt = nums[0];
    }
  }
  
  // 如果没按标签匹配到，尝试从纯数字推断
  if (foundStats < 3) {
    const allNums = lines.flatMap(l => l.match(/\d+/g)?.map(n => parseInt(n)) || [])
      .filter(n => n >= 50 && n <= 2100)
      .slice(0, 5);
    if (allNums.length >= 5) {
      [speed, stamina, power, guts, wit] = allNums;
      foundStats = 5;
    }
  }
  
  const confidence = foundStats / 5;
  
  return {
    stats: foundStats >= 3 ? { speed, stamina, power, guts, wit } : null,
    vital,
    skillPt,
    confidence
  };
}

// ========== 批量数据分析 ==========

/**
 * 分析收集到的数据，找出最优训练路径
 */
export function analyzeCollectedData(sessions: CollectionSession[]): {
  turnPatterns: Map<number, Map<string, { count: number; avgFinalEval: number }>>;
  statGrowthCurves: Map<number, { avgSpeed: number; avgStamina: number; avgPower: number; avgGuts: number; avgWit: number }>;
  insights: string[];
} {
  // 按回合统计行动模式
  const turnPatterns = new Map<number, Map<string, { count: number; avgFinalEval: number }>>();
  
  // 属性成长曲线
  const statGrowthCurves = new Map<number, { 
    speedSum: number; staminaSum: number; powerSum: number; gutsSum: number; witSum: number; count: number 
  }>();
  
  for (const session of sessions) {
    for (const turn of session.turns) {
      // 行动模式
      if (!turnPatterns.has(turn.turn)) {
        turnPatterns.set(turn.turn, new Map());
      }
      const actions = turnPatterns.get(turn.turn)!;
      const key = actions.get(turn.action);
      if (key) {
        key.count++;
      } else {
        actions.set(turn.action, { count: 1, avgFinalEval: 0 });
      }
      
      // 成长曲线
      if (!statGrowthCurves.has(turn.turn)) {
        statGrowthCurves.set(turn.turn, { speedSum: 0, staminaSum: 0, powerSum: 0, gutsSum: 0, witSum: 0, count: 0 });
      }
      const curve = statGrowthCurves.get(turn.turn)!;
      curve.speedSum += turn.stats.speed;
      curve.staminaSum += turn.stats.stamina;
      curve.powerSum += turn.stats.power;
      curve.gutsSum += turn.stats.guts;
      curve.witSum += turn.stats.wit;
      curve.count++;
    }
  }
  
  // 计算平均值
  const avgCurves = new Map<number, { avgSpeed: number; avgStamina: number; avgPower: number; avgGuts: number; avgWit: number }>();
  for (const [turn, data] of statGrowthCurves) {
    avgCurves.set(turn, {
      avgSpeed: Math.round(data.speedSum / data.count),
      avgStamina: Math.round(data.staminaSum / data.count),
      avgPower: Math.round(data.powerSum / data.count),
      avgGuts: Math.round(data.gutsSum / data.count),
      avgWit: Math.round(data.witSum / data.count),
    });
  }
  
  // 生成洞察
  const insights: string[] = [];
  insights.push(`分析了 ${sessions.length} 次育成数据，共 ${sessions.reduce((s, se) => s + se.turns.length, 0)} 条回合记录`);
  
  // 找出每个回合最常见的行动
  for (let turn = 1; turn <= 10; turn++) {
    const actions = turnPatterns.get(turn);
    if (actions) {
      let bestAction = "", bestCount = 0;
      for (const [action, data] of actions) {
        if (data.count > bestCount) { bestAction = action; bestCount = data.count; }
      }
      if (bestAction) {
        insights.push(`T${turn}: ${bestAction} (${bestCount}次)`);
      }
    }
  }
  
  return { turnPatterns, statGrowthCurves: avgCurves, insights };
}

// ========== 导出给AI训练用 ==========

/**
 * 导出为AI训练格式（CSV/JSON）
 */
export function exportForAITraining(sessions: CollectionSession[]): string {
  const records: any[] = [];
  
  for (const session of sessions) {
    for (let i = 0; i < session.turns.length; i++) {
      const turn = session.turns[i];
      const prevTurn = i > 0 ? session.turns[i - 1] : null;
      
      records.push({
        uma: session.umaName,
        star: session.star,
        scenario: session.scenario,
        turn: turn.turn,
        action: turn.action,
        speed: turn.stats.speed,
        stamina: turn.stats.stamina,
        power: turn.stats.power,
        guts: turn.stats.guts,
        wit: turn.stats.wit,
        vital: turn.vital,
        motivation: turn.motivation,
        skillPt: turn.skillPt,
        isFat: turn.isFat,
        speedGain: prevTurn ? turn.stats.speed - prevTurn.stats.speed : 0,
        staminaGain: prevTurn ? turn.stats.stamina - prevTurn.stats.stamina : 0,
        powerGain: prevTurn ? turn.stats.power - prevTurn.stats.power : 0,
        gutsGain: prevTurn ? turn.stats.guts - prevTurn.stats.guts : 0,
        witGain: prevTurn ? turn.stats.wit - prevTurn.stats.wit : 0,
      });
    }
  }
  
  return JSON.stringify(records, null, 2);
}

/**
 * 导出CSV格式（方便Excel分析）
 */
export function exportToCSV(sessions: CollectionSession[]): string {
  const headers = [
    "uma", "star", "scenario", "turn", "action",
    "speed", "stamina", "power", "guts", "wit",
    "vital", "motivation", "skillPt", "isFat"
  ];
  
  const rows: string[] = [headers.join(",")];
  
  for (const session of sessions) {
    for (const turn of session.turns) {
      rows.push([
        session.umaName, session.star, session.scenario, turn.turn, turn.action,
        turn.stats.speed, turn.stats.stamina, turn.stats.power, turn.stats.guts, turn.stats.wit,
        turn.vital, turn.motivation, turn.skillPt, turn.isFat ? 1 : 0
      ].join(","));
    }
  }
  
  return rows.join("\n");
}

// ========== 存储大小估算 ==========

export function estimateStorageSize(): string {
  const sessions = getAllSessions();
  const json = JSON.stringify(sessions);
  const kb = (json.length / 1024).toFixed(1);
  return `${kb}KB (${sessions.length}个会话, ${sessions.reduce((s, se) => s + se.turns.length, 0)}条记录)`;
}
