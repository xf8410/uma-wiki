import { mysqlTable, serial, varchar, int, tinyint, smallint, json, uniqueIndex } from "drizzle-orm/mysql-core";

/* ═══════════════════════════════════════════
   马娘详细属性表（用于相性计算）
   ═══════════════════════════════════════════ */

export const umaAttributes = mysqlTable("uma_attributes", {
  id: serial("id").primaryKey(),
  cardId: varchar("card_id", { length: 20 }).notNull().unique(),
  nameCN: varchar("name_cn", { length: 50 }).notNull(),
  nameJP: varchar("name_jp", { length: 100 }).notNull(),

  // 生日
  birthMonth: tinyint("birth_month"),       // 1-12
  birthDay: tinyint("birth_day"),           // 1-31
  // 实际原马出生年份
  realBirthYear: smallint("real_birth_year"),

  // 性别
  gender: varchar("gender", { length: 10 }), // "牡馬" / "牝馬"

  // 宿舍
  dormitory: varchar("dormitory", { length: 30 }), // "栗東寮" / "美浦寮"

  // 室友（另一个马娘的cardId）
  roommateId: varchar("roommate_id", { length: 20 }),

  // 学年
  grade: varchar("grade", { length: 20 }),  // "中等部1年" / "中等部2年" / "高等部1年" / "高等部2年" / "高等部3年"

  // 跑法
  runningStyle: varchar("running_style", { length: 10 }), // "逃" / "先" / "差" / "追"

  // 适应距离
  aptShort: varchar("apt_short", { length: 5 }),
  aptMile: varchar("apt_mile", { length: 5 }),
  aptMiddle: varchar("apt_middle", { length: 5 }),
  aptLong: varchar("apt_long", { length: 5 }),

  // 适应场地
  aptTurf: varchar("apt_turf", { length: 5 }),
  aptDirt: varchar("apt_dirt", { length: 5 }),

  // 跑法适应性
  aptNige: varchar("apt_nige", { length: 5 }),
  aptSenko: varchar("apt_senko", { length: 5 }),
  aptSashi: varchar("apt_sashi", { length: 5 }),
  aptOikomi: varchar("apt_oikomi", { length: 5 }),

  // 图标
  icon: varchar("icon", { length: 200 }),
}, (table) => [
  uniqueIndex("card_id_idx").on(table.cardId),
]);

// 相性关系缓存表（预计算）
export const compatibilityPairs = mysqlTable("compatibility_pairs", {
  id: serial("id").primaryKey(),
  cardIdA: varchar("card_id_a", { length: 20 }).notNull(),
  cardIdB: varchar("card_id_b", { length: 20 }).notNull(),
  score: int("score").notNull(), // 相性分数
  factors: json("factors"),      // 各因素详情
}, (table) => [
  uniqueIndex("pair_idx").on(table.cardIdA, table.cardIdB),
]);
