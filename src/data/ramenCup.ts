// 拉面杯剧本数据
// 虚构剧本 - 除了基础训练加成，不加剧本buff

export interface RamenType {
  id: number;
  name: string;
  description: string;
  costPt: number;       // 消耗技能点
  vitalRecover: number; // 恢复体力
  motivationChange: number; // 心情变化
  tempTrainBonus: number;   // 临时训练加成(持续X回合)
  tempTrainTurns: number;   // 临时加成持续回合
  isFat: boolean;           // 是否会导致吃胖
  specialEffect?: string;   // 特殊效果描述
  curesFat?: boolean;       // 是否能消除吃胖
}

// 拉面菜单
export const RAMEN_MENU: RamenType[] = [
  {
    id: 1,
    name: "清汤拉面",
    description: "清淡爽口的传统拉面，恢复体力不会吃胖",
    costPt: 15,
    vitalRecover: 30,
    motivationChange: 0,
    tempTrainBonus: 0,
    tempTrainTurns: 0,
    isFat: false,
  },
  {
    id: 2,
    name: "味噌拉面",
    description: "浓郁的味噌汤底，恢复大量体力，有概率吃胖",
    costPt: 25,
    vitalRecover: 55,
    motivationChange: 0,
    tempTrainBonus: 0,
    tempTrainTurns: 0,
    isFat: true, // 会导致吃胖
  },
  {
    id: 3,
    name: "豚骨拉面",
    description: "浓郁的豚骨汤底，恢复体力的同时提升下回合训练效果",
    costPt: 40,
    vitalRecover: 45,
    motivationChange: 1, // +1 心情
    tempTrainBonus: 0.15, // +15% 训练加成
    tempTrainTurns: 2,
    isFat: true, // 会导致吃胖
    specialEffect: "下2回合训练效果+15%",
  },
  {
    id: 4,
    name: "激辛拉面",
    description: "超辣拉面！恢复少量体力但大幅提升心情和训练热情",
    costPt: 35,
    vitalRecover: 20,
    motivationChange: 2, // +2 心情
    tempTrainBonus: 0.25, // +25% 训练加成
    tempTrainTurns: 1,
    isFat: false, // 辣的不胖
    specialEffect: "下1回合训练效果+25%",
  },
  {
    id: 5,
    name: "海鲜拉面",
    description: "豪华海鲜拉面，全面恢复体力和心情，低概率吃胖",
    costPt: 50,
    vitalRecover: 70,
    motivationChange: 1,
    tempTrainBonus: 0.1,
    tempTrainTurns: 3,
    isFat: false, // 海鲜低脂
    specialEffect: "下3回合训练效果+10%",
  },
  {
    id: 6,
    name: "二郎系拉面",
    description: "超大份！恢复巨量体力但会吃胖，训练效果小幅下降",
    costPt: 30,
    vitalRecover: 90,
    motivationChange: -1, // -1 心情（吃太撑了）
    tempTrainBonus: -0.05, // -5% 训练加成（吃太撑跑不动）
    tempTrainTurns: 2,
    isFat: true, // 必吃胖
    specialEffect: "下2回合训练效果-5%（吃太撑）",
  },
  {
    id: 7,
    name: "蔬菜沙拉面",
    description: "减肥专用！消除吃胖状态，恢复少量体力",
    costPt: 20,
    vitalRecover: 15,
    motivationChange: -1, // 不好吃所以心情-1
    tempTrainBonus: 0,
    tempTrainTurns: 0,
    isFat: false,
    curesFat: true, // 消除吃胖
    specialEffect: "消除吃胖状态",
  },
];

// 拉面杯剧本配置
export interface RamenCupConfig {
  totalTurns: number;
  trainingTurns: number;
  raceCount: number;
  // 特殊机制：每回合有概率触发拉面事件
  ramenEventChance: number; // 概率
  // 免费拉面次数（剧本赠送）
  freeRamenCount: number;
}

export const RAMEN_CUP_CONFIG: RamenCupConfig = {
  totalTurns: 72,
  trainingTurns: 58,
  raceCount: 14,
  ramenEventChance: 0.15, // 15%概率每回合触发拉面事件
  freeRamenCount: 3, // 剧本赠送3次免费吃拉面
};

// 临时训练加成状态
export interface RamenBuff {
  ramenId: number;
  trainBonus: number;    // 训练加成百分比
  remainingTurns: number; // 剩余回合
}

// 吃拉面
export function eatRamen(
  ramen: RamenType,
  currentVital: number,
  maxVital: number,
  currentMotivation: number,
  currentIsFat: boolean,
  skillPt: number,
  freeRamenLeft: number
): {
  newVital: number;
  newMotivation: number;
  newIsFat: boolean;
  newSkillPt: number;
  newFreeRamenLeft: number;
  buff: RamenBuff | null;
  success: boolean;
  message: string;
} {
  // 检查技能点是否足够
  const actualCost = freeRamenLeft > 0 ? 0 : ramen.costPt;
  if (skillPt < actualCost) {
    return {
      newVital: currentVital,
      newMotivation: currentMotivation,
      newIsFat: currentIsFat,
      newSkillPt: skillPt,
      newFreeRamenLeft: freeRamenLeft,
      buff: null,
      success: false,
      message: `技能点不足！需要${actualCost}pt`,
    };
  }

  // 计算新状态
  const newVital = Math.min(maxVital, currentVital + ramen.vitalRecover);
  const newMotivation = Math.max(1, Math.min(5, currentMotivation + ramen.motivationChange));
  
  // 吃胖逻辑
  let newIsFat = currentIsFat;
  if (ramen.curesFat) {
    newIsFat = false; // 蔬菜沙拉面消除吃胖
  } else if (ramen.isFat) {
    newIsFat = true; // 吃胖了
  }
  
  const newSkillPt = skillPt - actualCost;
  const newFreeRamenLeft = Math.max(0, freeRamenLeft - 1);

  // 创建buff
  let buff: RamenBuff | null = null;
  if (ramen.tempTrainBonus !== 0 && ramen.tempTrainTurns > 0) {
    buff = {
      ramenId: ramen.id,
      trainBonus: ramen.tempTrainBonus,
      remainingTurns: ramen.tempTrainTurns,
    };
  }

  let message = `吃了${ramen.name}！`;
  if (ramen.vitalRecover > 0) message += ` 体力+${ramen.vitalRecover}`;
  if (ramen.motivationChange > 0) message += ` 心情+${ramen.motivationChange}`;
  if (ramen.motivationChange < 0) message += ` 心情${ramen.motivationChange}`;
  if (ramen.isFat && !ramen.curesFat) message += ` 【吃胖了！】`;
  if (ramen.curesFat && currentIsFat) message += ` 【吃胖消除了！】`;
  if (ramen.specialEffect) message += ` [${ramen.specialEffect}]`;
  if (freeRamenLeft > 0 && actualCost === 0) message += " (免费!)";

  return {
    newVital,
    newMotivation,
    newIsFat,
    newSkillPt,
    newFreeRamenLeft,
    buff,
    success: true,
    message,
  };
}

// 每回合结束更新buff
export function updateRamenBuffs(buffs: RamenBuff[]): RamenBuff[] {
  return buffs
    .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
    .filter((b) => b.remainingTurns > 0);
}

// 获取总训练加成
export function getTotalTrainBonus(buffs: RamenBuff[]): number {
  let bonus = 1.0;
  buffs.forEach((b) => {
    bonus += b.trainBonus;
  });
  return Math.max(0.5, bonus); // 最低50%
}
