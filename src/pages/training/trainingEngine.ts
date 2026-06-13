/**
 * 赛马娘训练引擎 - 基于 UmaSimulator 核心算法
 * 参考: https://github.com/xulai1001/UmaSimulator
 * 参考: https://github.com/hzyhhzy/UmaAi
 * 
 * 训练数值计算系统（下层+上层分离）:
 * L = k * B * G (下层)
 * P1 = L + k * C
 * P2 = P1 * (1 + 红buff倍率)
 * P3 = P2 + 蓝buff
 * T = P3 * (1 + link数加成 + 大会优胜数加成)
 * 上层 U = T - L
 * 
 * 训练等级提升:
 * (休息?3:0) + link卡数 + (3+f(人头数))*(彩圈?2:1)
 * f(0 1 2 3 4 5)=[0,1,2,2,3,3]
 * 
 * 支援卡乘区:
 * (1+总训练加成)(1+干劲系数*(1+总干劲加成))(1+0.05*总卡数)(1+友情1)(1+友情2)...
 */

// ===================== 类型定义 =====================
export interface TrainingState {
  // 五维属性
  speed: number;
  stamina: number;
  power: number;
  guts: number;
  wit: number;
  
  // 五维属性上限
  speedLimit: number;
  staminaLimit: number;
  powerLimit: number;
  gutsLimit: number;
  witLimit: number;
  
  // 五维成长率
  speedBonus: number;
  staminaBonus: number;
  powerBonus: number;
  gutsBonus: number;
  witBonus: number;
  
  // 资源
  vital: number;        // 体力
  maxVital: number;     // 体力上限
  motivation: number;   // 干劲 1-5
  skillPt: number;      // 技能点
  skillScore: number;   // 已买技能分数
  
  // 回合
  turn: number;
  totalTurns: number;
  
  // 训练等级计数（每点4下加一级）
  trainLevelCount: [number, number, number, number, number];
  
  // 支援卡羁绊
  cardBond: number[];   // 每张卡的羁绊值 0-100
  
  // 剧本buff
  scenarioBuffs: ScenarioBuff[];
  
  // Link系统
  linkCount: number;    // Link卡数量
  linkBonus: number[];  // Link加成 [速,耐,力,根,智,pt]
  
  // 竞技Lv（休息/外出后提升）
  arenaLevel: number;   // 竞技场等级
  
  // 连续比赛计数
  consecutiveRaces: number;
  
  // 状态标记
  isQieZhe: boolean;        // 切者
  isAiJiao: boolean;        // 爱娇
  isPositiveThinking: boolean; // 积极思考
  isFat: boolean;            // 吃胖状态（负面buff，吃胖后速度训练无效）
}

export interface ScenarioBuff {
  id: number;
  color: 'blue' | 'green' | 'red';
  star: number;
  name: string;
  isActive: boolean;
}

export interface SupportCard {
  id: number;
  name: string;
  type: string;     // 速度/耐力/力量/根性/智力/友人
  rarity: string;   // SSR/SR
  bond: number;     // 羁绊 0-100
  isShining: boolean; // 是否彩圈
  isLink: boolean;  // 是否Link卡
}

export interface TrainingResult {
  statGains: [number, number, number, number, number];  // 速耐力根智
  ptGain: number;
  vitalChange: number;  // 负的体力消耗
  bondIncrease: number[]; // 每张卡羁绊增加值
  trainLevelUp: boolean;  // 训练等级是否提升
  success: boolean;       // 训练是否成功
  isShining: boolean[];   // 哪些卡闪彩了
}

export interface TrainingConfig {
  // 基础训练值 (对应设施等级1-5)
  baseGains: [number, number, number, number, number]; // [7, 8, 10, 11, 12]
  
  // 干劲系数 1-5
  motivationMult: [number, number, number, number, number]; // [0.8, 0.9, 1.0, 1.1, 1.2]
  
  // 人头→等级提升函数 f(0 1 2 3 4 5)=[0,1,2,2,3,3]
  headCountToLevel: [number, number, number, number, number, number];
  
  // 支援卡基础加成
  cardBaseBonus: number;  // 每张卡基础+2属性
  cardBondBonus: number;  // 羁绊加成系数 0.2
  
  // 友情加成
  friendshipBonus: number; // 0.05 * 卡数
  
  // 训练失败率
  baseFailRate: number;    // 基础失败率
  failRateEnergyThreshold: number[]; // 体力阈值影响失败率
}

