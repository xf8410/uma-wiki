import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { umaAttributes } from "../../db/schema";
import { eq } from "drizzle-orm";

/* ═══════════════════════════════════════════
   相性计算引擎
   ═══════════════════════════════════════════ */

interface UmaAttr {
  cardId: string;
  nameCN: string;
  nameJP: string;
  birthMonth: number | null;
  birthDay: number | null;
  realBirthYear: number | null;
  gender: string | null;
  dormitory: string | null;
  roommateId: string | null;
  grade: string | null;
  runningStyle: string | null;
  aptTurf: string | null;
  aptDirt: string | null;
  aptShort: string | null;
  aptMile: string | null;
  aptMiddle: string | null;
  aptLong: string | null;
  aptNige: string | null;
  aptSenko: string | null;
  aptSashi: string | null;
  aptOikomi: string | null;
}

interface CompatFactor {
  name: string;
  score: number;
}

function calcCompatFull(a: UmaAttr, b: UmaAttr): { score: number; factors: CompatFactor[] } {
  const factors: CompatFactor[] = [];
  let score = 0;

  // 1. 基础相性（名字相似 = 同一原型马的不同版本）
  const aBase = a.nameCN.replace(/^(泳装|婚纱|礼服|万圣节|情人节|秋|春|不死鸟|拉拉队|冒险家|机械杯|Σ|无人岛|凯旋门|中山|夏装|花道|柳緑)/, "");
  const bBase = b.nameCN.replace(/^(泳装|婚纱|礼服|万圣节|情人节|秋|春|不死鸟|拉拉队|冒险家|机械杯|Σ|无人岛|凯旋门|中山|夏装|花道|柳緑)/, "");
  if (aBase === bBase && a.cardId !== b.cardId) {
    score += 16;
    factors.push({ name: "同一馬娘", score: 16 });
  }

  // 2. 同宿舍
  if (a.dormitory && b.dormitory && a.dormitory === b.dormitory && a.dormitory !== "一人暮らし") {
    score += 5;
    factors.push({ name: "同宿舍", score: 5 });
  }

  // 3. 室友关系
  if (a.roommateId && b.cardId && a.roommateId === b.cardId) {
    score += 10;
    factors.push({ name: "室友", score: 10 });
  }

  // 4. 同出生月份
  if (a.birthMonth && b.birthMonth && a.birthMonth === b.birthMonth) {
    score += 2;
    factors.push({ name: "同月出生", score: 2 });
  }

  // 5. 同时期活跃（出生年份相差<=3年）
  if (a.realBirthYear && b.realBirthYear) {
    const diff = Math.abs(a.realBirthYear - b.realBirthYear);
    if (diff <= 3) {
      score += 3;
      factors.push({ name: "同时期", score: 3 });
    }
  }

  // 6. 同性别
  if (a.gender && b.gender && a.gender === b.gender) {
    score += 2;
    factors.push({ name: "同性别", score: 2 });
  }

  // 7. 同学年
  if (a.grade && b.grade && a.grade === b.grade) {
    score += 2;
    factors.push({ name: "同学年", score: 2 });
  }

  // 8. 同跑法
  if (a.runningStyle && b.runningStyle && a.runningStyle === b.runningStyle) {
    score += 3;
    factors.push({ name: "同跑法", score: 3 });
  }

  // 9. 适应场地相同（A以上）
  const turfGrades: Record<string, number> = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1, "E": 0, "F": 0, "G": 0 };
  if (a.aptTurf && b.aptTurf && turfGrades[a.aptTurf] >= 3 && turfGrades[b.aptTurf] >= 3) {
    score += 2;
    factors.push({ name: "芝適性", score: 2 });
  }
  if (a.aptDirt && b.aptDirt && turfGrades[a.aptDirt] >= 3 && turfGrades[b.aptDirt] >= 3) {
    score += 2;
    factors.push({ name: "ダ適性", score: 2 });
  }

  // 默认最低相性
  if (score === 0) {
    score = 1;
    factors.push({ name: "基本", score: 1 });
  }

  return { score, factors };
}

export const compatibilityRouter = createRouter({
  // 获取所有马娘属性
  listAttributes: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(umaAttributes);
  }),

  // 获取单个马娘属性
  getAttribute: publicQuery
    .input(z.object({ cardId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(umaAttributes).where(eq(umaAttributes.cardId, input.cardId));
      return results[0] || null;
    }),

  // 计算两个马娘之间的相性
  calcPair: publicQuery
    .input(z.object({ cardIdA: z.string(), cardIdB: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const a = await db.select().from(umaAttributes).where(eq(umaAttributes.cardId, input.cardIdA));
      const b = await db.select().from(umaAttributes).where(eq(umaAttributes.cardId, input.cardIdB));
      
      if (!a[0] || !b[0]) return { score: 0, factors: [] };
      
      return calcCompatFull(a[0] as unknown as UmaAttr, b[0] as unknown as UmaAttr);
    }),

  // 计算一个马娘与所有其他马娘的相性排名
  calcRanking: publicQuery
    .input(z.object({ cardId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const target = await db.select().from(umaAttributes).where(eq(umaAttributes.cardId, input.cardId));
      if (!target[0]) return [];
      
      const all = await db.select().from(umaAttributes);
      
      const rankings = all
        .filter((u) => u.cardId !== input.cardId)
        .map((u) => {
          const result = calcCompatFull(target[0] as unknown as UmaAttr, u as unknown as UmaAttr);
          return {
            cardId: u.cardId,
            nameCN: u.nameCN,
            nameJP: u.nameJP,
            score: result.score,
            factors: result.factors,
          };
        })
        .sort((a, b) => b.score - a.score);
      
      return rankings;
    }),
});
