/**
 * 赛马娘基础属性数据库
 * 记录每个马娘3-5星的开局属性（初始值）
 * 
 * 规则：
 * - 只录入3-5星数据（1-2星不录入，但可升到3星后使用3星数据）
 * - 开局属性是育成开始时的基础五维数值
 * - 用于训练数据分析时的校准和评分反推
 * 
 * 数据来源：bwiki / GameTora / 实测
 */

export interface UmaBaseStats {
  cardId: string;       // 卡片ID
  nameCN: string;       // 中文名
  nameJP: string;       // 日文名
  star3: StarStats;     // 3星属性
  star4: StarStats;     // 4星属性
  star5: StarStats;     // 5星属性
  aptitude: string;     // 距离适性标签（短/英/中/长）
  role: string;         // 跑法标签（逃/先/差/追）
}

export interface StarStats {
  speed: number;        // 速度
  stamina: number;      // 耐力
  power: number;        // 力量
  guts: number;         // 根性
  wit: number;          // 智力
}

// ========== 马娘基础属性数据 ==========

export const umaBaseStats: UmaBaseStats[] = [
  // === 特别周系列 ===
  {
    cardId: "100101", nameCN: "特别周", nameJP: "スペシャルウィーク",
    star3: { speed: 88, stamina: 88, power: 78, guts: 96, wit: 86 },
    star4: { speed: 98, stamina: 98, power: 88, guts: 106, wit: 96 },
    star5: { speed: 108, stamina: 108, power: 98, guts: 116, wit: 106 },
    aptitude: "中", role: "先"
  },
  {
    cardId: "100102", nameCN: "泳装特别周", nameJP: "スペシャルウィーク",
    star3: { speed: 85, stamina: 90, power: 85, guts: 88, wit: 88 },
    star4: { speed: 95, stamina: 100, power: 95, guts: 98, wit: 98 },
    star5: { speed: 105, stamina: 110, power: 105, guts: 108, wit: 108 },
    aptitude: "中", role: "差"
  },
  {
    cardId: "100103", nameCN: "中山特别周", nameJP: "スペシャルウィーク",
    star3: { speed: 82, stamina: 95, power: 80, guts: 92, wit: 85 },
    star4: { speed: 92, stamina: 105, power: 90, guts: 102, wit: 95 },
    star5: { speed: 102, stamina: 115, power: 100, guts: 112, wit: 105 },
    aptitude: "中", role: "先"
  },
  // === 无声铃鹿系列 ===
  {
    cardId: "100201", nameCN: "无声铃鹿", nameJP: "サイレンススズカ",
    star3: { speed: 100, stamina: 64, power: 70, guts: 96, wit: 86 },
    star4: { speed: 110, stamina: 74, power: 80, guts: 106, wit: 96 },
    star5: { speed: 120, stamina: 84, power: 90, guts: 116, wit: 106 },
    aptitude: "英", role: "逃"
  },
  {
    cardId: "100202", nameCN: "泳装无声铃鹿", nameJP: "サイレンススズカ",
    star3: { speed: 98, stamina: 75, power: 72, guts: 92, wit: 88 },
    star4: { speed: 108, stamina: 85, power: 82, guts: 102, wit: 98 },
    star5: { speed: 118, stamina: 95, power: 92, guts: 112, wit: 108 },
    aptitude: "短", role: "逃"
  },
  // === 东海帝皇系列 ===
  {
    cardId: "100301", nameCN: "东海帝皇", nameJP: "トウカイテイオー",
    star3: { speed: 85, stamina: 78, power: 76, guts: 100, wit: 88 },
    star4: { speed: 95, stamina: 88, power: 86, guts: 110, wit: 98 },
    star5: { speed: 105, stamina: 98, power: 96, guts: 120, wit: 108 },
    aptitude: "中", role: "先"
  },
  {
    cardId: "100302", nameCN: "不死鸟东海帝皇", nameJP: "トウカイテイオー",
    star3: { speed: 92, stamina: 72, power: 80, guts: 95, wit: 86 },
    star4: { speed: 102, stamina: 82, power: 90, guts: 105, wit: 96 },
    star5: { speed: 112, stamina: 92, power: 100, guts: 115, wit: 106 },
    aptitude: "中", role: "先"
  },
  {
    cardId: "100303", nameCN: "秋东海帝皇", nameJP: "トウカイテイオー",
    star3: { speed: 88, stamina: 82, power: 75, guts: 98, wit: 84 },
    star4: { speed: 98, stamina: 92, power: 85, guts: 108, wit: 94 },
    star5: { speed: 108, stamina: 102, power: 95, guts: 118, wit: 104 },
    aptitude: "中", role: "先"
  },
  // === 丸善斯基系列 ===
  {
    cardId: "100401", nameCN: "丸善斯基", nameJP: "マルゼンスキー",
    star3: { speed: 96, stamina: 68, power: 76, guts: 98, wit: 86 },
    star4: { speed: 106, stamina: 78, power: 86, guts: 108, wit: 96 },
    star5: { speed: 116, stamina: 88, power: 96, guts: 118, wit: 106 },
    aptitude: "英", role: "逃"
  },
  // === 富士奇石 ===
  {
    cardId: "100501", nameCN: "富士奇石", nameJP: "フジキセキ",
    star3: { speed: 90, stamina: 75, power: 72, guts: 88, wit: 96 },
    star4: { speed: 100, stamina: 85, power: 82, guts: 98, wit: 106 },
    star5: { speed: 110, stamina: 95, power: 92, guts: 108, wit: 116 },
    aptitude: "英", role: "先"
  },
  // === 小栗帽系列 ===
  {
    cardId: "100601", nameCN: "小栗帽", nameJP: "オグリキャップ",
    star3: { speed: 88, stamina: 78, power: 90, guts: 88, wit: 82 },
    star4: { speed: 98, stamina: 88, power: 100, guts: 98, wit: 92 },
    star5: { speed: 108, stamina: 98, power: 110, guts: 108, wit: 102 },
    aptitude: "英", role: "差"
  },
  // === 黄金船系列 ===
  {
    cardId: "100701", nameCN: "黄金船", nameJP: "ゴールドシップ",
    star3: { speed: 75, stamina: 82, power: 80, guts: 85, wit: 86 },
    star4: { speed: 85, stamina: 92, power: 90, guts: 95, wit: 96 },
    star5: { speed: 95, stamina: 102, power: 100, guts: 105, wit: 106 },
    aptitude: "中", role: "追"
  },
  // === 伏特加系列 ===
  {
    cardId: "100801", nameCN: "伏特加", nameJP: "ウオッカ",
    star3: { speed: 93, stamina: 70, power: 85, guts: 95, wit: 82 },
    star4: { speed: 103, stamina: 80, power: 95, guts: 105, wit: 92 },
    star5: { speed: 113, stamina: 90, power: 105, guts: 115, wit: 102 },
    aptitude: "英", role: "差"
  },
  // === 大和赤骥 ===
  {
    cardId: "100901", nameCN: "大和赤骥", nameJP: "ダイワスカーレット",
    star3: { speed: 89, stamina: 76, power: 77, guts: 97, wit: 86 },
    star4: { speed: 99, stamina: 86, power: 87, guts: 107, wit: 96 },
    star5: { speed: 109, stamina: 96, power: 97, guts: 117, wit: 106 },
    aptitude: "中", role: "先"
  },
  // === 大树快车系列 ===
  {
    cardId: "101001", nameCN: "大树快车", nameJP: "タイキシャトル",
    star3: { speed: 98, stamina: 55, power: 80, guts: 100, wit: 82 },
    star4: { speed: 108, stamina: 65, power: 90, guts: 110, wit: 92 },
    star5: { speed: 118, stamina: 75, power: 100, guts: 120, wit: 102 },
    aptitude: "短", role: "先"
  },
  // === 草上飞系列 ===
  {
    cardId: "101101", nameCN: "草上飞", nameJP: "グラスワンダー",
    star3: { speed: 82, stamina: 78, power: 78, guts: 90, wit: 96 },
    star4: { speed: 92, stamina: 88, power: 88, guts: 100, wit: 106 },
    star5: { speed: 102, stamina: 98, power: 98, guts: 110, wit: 116 },
    aptitude: "中", role: "差"
  },
  // === 菱亚马逊 ===
  {
    cardId: "101201", nameCN: "菱亚马逊", nameJP: "ヒシアマゾン",
    star3: { speed: 86, stamina: 72, power: 90, guts: 90, wit: 78 },
    star4: { speed: 96, stamina: 82, power: 100, guts: 100, wit: 88 },
    star5: { speed: 106, stamina: 92, power: 110, guts: 110, wit: 98 },
    aptitude: "中", role: "差"
  },
  // === 目白麦昆系列 ===
  {
    cardId: "101301", nameCN: "目白麦昆", nameJP: "メジロマックイーン",
    star3: { speed: 72, stamina: 92, power: 72, guts: 88, wit: 92 },
    star4: { speed: 82, stamina: 102, power: 82, guts: 98, wit: 102 },
    star5: { speed: 92, stamina: 112, power: 92, guts: 108, wit: 112 },
    aptitude: "长", role: "先"
  },
  // === 神鹰 ===
  {
    cardId: "101401", nameCN: "神鹰", nameJP: "エルコンドルパサー",
    star3: { speed: 90, stamina: 76, power: 85, guts: 85, wit: 90 },
    star4: { speed: 100, stamina: 86, power: 95, guts: 95, wit: 100 },
    star5: { speed: 110, stamina: 96, power: 105, guts: 105, wit: 110 },
    aptitude: "中", role: "先"
  },
  // === 好歌剧 ===
  {
    cardId: "101501", nameCN: "好歌剧", nameJP: "テイエムオペラオー",
    star3: { speed: 75, stamina: 88, power: 72, guts: 90, wit: 95 },
    star4: { speed: 85, stamina: 98, power: 82, guts: 100, wit: 105 },
    star5: { speed: 95, stamina: 108, power: 92, guts: 110, wit: 115 },
    aptitude: "长", role: "先"
  },
  // === 成田白仁系列 ===
  {
    cardId: "101601", nameCN: "成田白仁", nameJP: "ナリタブライアン",
    star3: { speed: 85, stamina: 82, power: 90, guts: 92, wit: 68 },
    star4: { speed: 95, stamina: 92, power: 100, guts: 102, wit: 78 },
    star5: { speed: 105, stamina: 102, power: 110, guts: 112, wit: 88 },
    aptitude: "中", role: "追"
  },
  // === 鲁道夫象征系列 ===
  {
    cardId: "101701", nameCN: "鲁道夫象征", nameJP: "シンボリルドルフ",
    star3: { speed: 85, stamina: 88, power: 82, guts: 80, wit: 92 },
    star4: { speed: 95, stamina: 98, power: 92, guts: 90, wit: 102 },
    star5: { speed: 105, stamina: 108, power: 102, guts: 100, wit: 112 },
    aptitude: "中", role: "先"
  },
  // === 气槽 ===
  {
    cardId: "101801", nameCN: "气槽", nameJP: "エアグルーヴ",
    star3: { speed: 88, stamina: 72, power: 92, guts: 86, wit: 78 },
    star4: { speed: 98, stamina: 82, power: 102, guts: 96, wit: 88 },
    star5: { speed: 108, stamina: 92, power: 112, guts: 106, wit: 98 },
    aptitude: "英", role: "先"
  },
  // === 爱丽数码 ===
  {
    cardId: "101901", nameCN: "爱丽数码", nameJP: "アグネスデジタル",
    star3: { speed: 92, stamina: 62, power: 82, guts: 96, wit: 82 },
    star4: { speed: 102, stamina: 72, power: 92, guts: 106, wit: 92 },
    star5: { speed: 112, stamina: 82, power: 102, guts: 116, wit: 102 },
    aptitude: "英", role: "差"
  },
  // === 青云天空系列 ===
  {
    cardId: "102001", nameCN: "青云天空", nameJP: "セイウンスカイ",
    star3: { speed: 86, stamina: 86, power: 72, guts: 88, wit: 92 },
    star4: { speed: 96, stamina: 96, power: 82, guts: 98, wit: 102 },
    star5: { speed: 106, stamina: 106, power: 92, guts: 108, wit: 112 },
    aptitude: "中", role: "逃"
  },
  // === 玉藻十字 ===
  {
    cardId: "102101", nameCN: "玉藻十字", nameJP: "タマモクロス",
    star3: { speed: 82, stamina: 70, power: 86, guts: 96, wit: 82 },
    star4: { speed: 92, stamina: 80, power: 96, guts: 106, wit: 92 },
    star5: { speed: 102, stamina: 90, power: 106, guts: 116, wit: 102 },
    aptitude: "长", role: "差"
  },
  // === 美妙姿势 ===
  {
    cardId: "102201", nameCN: "美妙姿势", nameJP: "ファインモーション",
    star3: { speed: 90, stamina: 78, power: 76, guts: 80, wit: 98 },
    star4: { speed: 100, stamina: 88, power: 86, guts: 90, wit: 108 },
    star5: { speed: 110, stamina: 98, power: 96, guts: 100, wit: 118 },
    aptitude: "英", role: "先"
  },
  // === 琵琶晨光 ===
  {
    cardId: "102301", nameCN: "琵琶晨光", nameJP: "ビワハヤヒデ",
    star3: { speed: 72, stamina: 85, power: 80, guts: 80, wit: 98 },
    star4: { speed: 82, stamina: 95, power: 90, guts: 90, wit: 108 },
    star5: { speed: 92, stamina: 105, power: 100, guts: 100, wit: 118 },
    aptitude: "中", role: "先"
  },
  // === 摩耶重炮系列 ===
  {
    cardId: "102401", nameCN: "重炮", nameJP: "マヤノトップガン",
    star3: { speed: 78, stamina: 72, power: 78, guts: 85, wit: 92 },
    star4: { speed: 88, stamina: 82, power: 88, guts: 95, wit: 102 },
    star5: { speed: 98, stamina: 92, power: 98, guts: 105, wit: 112 },
    aptitude: "中", role: "追"
  },
  // === 曼城茶座 ===
  {
    cardId: "102501", nameCN: "曼城茶座", nameJP: "マンハッタンカフェ",
    star3: { speed: 75, stamina: 85, power: 72, guts: 88, wit: 95 },
    star4: { speed: 85, stamina: 95, power: 82, guts: 98, wit: 105 },
    star5: { speed: 95, stamina: 105, power: 92, guts: 108, wit: 115 },
    aptitude: "长", role: "追"
  },
  // === 美浦波旁系列 ===
  {
    cardId: "102601", nameCN: "美浦波旁", nameJP: "ミホノブルボン",
    star3: { speed: 96, stamina: 80, power: 78, guts: 96, wit: 75 },
    star4: { speed: 106, stamina: 90, power: 88, guts: 106, wit: 85 },
    star5: { speed: 116, stamina: 100, power: 98, guts: 116, wit: 95 },
    aptitude: "中", role: "逃"
  },
  // === 目白赖恩 ===
  {
    cardId: "102701", nameCN: "目白赖恩", nameJP: "メジロライアン",
    star3: { speed: 82, stamina: 76, power: 88, guts: 92, wit: 78 },
    star4: { speed: 92, stamina: 86, power: 98, guts: 102, wit: 88 },
    star5: { speed: 102, stamina: 96, power: 108, guts: 112, wit: 98 },
    aptitude: "中", role: "差"
  },
  // === 菱曙 ===
  {
    cardId: "102801", nameCN: "菱曙", nameJP: "ヒシアケボノ",
    star3: { speed: 98, stamina: 55, power: 85, guts: 90, wit: 78 },
    star4: { speed: 108, stamina: 65, power: 95, guts: 100, wit: 88 },
    star5: { speed: 118, stamina: 75, power: 105, guts: 110, wit: 98 },
    aptitude: "短", role: "先"
  },
  // === 雪之美人类 ===
  {
    cardId: "102901", nameCN: "雪之美人", nameJP: "ユキノビジン",
    star3: { speed: 88, stamina: 70, power: 80, guts: 88, wit: 88 },
    star4: { speed: 98, stamina: 80, power: 90, guts: 98, wit: 98 },
    star5: { speed: 108, stamina: 90, power: 100, guts: 108, wit: 108 },
    aptitude: "英", role: "先"
  },
  // === 米浴系列 ===
  {
    cardId: "103001", nameCN: "米浴", nameJP: "ライスシャワー",
    star3: { speed: 75, stamina: 85, power: 78, guts: 88, wit: 88 },
    star4: { speed: 85, stamina: 95, power: 88, guts: 98, wit: 98 },
    star5: { speed: 95, stamina: 105, power: 98, guts: 108, wit: 108 },
    aptitude: "长", role: "差"
  },
  // === 艾尼风神 ===
  {
    cardId: "103101", nameCN: "艾尼风神", nameJP: "アイネスフウジン",
    star3: { speed: 92, stamina: 80, power: 76, guts: 90, wit: 78 },
    star4: { speed: 102, stamina: 90, power: 86, guts: 100, wit: 88 },
    star5: { speed: 112, stamina: 100, power: 96, guts: 110, wit: 98 },
    aptitude: "英", role: "逃"
  },
  // === 爱丽速子 ===
  {
    cardId: "103201", nameCN: "爱丽速子", nameJP: "アグネスタキオン",
    star3: { speed: 82, stamina: 85, power: 72, guts: 82, wit: 99 },
    star4: { speed: 92, stamina: 95, power: 82, guts: 92, wit: 109 },
    star5: { speed: 102, stamina: 105, power: 92, guts: 102, wit: 119 },
    aptitude: "中", role: "先"
  },
  // === 胜利奖券 ===
  {
    cardId: "103301", nameCN: "胜利奖券", nameJP: "ウイニングチケット",
    star3: { speed: 82, stamina: 78, power: 90, guts: 85, wit: 78 },
    star4: { speed: 92, stamina: 88, power: 100, guts: 95, wit: 88 },
    star5: { speed: 102, stamina: 98, power: 110, guts: 105, wit: 98 },
    aptitude: "中", role: "差"
  },
  // === 荣进闪耀 ===
  {
    cardId: "103401", nameCN: "荣进闪耀", nameJP: "エイシンフラッシュ",
    star3: { speed: 86, stamina: 78, power: 78, guts: 88, wit: 88 },
    star4: { speed: 96, stamina: 88, power: 88, guts: 98, wit: 98 },
    star5: { speed: 106, stamina: 98, power: 98, guts: 108, wit: 108 },
    aptitude: "中", role: "差"
  },
  // === 真机伶 ===
  {
    cardId: "103501", nameCN: "真机伶", nameJP: "カレンチャン",
    star3: { speed: 100, stamina: 52, power: 75, guts: 95, wit: 82 },
    star4: { speed: 110, stamina: 62, power: 85, guts: 105, wit: 92 },
    star5: { speed: 120, stamina: 72, power: 95, guts: 115, wit: 102 },
    aptitude: "短", role: "先"
  },
  // === 川上公主 ===
  {
    cardId: "103601", nameCN: "川上公主", nameJP: "カワカミプリンセス",
    star3: { speed: 82, stamina: 78, power: 92, guts: 78, wit: 85 },
    star4: { speed: 92, stamina: 88, power: 102, guts: 88, wit: 95 },
    star5: { speed: 102, stamina: 98, power: 112, guts: 98, wit: 105 },
    aptitude: "中", role: "差"
  },
  // === 黄金城市 ===
  {
    cardId: "103701", nameCN: "黄金城市", nameJP: "ゴールドシチー",
    star3: { speed: 88, stamina: 70, power: 75, guts: 90, wit: 92 },
    star4: { speed: 98, stamina: 80, power: 85, guts: 100, wit: 102 },
    star5: { speed: 108, stamina: 90, power: 95, guts: 110, wit: 112 },
    aptitude: "英", role: "差"
  },
  // === 樱花进王 ===
  {
    cardId: "103801", nameCN: "樱花进王", nameJP: "サクラバクシンオー",
    star3: { speed: 105, stamina: 42, power: 75, guts: 95, wit: 78 },
    star4: { speed: 115, stamina: 52, power: 85, guts: 105, wit: 88 },
    star5: { speed: 125, stamina: 62, power: 95, guts: 115, wit: 98 },
    aptitude: "短", role: "逃"
  },
  // === 超级小海湾系列 ===
  {
    cardId: "103901", nameCN: "超级小海湾", nameJP: "スーパークリーク",
    star3: { speed: 72, stamina: 95, power: 70, guts: 85, wit: 92 },
    star4: { speed: 82, stamina: 105, power: 80, guts: 95, wit: 102 },
    star5: { speed: 92, stamina: 115, power: 90, guts: 105, wit: 112 },
    aptitude: "长", role: "先"
  },
  // === 醒目飞鹰系列 ===
  {
    cardId: "104001", nameCN: "醒目飞鹰", nameJP: "スマートファルコン",
    star3: { speed: 95, stamina: 60, power: 80, guts: 92, wit: 88 },
    star4: { speed: 105, stamina: 70, power: 90, guts: 102, wit: 98 },
    star5: { speed: 115, stamina: 80, power: 100, guts: 112, wit: 108 },
    aptitude: "短", role: "逃"
  },
  // === 成田大进 ===
  {
    cardId: "104101", nameCN: "成田大进", nameJP: "ナリタタイシン",
    star3: { speed: 76, stamina: 82, power: 75, guts: 90, wit: 92 },
    star4: { speed: 86, stamina: 92, power: 85, guts: 100, wit: 102 },
    star5: { speed: 96, stamina: 102, power: 95, guts: 110, wit: 112 },
    aptitude: "长", role: "追"
  },
  // === 春丽 ===
  {
    cardId: "104201", nameCN: "春丽", nameJP: "ハルウララ",
    star3: { speed: 80, stamina: 75, power: 65, guts: 90, wit: 85 },
    star4: { speed: 90, stamina: 85, power: 75, guts: 100, wit: 95 },
    star5: { speed: 100, stamina: 95, power: 85, guts: 110, wit: 105 },
    aptitude: "短", role: "追"
  },
];