export const DEFAULT_CONFIG: TrainingConfig = {
  baseGains: [7, 8, 10, 11, 12],  // 设施等级1-5的基础值
  motivationMult: [0.8, 0.9, 1.0, 1.1, 1.2], // 绝不调到绝好调
  headCountToLevel: [0, 1, 2, 2, 3, 3], // 人头数→等级提升 f(0 1 2 3 4 5)
  cardBaseBonus: 2,  // 每张卡+2属性
  cardBondBonus: 0.2, // 羁绊100时+20%
  friendshipBonus: 0.05, // 每张卡+5%友情
  baseFailRate: 0.05, // 5%基础失败率
  failRateEnergyThreshold: [0, 15, 0.15, 30, 0.1, 50, 0.05, 100, 0], // 体力<15:15%, <30:10%, <50:5%
};

// ===================== 训练数值计算 =====================

/**
 * 计算支援卡倍率 k = 人头 * 训练加成 * 干劲加成 * 友情加成
 */
export function calculateCardMultiplier(
  cards: SupportCard[],
  motivation: number,
  config: TrainingConfig = DEFAULT_CONFIG
): number {
  const headCount = cards.length;
  if (headCount === 0) return 1.0;
  
  // 训练加成 = sum(每张卡的训练加成)
  let trainBonus = 0;
  let ganjinBonus = 0; // 干劲加成
  let youqingBonus = 1.0; // 友情加成（乘算）
  
  cards.forEach(card => {
    // 基础训练加成
    trainBonus += config.cardBaseBonus;
    
    // 羁绊加成
    const bondFactor = 1.0 + (card.bond / 100) * config.cardBondBonus;
    trainBonus *= bondFactor;
    
    // 友情加成（彩圈卡双倍）
    if (card.isShining) {
      youqingBonus *= (1 + config.friendshipBonus * 2);
    } else {
      youqingBonus *= (1 + config.friendshipBonus);
    }
    
    // 干劲加成
    ganjinBonus += 0.05; // 每张卡+5%干劲
  });
  
  // 干劲系数
  const motivationCoeff = config.motivationMult[motivation - 1] || 1.0;
  
  // k = (1+总训练加成) * (1+干劲系数*(1+总干劲加成)) * (1+0.05*总卡数) * 友情加成
  const k = (1 + trainBonus) * 
            (1 + motivationCoeff * (1 + ganjinBonus)) * 
            (1 + config.friendshipBonus * headCount) * 
            youqingBonus;
  
  return k;
}

/**
 * 计算训练等级提升
 * (休息?3:0) + link卡数 + (3+f(人头数))*(彩圈?2:1)
 */
export function calculateTrainLevelIncrease(
  headCount: number,
  shiningCount: number,
  linkCount: number,
  hadRest: boolean,
  config: TrainingConfig = DEFAULT_CONFIG
): number {
  const restBonus = hadRest ? 3 : 0;
  const linkBonus = linkCount;
  const baseLevel = 3 + config.headCountToLevel[Math.min(headCount, 5)];
  const shiningMult = shiningCount > 0 ? 2 : 1;
  
  let total = restBonus + linkBonus + baseLevel * shiningMult;
  
  // 上限检查（基于UmaSimulator实测数据）
  const maxWithoutBonuses = 10; // 不靠加成、不靠友人的上限
  const headAndShining = baseLevel * shiningMult;
  if (headAndShining > maxWithoutBonuses) {
    total = Math.min(total, maxWithoutBonuses + restBonus + linkBonus);
  }
  
  return Math.min(total, 17); // 绝对上限17
}

/**
 * 计算训练数值（下层+上层）
 */
