// 友人卡详细效果数据
// 【American Dream】カジノドライヴ (Casino Drive)

export interface FriendCardDetail {
  id: number;
  name: string;
  effects: {
    type: string;
    description: string;
    values: Record<number, number>; // level -> value
  }[];
  skills: {
    name: string;
    description: string;
  }[];
  // 育马者杯特殊机制
  breedersCup?: {
    initialBuffPt: number; // 初始剧本buff pt
    extraBuffPt: number;   // 带友人的额外pt
  };
}

export const friendCardDetails: Record<number, FriendCardDetail> = {
  30290: {
    id: 30290,
    name: "【American Dream】カジノドライヴ",
    effects: [
      {
        type: "干劲效果提升",
        description: "提升一起训练后干劲所带来的效果",
        values: { 1: 20, 10: 25, 20: 30, 30: 35, 40: 40, 50: 45 },
      },
      {
        type: "训练效果提升",
        description: "提升一起训练后的效果",
        values: { 1: 1, 10: 2, 20: 4, 30: 6, 40: 8, 50: 10 },
      },
      {
        type: "初始羁绊提升",
        description: "提升开始培育时的初期羁绊量条",
        values: { 1: 25, 10: 30, 20: 35, 30: 40, 40: 45, 50: 50 },
      },
      {
        type: "比赛加成",
        description: "提升参加竞赛后依照结果所能获得的能力值上升量",
        values: { 1: 1, 10: 2, 20: 3, 30: 5, 40: 7, 50: 10 },
      },
      {
        type: "粉丝数加成",
        description: "提升参加竞赛后依照结果所能获得的粉丝上升量",
        values: { 1: 1, 10: 2, 20: 3, 30: 5, 40: 7, 50: 10 },
      },
      {
        type: "事件恢复提升",
        description: "提升从此支援卡的事件中恢复的体力",
        values: { 1: 40, 10: 45, 20: 50, 30: 55, 40: 60, 50: 70 },
      },
      {
        type: "事件效果提升",
        description: "提升从此支援卡的事件中获得的能力值上升量",
        values: { 1: 20, 10: 25, 20: 30, 30: 35, 40: 40, 50: 50 },
      },
      {
        type: "失败率下降",
        description: "降低一起训练时的失败率",
        values: { 1: 10, 10: 15, 20: 20, 30: 25, 40: 30, 50: 35 },
      },
      {
        type: "体力消耗减少",
        description: "减少一起训练时消耗的体力",
        values: { 1: 15, 10: 18, 20: 21, 30: 24, 40: 27, 50: 30 },
      },
      {
        type: "初始技能点提升",
        description: "开始训练时的初始技能点增加",
        values: { 1: 30, 10: 35, 20: 40, 30: 45, 40: 50, 50: 60 },
      },
    ],
    // 特殊效果：羁绊60以上获得力量加成(1)和技能点加成(1)
    skills: [
      {
        name: "Uma Stan",
        description: "Slightly increase velocity when close to many runners.",
      },
      {
        name: "Slipstream",
        description: "Slightly decrease wind resistance when following directly behind another runner.",
      },
      {
        name: "In the Right Place!",
        description: "If another girl has been right in front of you for at least three seconds, your speed will increase.",
      },
      {
        name: "Homestretch Haste",
        description: "Slightly increase velocity in the last spurt.",
      },
    ],
    // 育马者杯特殊机制
    breedersCup: {
      initialBuffPt: 5,    // 初始剧本buff pt
      extraBuffPt: 5,      // 带友人的额外5pt
    },
  },
};

// 剧本Buff类型
export type BuffColor = "green" | "blue" | "pink";

export interface ScenarioBuff {
  id: number;
  name: string;
  color: BuffColor;
  star: number; // 1-5星
  description: string;
}

// 育马者杯剧本Buff PT系统
// 初始5pt，带友人额外+5pt = 共10pt
// 用于选择绿/蓝/粉buff
export const BREEDERS_CUP_BUFFS: ScenarioBuff[] = [
  // 绿色Buff (训练相关)
  { id: 1, name: "训练效果UP", color: "green", star: 1, description: "训练效果+5%" },
  { id: 2, name: "体力消耗DOWN", color: "green", star: 1, description: "训练体力消耗-10%" },
  { id: 3, name: "羁绊上升UP", color: "green", star: 1, description: "羁绊上升量+10%" },
  { id: 4, name: "训练效果UP+", color: "green", star: 2, description: "训练效果+10%" },
  { id: 5, name: "体力消耗DOWN+", color: "green", star: 2, description: "训练体力消耗-20%" },
  { id: 6, name: "彩圈率UP", color: "green", star: 3, description: "彩圈出现率+15%" },
  // 蓝色Buff (属性相关)
  { id: 7, name: "速度加成", color: "blue", star: 1, description: "训练时速度额外+3" },
  { id: 8, name: "耐力加成", color: "blue", star: 1, description: "训练时耐力额外+3" },
  { id: 9, name: "力量加成", color: "blue", star: 1, description: "训练时力量额外+3" },
  { id: 10, name: "根性加成", color: "blue", star: 1, description: "训练时根性额外+3" },
  { id: 11, name: "智力加成", color: "blue", star: 1, description: "训练时智力额外+3" },
  { id: 12, name: "全属性加成", color: "blue", star: 3, description: "训练时全属性额外+5" },
  // 粉色Buff (技能/比赛相关)
  { id: 13, name: "技能点UP", color: "pink", star: 1, description: "获得技能点+5%" },
  { id: 14, name: "比赛加成", color: "pink", star: 1, description: "比赛后属性获得+5%" },
  { id: 15, name: "粉丝数UP", color: "pink", star: 1, description: "获得粉丝数+10%" },
  { id: 16, name: "技能Hint率UP", color: "pink", star: 2, description: "技能Hint获得率+15%" },
  { id: 17, name: "比赛加成+", color: "pink", star: 2, description: "比赛后属性获得+10%" },
  { id: 18, name: "技能点UP+", color: "pink", star: 3, description: "获得技能点+15%" },
];

// 育马者杯buff pt消耗
export const BUFF_PT_COST = {
  1: 1, // 1星buff消耗1pt
  2: 2, // 2星buff消耗2pt
  3: 3, // 3星buff消耗3pt
};

// 计算可用buff pt
export function calculateBuffPt(hasFriend: boolean): number {
  return 5 + (hasFriend ? 5 : 0); // 初始5pt + 友人额外5pt
}
