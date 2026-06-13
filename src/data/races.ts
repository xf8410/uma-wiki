// 比赛数据 - 日服
// 数据来源: game8.jp / gamewith.jp

export interface Race {
  name: string;
  nameJP: string;
  month: number;
  week: number; // 1-5
  grade: "G1" | "G2" | "G3" | "OP" | "Pre-OP";
  course: string;
  distance: string; // 短距離/マイル/中距離/長距離
  ground: string; // 芝/ダート
  direction: string; // 右回/左回
}

export const races: Race[] = [
  // 1月
  { name: "新年锦标", nameJP: "ニューイヤーステークス", month: 1, week: 1, grade: "G3", course: "中京", distance: "中距離", ground: "ダート", direction: "左回" },
  { name: "日刊体育杯京都金杯", nameJP: "日刊スポーシ京都金杯", month: 1, week: 1, grade: "G3", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "中山金杯", nameJP: "中山金杯", month: 1, week: 1, grade: "G3", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "シンザン記念", nameJP: "シンザン記念", month: 1, week: 1, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "日経新春杯", nameJP: "日経新春杯", month: 1, week: 2, grade: "G2", course: "中京", distance: "長距離", ground: "芝", direction: "左回" },
  { name: "愛知杯", nameJP: "愛知杯", month: 1, week: 2, grade: "G3", course: "中京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "フェアリーステークス", nameJP: "フェアリーステークス", month: 1, week: 3, grade: "G3", course: "中山", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "アメリカジョッキークラブカップ", nameJP: "アメリカJCC", month: 1, week: 3, grade: "G2", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "根岸ステークス", nameJP: "根岸ステークス", month: 1, week: 4, grade: "G3", course: "東京", distance: "短距離", ground: "ダート", direction: "左回" },
  { name: "シルクロードステークス", nameJP: "シルクロードS", month: 1, week: 4, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "東京新聞杯", nameJP: "東京新聞杯", month: 1, week: 4, grade: "G3", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "帝王赏", nameJP: "帝王賞", month: 1, week: 4, grade: "G1", course: "大井", distance: "中距離", ground: "ダート", direction: "右回" },

  // 2月
  { name: "東京大賞典", nameJP: "東京大賞典", month: 2, week: 1, grade: "G1", course: "大井", distance: "中距離", ground: "ダート", direction: "右回" },
  { name: "クイーンカップ", nameJP: "クイーンカップ", month: 2, week: 1, grade: "G3", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "共同通信杯", nameJP: "共同通信杯", month: 2, week: 2, grade: "G3", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "京都記念", nameJP: "京都記念", month: 2, week: 2, grade: "G2", course: "京都", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "小倉大賞典", nameJP: "小倉大賞典", month: 2, week: 3, grade: "G3", course: "小倉", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "ファルコンステークス", nameJP: "ファルコンステークス", month: 2, week: 3, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "デイリー杯クイーンカップ", nameJP: "デイリー杯クイーンC", month: 2, week: 3, grade: "G3", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "ダイヤモンドステークス", nameJP: "ダイヤモンドS", month: 2, week: 3, grade: "G3", course: "東京", distance: "長距離", ground: "芝", direction: "左回" },
  { name: "中山記念", nameJP: "中山記念", month: 2, week: 4, grade: "G2", course: "中山", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "阪急杯", nameJP: "阪急杯", month: 2, week: 4, grade: "G3", course: "阪神", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "京都金杯", nameJP: "京都金杯", month: 2, week: 4, grade: "G2", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },

  // 3月
  { name: "チューリップ賞", nameJP: "チューリップ賞", month: 3, week: 1, grade: "G2", course: "阪神", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "中京記念", nameJP: "中京記念", month: 3, week: 1, grade: "G3", course: "中京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "オーシャンステークス", nameJP: "オーシャンS", month: 3, week: 2, grade: "G3", course: "中山", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "金鯱賞", nameJP: "金鯱賞", month: 3, week: 2, grade: "G2", course: "中京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "阪神大賞典", nameJP: "阪神大賞典", month: 3, week: 3, grade: "G2", course: "阪神", distance: "長距離", ground: "芝", direction: "右回" },
  { name: "高松宮記念", nameJP: "高松宮記念", month: 3, week: 4, grade: "G1", course: "中京", distance: "短距離", ground: "芝", direction: "左回" },
  { name: "日経賞", nameJP: "日経賞", month: 3, week: 4, grade: "G2", course: "中山", distance: "長距離", ground: "芝", direction: "右回" },
  { name: "ダービー卿チャレンジトロフィー", nameJP: "ダービー卿CT", month: 3, week: 4, grade: "G3", course: "中山", distance: "マイル", ground: "芝", direction: "右回" },

  // 4月
  { name: "大阪杯", nameJP: "大阪杯", month: 4, week: 1, grade: "G1", course: "阪神", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "桜花賞", nameJP: "桜花賞", month: 4, week: 2, grade: "G1", course: "阪神", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "皐月賞", nameJP: "皐月賞", month: 4, week: 3, grade: "G1", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "春雷ステークス", nameJP: "春雷S", month: 4, week: 1, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "ニュージーランドトロフィー", nameJP: "ニュージーランドT", month: 4, week: 1, grade: "G2", course: "中山", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "アンタレスステークス", nameJP: "アンタレスS", month: 4, week: 2, grade: "G3", course: "阪神", distance: "中距離", ground: "ダート", direction: "右回" },
  { name: "マイラーズカップ", nameJP: "マイラーズC", month: 4, week: 3, grade: "G2", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "フローラステークス", nameJP: "フローラS", month: 4, week: 4, grade: "G2", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },

  // 5月
  { name: "NHKマイルカップ", nameJP: "NHKマイルC", month: 5, week: 1, grade: "G1", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "维多利亚英里赛", nameJP: "ヴィクトリアマイル", month: 5, week: 2, grade: "G1", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "オークス", nameJP: "オークス", month: 5, week: 3, grade: "G1", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "日本德比", nameJP: "日本ダービー", month: 5, week: 4, grade: "G1", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "京都新聞杯", nameJP: "京都新聞杯", month: 5, week: 2, grade: "G2", course: "京都", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "プリンシパルステークス", nameJP: "プリンシパルS", month: 5, week: 3, grade: "G3", course: "東京", distance: "長距離", ground: "芝", direction: "左回" },
  { name: "葵ステークス", nameJP: "葵S", month: 5, week: 3, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },

  // 6月
  { name: "宝塚記念", nameJP: "宝塚記念", month: 6, week: 4, grade: "G1", course: "阪神", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "东京英里赛", nameJP: "安田記念", month: 6, week: 1, grade: "G1", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "函館スプリントステークス", nameJP: "函館スプリントS", month: 6, week: 3, grade: "G3", course: "函館", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "ユニコーンステークス", nameJP: "ユニコーンS", month: 6, week: 2, grade: "G3", course: "東京", distance: "中距離", ground: "ダート", direction: "左回" },
  { name: "マーメイドステークス", nameJP: "マーメイドS", month: 6, week: 3, grade: "G3", course: "阪神", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "エプソムカップ", nameJP: "エプソムC", month: 6, week: 3, grade: "G3", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "函館記念", nameJP: "函館記念", month: 6, week: 4, grade: "G3", course: "函館", distance: "中距離", ground: "芝", direction: "右回" },

  // 7月
  { name: "スパーキングレディーカップ", nameJP: "スパーキングレディーC", month: 7, week: 1, grade: "G3", course: "中京", distance: "短距離", ground: "芝", direction: "左回" },
  { name: "プロキオンステークス", nameJP: "プロキオンS", month: 7, week: 1, grade: "G3", course: "中京", distance: "短距離", ground: "ダート", direction: "左回" },
  { name: "七夕賞", nameJP: "七夕賞", month: 7, week: 2, grade: "G3", course: "福島", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "ジュライカップ", nameJP: "ジュライカップ", month: 7, week: 3, grade: "G3", course: "小倉", distance: "マイル", ground: "芝", direction: "右回" },

  // 8月
  { name: "サマー2000", nameJP: "サマー2000", month: 8, week: 4, grade: "G3", course: "新潟", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "キーンランドカップ", nameJP: "キーンランドC", month: 8, week: 3, grade: "G3", course: "札幌", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "エルムステークス", nameJP: "エルムS", month: 8, week: 4, grade: "G3", course: "札幌", distance: "中距離", ground: "ダート", direction: "右回" },
  { name: "世界星", nameJP: "世界星", month: 8, week: 2, grade: "G3", course: "札幌", distance: "中距離", ground: "芝", direction: "右回" },

  // 9月
  { name: "スプリンターズステークス", nameJP: "スプリンターズS", month: 9, week: 4, grade: "G1", course: "中山", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "ローズステークス", nameJP: "ローズS", month: 9, week: 3, grade: "G2", course: "阪神", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "セントウルステークス", nameJP: "セントウルS", month: 9, week: 3, grade: "G2", course: "阪神", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "紫苑ステークス", nameJP: "紫苑S", month: 9, week: 3, grade: "G3", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "オールカマー", nameJP: "オールカマー", month: 9, week: 3, grade: "G2", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },

  // 10月
  { name: "天皇賞(秋)", nameJP: "天皇賞(秋)", month: 10, week: 4, grade: "G1", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "秋华赏", nameJP: "秋華賞", month: 10, week: 3, grade: "G1", course: "京都", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "菊花赏", nameJP: "菊花賞", month: 10, week: 4, grade: "G1", course: "京都", distance: "長距離", ground: "芝", direction: "右回" },
  { name: "府中牝馬ステークス", nameJP: "府中牝馬S", month: 10, week: 3, grade: "G2", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "サウジアラビアロイヤルカップ", nameJP: "サウジアラビアRC", month: 10, week: 3, grade: "G3", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "デイリー杯2歳ステークス", nameJP: "デイリー杯2歳S", month: 10, week: 4, grade: "G2", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },

  // 11月
  { name: "日本杯", nameJP: "ジャパンカップ", month: 11, week: 4, grade: "G1", course: "東京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "マイルチャンピオンシップ", nameJP: "マイルCS", month: 11, week: 3, grade: "G1", course: "京都", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "エリザベス女王杯", nameJP: "エリザベス女王杯", month: 11, week: 2, grade: "G1", course: "京都", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "東京スポーツ杯2歳ステークス", nameJP: "東京スポーツ杯2歳S", month: 11, week: 3, grade: "G3", course: "東京", distance: "マイル", ground: "芝", direction: "左回" },
  { name: "アルゼンチン共和国杯", nameJP: "アルゼンチン共和国杯", month: 11, week: 1, grade: "G2", course: "東京", distance: "長距離", ground: "芝", direction: "左回" },
  { name: "福島記念", nameJP: "福島記念", month: 11, week: 1, grade: "G3", course: "福島", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "京阪杯", nameJP: "京阪杯", month: 11, week: 4, grade: "G3", course: "京都", distance: "短距離", ground: "芝", direction: "右回" },

  // 12月
  { name: "有马纪念", nameJP: "有馬記念", month: 12, week: 4, grade: "G1", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "朝日杯未来锦标", nameJP: "朝日杯FS", month: 12, week: 1, grade: "G1", course: "阪神", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "ホープフルステークス", nameJP: "ホープフルS", month: 12, week: 4, grade: "G1", course: "中山", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "香港杯", nameJP: "香港カップ", month: 12, week: 1, grade: "G1", course: "香港", distance: "中距離", ground: "芝", direction: "右回" },
  { name: "香港マイル", nameJP: "香港マイル", month: 12, week: 1, grade: "G1", course: "香港", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "香港ヴァーズ", nameJP: "香港ヴァーズ", month: 12, week: 1, grade: "G1", course: "香港", distance: "長距離", ground: "芝", direction: "右回" },
  { name: "香港スプリント", nameJP: "香港スプリント", month: 12, week: 1, grade: "G1", course: "香港", distance: "短距離", ground: "芝", direction: "右回" },
  { name: "チャンピオンズカップ", nameJP: "チャンピオンズカップ", month: 12, week: 1, grade: "G1", course: "中京", distance: "中距離", ground: "ダート", direction: "左回" },
  { name: "阪神ジュベナイルフィリーズ", nameJP: "阪神JF", month: 12, week: 1, grade: "G1", course: "阪神", distance: "マイル", ground: "芝", direction: "右回" },
  { name: "中日新聞杯", nameJP: "中日新聞杯", month: 12, week: 1, grade: "G3", course: "中京", distance: "中距離", ground: "芝", direction: "左回" },
  { name: "ターコイズステークス", nameJP: "ターコイズS", month: 12, week: 2, grade: "G3", course: "中山", distance: "短距離", ground: "芝", direction: "右回" },
];

// 按月份分组
export const racesByMonth = Array.from({ length: 12 }, (_, i) => {
  const monthRaces = races.filter((r) => r.month === i + 1);
  return {
    month: i + 1,
    label: `${i + 1}月`,
    races: monthRaces.sort((a, b) => {
      const gradeOrder = { "G1": 0, "G2": 1, "G3": 2, "OP": 3, "Pre-OP": 4 };
      return gradeOrder[a.grade] - gradeOrder[b.grade];
    }),
    g1Count: monthRaces.filter((r) => r.grade === "G1").length,
    g2Count: monthRaces.filter((r) => r.grade === "G2").length,
    g3Count: monthRaces.filter((r) => r.grade === "G3").length,
  };
});