export function calculateTrainingValue(
  trainType: number, // 0=速 1=耐 2=力 3=根 4=智
  state: TrainingState,
  cards: SupportCard[],
  config: TrainingConfig = DEFAULT_CONFIG
): TrainingResult {
  const facilityLevel = Math.min(5, Math.floor(state.trainLevelCount[trainType] / 4) + 1);
  const baseGain = config.baseGains[facilityLevel - 1];
  
  // 支援卡倍率 k
  const k = calculateCardMultiplier(cards, state.motivation, config);
  
  // 马娘成长率 G
  const growthRate = [
    state.speedBonus,
    state.staminaBonus,
    state.powerBonus,
    state.gutsBonus,
    state.witBonus,
  ][trainType] / 100 + 1;
  
  // 基础值 B = 设施基础值 + 支援卡加成
  const cardBonus = cards.reduce((sum, c) => sum + config.cardBaseBonus * (1 + (c.bond / 100) * config.cardBondBonus), 0);
  const B = baseGain + cardBonus;
  
  // Link基础值加成 C
  const C = state.linkBonus[trainType] || 0;
  
  // 下层 L = k * B * G
  const L = k * B * growthRate;
  
  // P1 = L + k * C
  const P1 = L + k * C;
  
  // P2 = P1 * (1 + 红buff倍率)
  const redBuffMult = calculateRedBuffMultiplier(state.scenarioBuffs, trainType);
  const P2 = P1 * (1 + redBuffMult);
  
  // P3 = P2 + 蓝buff
  const blueBuffValue = calculateBlueBuffValue(state.scenarioBuffs, trainType);
  const P3 = P2 + blueBuffValue;
  
  // T = P3 * (1 + link数加成 + 大会优胜数加成)
  const linkArenaBonus = state.linkCount * 0.05 + (state.arenaLevel > 0 ? 0.1 : 0);
  const T = P3 * (1 + linkArenaBonus);
  
  // 上层 U = T - L
  const U = T - L;
  
  // 总属性 = round5(L + U)
  const totalGain = round5(L + U);
  
  // 体力消耗
  const _vitalCost = 10 + facilityLevel * 2 + cards.length; // simplified vital cost
  
  // 训练等级提升
  const shiningCount = cards.filter(c => c.isShining).length;
  const linkCount = cards.filter(c => c.isLink).length;
  const levelIncrease = calculateTrainLevelIncrease(
    cards.length,
    shiningCount,
    linkCount,
    false, // 这里假设没有休息
    config
  );
  
  // 失败率
  const failRate = calculateFailRate(state, _vitalCost, config);
  const success = Math.random() > failRate;
  
  // 羁绊增加值
  const bondIncrease = cards.map(c => {
    if (c.isShining) return 8; // 彩圈+8
    return 5; // 普通+5
  });
  
  const statGains: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  statGains[trainType] = success ? totalGain : round5(totalGain * 0.3); // 失败只获得30%
  
  // pt获得
  const ptGain = success ? round5(cards.length * 2 + (shiningCount > 0 ? 3 : 0)) : 0;
  
  return {
    statGains,
    ptGain,
    vitalChange: -_vitalCost,
    bondIncrease,
    trainLevelUp: levelIncrease > 0,
    success,
    isShining: cards.map(c => c.isShining),
  };
}

// ===================== 辅助函数 =====================

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

function calculateRedBuffMultiplier(buffs: ScenarioBuff[], _trainType: number): number {
  let mult = 0;
  buffs.filter(b => b.isActive && b.color === 'red').forEach(b => {
    mult += b.star * 0.05; // 每星+5%
  });
  return mult;
}

function calculateBlueBuffValue(buffs: ScenarioBuff[], _trainType: number): number {
  let value = 0;
  buffs.filter(b => b.isActive && b.color === 'blue').forEach(b => {
    value += b.star * 3; // 每星+3属性
  });
  return value;
}

function calculateFailRate(
  state: TrainingState,
  _vitalCost: number,
  config: TrainingConfig
): number {
  let rate = config.baseFailRate;
  
  // 体力不足增加失败率
  for (let i = 0; i < config.failRateEnergyThreshold.length; i += 2) {
    const threshold = config.failRateEnergyThreshold[i];
    const penalty = config.failRateEnergyThreshold[i + 1];
    if (state.vital < threshold) {
      rate += penalty;
      break;
    }
  }
  
  // 干劲影响
  if (state.motivation <= 2) rate += 0.05;
  if (state.motivation >= 4) rate -= 0.03;
  
  return Math.max(0, Math.min(0.99, rate));
}

// ===================== 初始状态生成 =====================