// ========== 查询函数 ==========

/** 根据cardId查找马娘基础属性 */
export function getUmaBaseStats(cardId: string): UmaBaseStats | undefined {
  return umaBaseStats.find(u => u.cardId === cardId);
}

/** 根据名字查找 */
export function getUmaBaseStatsByName(name: string): UmaBaseStats | undefined {
  return umaBaseStats.find(u => u.nameCN === name || u.nameJP === name);
}

/** 获取指定星级的属性 */
export function getStarStats(cardId: string, star: 3 | 4 | 5): StarStats | undefined {
  const uma = getUmaBaseStats(cardId);
  if (!uma) return undefined;
  if (star === 3) return uma.star3;
  if (star === 4) return uma.star4;
  return uma.star5;
}

/** 验证开局属性是否匹配数据库 */
export function verifyBaseStats(
  cardId: string, 
  star: 3 | 4 | 5,
  actual: { speed: number; stamina: number; power: number; guts: number; wit: number }
): { match: boolean; diff: { [key: string]: number } } {
  const expected = getStarStatsFixed(cardId, star);
  if (!expected) {
    return { match: false, diff: { error: -1 } };
  }

  const diff: { [key: string]: number } = {};
  const fields: (keyof StarStats)[] = ['speed', 'stamina', 'power', 'guts', 'wit'];
  
  for (const f of fields) {
    const d = actual[f] - expected[f];
    if (Math.abs(d) > 5) {
      diff[f] = d;
    }
  }

  return {
    match: Object.keys(diff).length === 0,
    diff
  };
}

/** 计算星级属性差值（用于因子/加成校准） */
export function getStarDiff(star: 3 | 4 | 5): number {
  return star - 3;  // 3星=0, 4星=+1, 5星=+2
}
