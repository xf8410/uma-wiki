// 关系性组数据
export interface RelationGroup {
  name: string;
  pt: number;
  col1: boolean;
  col2: boolean;
  col3: boolean;
}

export const relationGroups: RelationGroup[] = [
  { name: "ハルウララのお友達", pt: 8, col1: true, col2: false, col3: false },
  { name: "先行グループ", pt: 7, col1: true, col2: true, col3: true },
  { name: "マイルグループ", pt: 7, col1: true, col2: true, col3: true },
  { name: "中距離グループ", pt: 7, col1: true, col2: true, col3: true },
  { name: "芝グループ", pt: 7, col1: true, col2: true, col3: true },
  { name: "ダートグループ", pt: 7, col1: true, col2: false, col3: false },
  { name: "中等部2年", pt: 2, col1: true, col2: true, col3: false },
  { name: "中等部3年", pt: 2, col1: false, col2: false, col3: true },
  { name: "美浦寮", pt: 2, col1: false, col2: false, col3: true },
  { name: "栗東寮", pt: 2, col1: true, col2: true, col3: false },
  { name: "同室", pt: 2, col1: false, col2: true, col3: false },
  { name: "同室", pt: 2, col1: false, col2: false, col3: true },
  { name: "同室", pt: 2, col1: true, col2: false, col3: false },
  { name: "同クラス", pt: 2, col1: false, col2: false, col3: true },
  { name: "同クラス", pt: 2, col1: false, col2: true, col3: false },
  { name: "同クラス", pt: 2, col1: true, col2: false, col3: false },
  { name: "友人", pt: 2, col1: false, col2: false, col3: true },
  { name: "友人", pt: 2, col1: false, col2: false, col3: true },
  { name: "友人", pt: 2, col1: false, col2: true, col3: false },
  { name: "ダートに出走", pt: 2, col1: true, col2: false, col3: false },
  { name: "海外レースに出走", pt: 2, col1: true, col2: false, col3: true },
  { name: "血縁関係", pt: 1, col1: false, col2: true, col3: false },
  { name: "血縁関係", pt: 1, col1: false, col2: true, col3: false },
  { name: "同時期に活躍", pt: 1, col1: false, col2: false, col3: true },
  { name: "同時期に活躍", pt: 1, col1: true, col2: false, col3: false },
  { name: "同時期に活躍", pt: 1, col1: false, col2: true, col3: false },
  { name: "フェブラリーS", pt: 1, col1: true, col2: false, col3: false },
  { name: "大阪杯", pt: 1, col1: false, col2: true, col3: false },
  { name: "桜花賞", pt: 1, col1: false, col2: true, col3: false },
  { name: "NHKマイルC", pt: 1, col1: false, col2: false, col3: true },
  { name: "安田記念", pt: 1, col1: true, col2: false, col3: false },
  { name: "秋華賞", pt: 1, col1: false, col2: true, col3: false },
  { name: "天皇賞（秋）", pt: 1, col1: true, col2: false, col3: false },
  { name: "エリザベス女王杯", pt: 1, col1: false, col2: true, col3: false },
  { name: "マイルCS", pt: 1, col1: true, col2: false, col3: false },
  { name: "ジャパンカップ", pt: 1, col1: false, col2: false, col3: true },
  { name: "有馬記念", pt: 1, col1: false, col2: true, col3: false },
  { name: "マイルチャンピオンシップ南部杯", pt: 1, col1: true, col2: false, col3: false },
  { name: "全日本ジュニア優駿", pt: 1, col1: true, col2: false, col3: false },
  { name: "???", pt: 1, col1: true, col2: false, col3: false },
  { name: "???", pt: 1, col1: false, col2: false, col3: true },
  { name: "牡馬", pt: 1, col1: true, col2: false, col3: true },
  { name: "牝馬", pt: 1, col1: false, col2: true, col3: false },
  { name: "???", pt: 1, col1: true, col2: true, col3: true },
  { name: "???", pt: 1, col1: false, col2: true, col3: false },
  { name: "???", pt: 1, col1: true, col2: false, col3: false },
  { name: "1995年生まれ", pt: 1, col1: false, col2: false, col3: true },
  { name: "1997年生まれ", pt: 1, col1: true, col2: false, col3: false },
  { name: "2004年生まれ", pt: 1, col1: false, col2: true, col3: false },
  { name: "3月生まれ", pt: 1, col1: false, col2: false, col3: true },
  { name: "5月生まれ", pt: 1, col1: true, col2: true, col3: false },
  { name: "長期期間活躍", pt: 1, col1: true, col2: false, col3: false },
  { name: "牝馬三冠路線", pt: 1, col1: false, col2: true, col3: false },
  { name: "秋シニア路線", pt: 1, col1: true, col2: true, col3: false },
  { name: "ジュニアGⅠ勝利", pt: 1, col1: true, col2: false, col3: false },
  { name: "マイルに出走", pt: 1, col1: true, col2: true, col3: true },
  { name: "ライバル", pt: 1, col1: false, col2: false, col3: true },
  { name: "ライバル", pt: 1, col1: false, col2: false, col3: true },
  { name: "ライバル", pt: 1, col1: false, col2: true, col3: false },
];

// 用户提供的真实排行榜数据 (合计值)
export const realCompatibilityTotal: Record<string, number> = {
  "104301": 3010, // 爱丽数码
  "108501": 2845, // 贵妇人
  "100801": 2843, // 伏特加
  "101301": 2790, // 目白麦昆
  "101501": 2785, // 好歌剧
  "101601": 2777, // 成田白仁
  "100901": 2774, // 大和赤骥
  "102301": 2769, // 琵琶晨光
  "101701": 2745, // 鲁道夫象征
  "100701": 2740, // 小栗帽
};
