/**
 * 训练决策记录系统
 * 
 * 记录每回合的训练决策，用于：
 * 1. 评分反推（去掉技能分→纯属性分）
 * 2. 最优决策分析（哪些决策导致了高评分）
 * 3. 开局属性校准（检测实际开局是否与数据库匹配）
 */

// 回合行动类型
type TurnAction = "train-speed" | "train-stamina" | "train-power" | "train-guts" | "train-wit" | "rest" | "outing" | "race" | "clinic" | "skill" | "ramen";

// 单回合记录
export interface TurnRecord {
  turn: number;           // 回合数
  action: TurnAction;     // 行动
  beforeStats: FiveStats; // 行动前五维
  afterStats: FiveStats;  // 行动后五维
  vitalBefore: number;    // 行动前体力
  vitalAfter: number;     // 行动后体力
  motivation: number;     // 心情 (1-5)
  skillPt: number;        // 技能点
  isFat: boolean;         // 是否吃胖
  supportCards: string[]; // 选中的支援卡ID
  note?: string;          // 备注
}

// 五维属性
export interface FiveStats {
  speed: number;
  stamina: number;
  power: number;
  guts: number;
  wit: number;
}

// 技能记录
export interface SkillRecord {
  skillId: string;    // 技能ID
  name: string;       // 技能名
  ptCost: number;     // 消耗pt
  turnLearned: number; // 第几回合学的
}

// 因子记录
export interface FactorRecord {
  type: string;       // 因子类型
  stat: string;       // 属性
  value: number;      // 数值
}

// 完整育成记录
export interface NurtureLog {
  id: string;                       // 唯一ID
  timestamp: number;                // 创建时间
  umaCardId: string;                // 马娘卡片ID
  umaName: string;                  // 马娘名
  star: 3 | 4 | 5;                  // 星级
  scenario: string;                 // 剧本ID
  
  // 开局属性
  baseStats: FiveStats;             // 实际开局五维
  
  // 支援卡
  supportCards: string[];           // 6张支援卡ID
  
  // 每回合记录
  turns: TurnRecord[];              // 72回合记录
  
  // 技能
  skills: SkillRecord[];            // 学到的技能
  
  // 因子
  factors: FactorRecord[];          // 继承因子
  
  // 最终结果
  finalStats: FiveStats;            // 最终五维
  finalSkillPt: number;             // 最终技能pt
  finalEvaluation: number;          // 总评分
  skillEvaluation: number;          // 技能分（需要从总分中减去）
  statEvaluation: number;           // 纯属性分（计算得出）
  rank: string;                     // 评级 (UG/UF/UE等)
  
  // 比赛记录
  races: RaceRecord[];              // 参加的比赛
}

// 比赛记录
export interface RaceRecord {
  turn: number;         // 第几回合
  name: string;         // 比赛名
  result: "win" | "lose" | "skip";  // 结果
  fans: number;         // 获得粉丝
  pt: number;           // 获得pt
}

// ========== localStorage 存取 ==========

const STORAGE_KEY = "uma_nurture_logs";

export function saveNurtureLog(log: NurtureLog): void {
  const logs = getAllNurtureLogs();
  const idx = logs.findIndex(l => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function getAllNurtureLogs(): NurtureLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getNurtureLog(id: string): NurtureLog | undefined {
  return getAllNurtureLogs().find(l => l.id === id);
}

export function deleteNurtureLog(id: string): void {
  const logs = getAllNurtureLogs().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

/** 导出JSON */
export function exportLogsToJSON(): string {
  return JSON.stringify(getAllNurtureLogs(), null, 2);
}

/** 导入JSON */
export function importLogsFromJSON(json: string): boolean {
  try {
    const logs: NurtureLog[] = JSON.parse(json);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return true;
  } catch {
    return false;
  }
}

// ========== 创建新记录 ==========

export function createNurtureLog(
  umaCardId: string,
  umaName: string,
  star: 3 | 4 | 5,
  scenario: string,
  baseStats: FiveStats,
  supportCards: string[]
): NurtureLog {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    umaCardId,
    umaName,
    star,
    scenario,
    baseStats,
    supportCards,
    turns: [],
    skills: [],
    factors: [],
    finalStats: { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 },
    finalSkillPt: 0,
    finalEvaluation: 0,
    skillEvaluation: 0,
    statEvaluation: 0,
    rank: "",
    races: []
  };
}

/** 添加回合记录 */
export function addTurnRecord(log: NurtureLog, record: TurnRecord): void {
  log.turns.push(record);
}

/** 更新最终结果 */
export function setFinalResult(
  log: NurtureLog,
  finalStats: FiveStats,
  evaluation: number,
  skillEval: number,
  rank: string
): void {
  log.finalStats = finalStats;
  log.finalEvaluation = evaluation;
  log.skillEvaluation = skillEval;
  log.statEvaluation = evaluation - skillEval;
  log.rank = rank;
}