export function createInitialState(
  _umaId: number,
  umaStar: number,
  totalTurns: number
): TrainingState {
  // 默认马娘数据（如果找不到特定马娘）
  const defaultInitial = [100, 100, 100, 100, 100];
  const defaultBonus = [0, 0, 0, 0, 0];
  
  return {
    speed: defaultInitial[0] - 10 * (5 - umaStar),
    stamina: defaultInitial[1] - 10 * (5 - umaStar),
    power: defaultInitial[2] - 10 * (5 - umaStar),
    guts: defaultInitial[3] - 10 * (5 - umaStar),
    wit: defaultInitial[4] - 10 * (5 - umaStar),
    
    speedLimit: 1200,
    staminaLimit: 1200,
    powerLimit: 1200,
    gutsLimit: 1200,
    witLimit: 1200,
    
    speedBonus: defaultBonus[0],
    staminaBonus: defaultBonus[1],
    powerBonus: defaultBonus[2],
    gutsBonus: defaultBonus[3],
    witBonus: defaultBonus[4],
    
    vital: 100,
    maxVital: 100,
    motivation: 3, // 好调
    skillPt: 120,
    skillScore: umaStar >= 3 ? 170 * (umaStar - 2) : 120 * umaStar,
    
    turn: 0,
    totalTurns,
    
    trainLevelCount: [0, 0, 0, 0, 0],
    cardBond: [0, 0, 0, 0, 0, 0],
    scenarioBuffs: [],
    linkCount: 0,
    linkBonus: [0, 0, 0, 0, 0, 0],
    arenaLevel: 0,
    consecutiveRaces: 0,
    
    isQieZhe: false,
    isAiJiao: false,
    isPositiveThinking: false,
    isFat: false,
  };
}

// ===================== 休息/外出效果 =====================

/**
 * 休息效果: +50体力, 竞技Lv准备提升
 */
export function applyRest(state: TrainingState): TrainingState {
  return {
    ...state,
    vital: Math.min(state.maxVital, state.vital + 50),
    turn: state.turn + 1,
    consecutiveRaces: 0,
    // 休息后下一回合竞技Lv提升buff
    arenaLevel: state.arenaLevel + 1,
  };
}

/**
 * 外出效果: +70体力, +心情, 竞技Lv准备提升
 */
export function applyOuting(state: TrainingState): TrainingState {
  const newMotivation = Math.min(5, state.motivation + 1);
  return {
    ...state,
    vital: Math.min(state.maxVital, state.vital + 70),
    motivation: newMotivation,
    turn: state.turn + 1,
    consecutiveRaces: 0,
    arenaLevel: state.arenaLevel + 1,
  };
}

/**
 * 比赛效果
 */
export function applyRace(state: TrainingState): TrainingState {
  const newConsecutive = state.consecutiveRaces + 1;
  let newMotivation = state.motivation;

  // 连续4次比赛掉心情
  if (newConsecutive >= 4) {
    newMotivation = Math.max(1, newMotivation - 1);
  }

  return {
    ...state,
    skillPt: state.skillPt + round5(35),
    turn: state.turn + 1,
    consecutiveRaces: newConsecutive,
    motivation: newMotivation,
  };
}

/**
 * 保健室（医务室）效果：消除所有debuff（吃胖等）
 * 注意：保健室消耗1回合，不恢复体力
 */
export function applyClinic(state: TrainingState): TrainingState {
  return {
    ...state,
    turn: state.turn + 1,
    consecutiveRaces: 0,
    // 消除所有debuff
    isFat: false,
  };
}

// ===================== 青春杯特殊机制 =====================

/**
 * 青春杯支援卡能量系统
 * 支援卡拥有独立能量条（0-700），只影响团队比赛
 */
export interface AoharuCardEnergy {
  cardId: number;
  energy: number;      // 0-700
  maxEnergy: number;   // 700
}

export function createAoharuCardEnergy(cardId: number): AoharuCardEnergy {
  return {
    cardId,
    energy: 0,  // 初始为0，随训练自动成长
    maxEnergy: 700,
  };
}

/**
 * 青春杯训练后更新支援卡能量
 * 每次训练后，在场的支援卡能量+一定值
 */
export function updateAoharuEnergy(
  energies: AoharuCardEnergy[],
  trainedCardIndices: number[], // 哪些卡参与了训练
  trainSuccess: boolean
): AoharuCardEnergy[] {
  return energies.map((e, idx) => {
    if (!trainedCardIndices.includes(idx)) return e;
    
    // 训练成功后能量+更多
    const gain = trainSuccess ? 15 : 8;
    return {
      ...e,
      energy: Math.min(e.maxEnergy, e.energy + gain),
    };
  });
}

// ===================== 导出 =====================
export default {
  calculateCardMultiplier,
  calculateTrainLevelIncrease,
  calculateTrainingValue,
  createInitialState,
  applyRest,
  applyOuting,
  applyRace,
  applyClinic,
  createAoharuCardEnergy,
  updateAoharuEnergy,
};
