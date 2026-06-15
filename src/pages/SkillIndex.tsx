import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowLeft, ChevronDown, ChevronUp,
  Lock, Unlock, Star, Ban, Search, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Skill {
  nameJP: string;
  nameCN: string;
  rarity: string;
  restriction: string;
  iconColor: string;
  descCN: string;
  triggerCode: string;
  triggerCondition: string;
  skillType: string;
  values: { type: string; value: string }[];
  duration: string;
  cooldown: string;
  costPT: string;
  totalPT: string;
  score: string;
  ptRatio: string;
  icon: string;
  borderColor?: string;
  unlockFrom?: string;
  conditions?: { label: string; desc: string; values: { type: string; value: string }[]; duration: string; special?: boolean }[];
}

interface Chain {
  id: string;
  lower: Skill;
  upper: Skill;
  category: string;
}

interface NonInheritSkill {
  nameJP: string;
  nameCN: string;
  icon: string;
  descCN: string;
  detail: {
    rarity: string;
    restriction: string;
    triggerCode: string;
    triggerCondition: string;
    skillType: string;
    values: { type: string; value: string }[];
    duration: string;
    cooldown: string;
    score: string;
  };
}

/* ═══════════════════════════════════════════
   Inherent Skills (with source uma)
   ═══════════════════════════════════════════ */

interface InherentSkill extends Skill {
  sourceUma: string;
}

const inherentUniqueSkills: InherentSkill[] = [
  {
    nameJP: "シューティングスター", nameCN: "流星",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "在比赛终盘处于队伍中游靠前并超过对手时，就会乘势向前突进且稍微提升加速度",
    triggerCode: "phase>=2 &order>=1 &order_rate<=70 &change_order_onetime<0",
    triggerCondition: "终盘，名次≥1，名次≤70%，超过至少一人",
    skillType: "即时速度、加速度",
    values: [{ type: "即时速度", value: "0.35" }, { type: "加速度", value: "0.1" }],
    duration: "6", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/skill-shooting-star.png", borderColor: "purple",
    sourceUma: "原皮特别周",
  },
  {
    nameJP: "わやかわ♪マリンダイヴ", nameCN: "超级可爱♪飞身入海",
    rarity: "独特", restriction: "通用", iconColor: "蓝色",
    descCN: "比赛中盘时如果使用了两次技能且位于队伍中间时，回复体力并少量提升速度",
    triggerCode: "phase==1 &order>=2 &order_rate<=80 &activate_count_middle>=2",
    triggerCondition: "中盘、名次≥2且名次≤80%、触发技能次数≥2",
    skillType: "耐力恢复、速度",
    values: [{ type: "耐力恢复", value: "0.055" }, { type: "速度", value: "0.25" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/summer-sw-skill-unique.png", borderColor: "purple",
    sourceUma: "泳装特别周",
  },
  {
    nameJP: "威風堂々、夢錦！", nameCN: "威风凛凛，逐梦似锦！",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "在终盘最终弯道发动技能后，心中怀抱声援，速度少量提升。如果处于中山竞马场，速度极大提升",
    triggerCode: "phase>=2 &is_finalcorner==1 &corner!=0 &is_activate_any_skill==1",
    triggerCondition: "条件1前置：中山竞马场\n条件1：终盘、最终弯道、发动任意技能\n条件2：终盘、最终弯道、发动任意技能",
    skillType: "速度",
    values: [{ type: "速度", value: "0.45/0.25" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/kimono-sw-skill-unique.png", borderColor: "purple",
    sourceUma: "中山大奖赛特别周",
    conditions: [
      { label: "条件1", desc: "中山竞马场时", values: [{ type: "速度", value: "0.45" }], duration: "5" },
      { label: "条件2", desc: "其他场地", values: [{ type: "速度", value: "0.25" }], duration: "5" },
    ],
  },
  {
    nameJP: "叙情、旅路の果てに", nameCN: "旅途终点的抒情诗",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "临近终盘的某个位置位于后方时速度少量持续上升，且中距离或长距离比赛中远离领头时，效果提升",
    triggerCode: "distance_type==3 &phase_laterhalf_random==1 &order_rate>50 @distance_type==4 &phase_laterhalf_random==1 &order_rate>50",
    triggerCondition: "条件1.1：中距离或长距离、中盘后半随机位置、名次＞50%\n条件1.2：中距离或长距离、中盘后半随机位置、名次＞50%、距离领头≥8马身\n条件2：短距离或英里、中盘后半随机位置、名次＞50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.25/0.35" }],
    duration: "6", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/mr-cb-skill-unique.png", borderColor: "purple",
    sourceUma: "千名代表",
    conditions: [
      { label: "条件1.1", desc: "中距/长距、中盘后、名次＞50%", values: [{ type: "速度", value: "0.25" }], duration: "6" },
      { label: "条件1.2", desc: "中距/长距、中盘后、名次＞50%、距领头≥8马身", values: [{ type: "速度", value: "0.35" }], duration: "6", special: true },
      { label: "条件2", desc: "短距/英里、中盘后、名次＞50%", values: [{ type: "速度", value: "0.25" }], duration: "6" },
    ],
  },
  {
    nameJP: "爛然闊歩", nameCN: "灿然阔步",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "比赛后半段位于后方时，根据剩余耐力进行相应时间的长距离冲刺，使速度持续稍微提升",
    triggerCode: "distance_rate>=50 &order_rate>=50",
    triggerCondition: "行进距离≥50%、名次≥50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.15" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/mr-cb-flower-skill-unique.png", borderColor: "purple",
    sourceUma: "花道千明代表",
  },
  {
    nameJP: "黄金を訪ねて", nameCN: "万苦千辛，终寻黄金",
    rarity: "独特", restriction: "差行、追马", iconColor: "黄色",
    descCN: "比赛后半段速度少量持续提升；若是2000m以上的比赛则最终冲刺时短时间内少量提升加速度<差行/追马>",
    triggerCode: "条件1: distance_rate>=50\n条件2: is_activate_other_skill_detail==1 &course_distance>=2000 &is_lastspurt==1",
    triggerCondition: "条件1前置：差行或追马\n条件1：行进距离≥50%\n条件2：发动第一段技能、比赛距离≥2000m、最终冲刺状态",
    skillType: "速度、加速度",
    values: [{ type: "速度", value: "0.25" }],
    duration: "6", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/stay-gold-skill-unique.png", borderColor: "purple",
    sourceUma: "黄金旅程",
    conditions: [
      { label: "条件1", desc: "比赛后半段", values: [{ type: "速度", value: "0.25" }], duration: "6" },
      { label: "条件2", desc: "2000m以上、发动第一段技能后、最终冲刺", values: [{ type: "加速度", value: "0.3" }], duration: "2" },
    ],
  },
  {
    nameJP: "ときめきが呼ぶほうへ", nameCN: "奔向那名为悸动的彼方",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "在临近终盘的下坡路处于中间集团附近，且距离终点尚远时，会尽情地享受比赛，提高速度",
    triggerCode: "distance_rate>=60 &slope==2 &phase==1 &order_rate>=40 &order_rate<=80 &remain_distance>=500",
    triggerCondition: "行进距离≥60%、下坡、中盘、名次≥40%、名次≤80%、剩余距离≥500m",
    skillType: "速度",
    values: [{ type: "速度", value: "0.35" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/mejiro-dober-summer-skill-unique.png", borderColor: "purple",
    sourceUma: "夏装目白多伯",
  },
  {
    nameJP: "愛と熔けよただ熔けよ", nameCN: "消融在爱中吧",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "剩余1000m时若位于前方，则提高速度",
    triggerCode: "remain_distance>=999 &remain_distance<=1001 &order_rate>=20 &order_rate<=50",
    triggerCondition: "剩余距离≥999m，剩余距离≤1001m，20%≤名次≤50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.35" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/mejiro-peak-skill-unique.png", borderColor: "purple",
    sourceUma: "目白高峰",
  },
  {
    nameJP: "解けぬ結い目", nameCN: "至死不渝的爱",
    rarity: "独特", restriction: "先行", iconColor: "黄色",
    descCN: "剩余300m的位置位于前方时速度少量提升，发动技能时若位于领头或距离领头2马身以内则速度大幅提升<作战・先行>",
    triggerCode: "条件1: running_style==2 &order_rate<=40 &remain_distance>=299 &remain_distance<=301 &distance_diff_top<=5\n条件2: running_style==2 &order_rate<=40 &remain_distance>=299 &remain_distance<=301",
    triggerCondition: "条件1：先行、名次≤40%、299m≤剩余距离≤301m、与第一名距离≤5m\n条件2：先行、名次≤40%、299m≤剩余距离≤301m",
    skillType: "速度",
    values: [{ type: "速度", value: "0.45/0.25" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/mejiro-peak-wedding-skill-unique.png", borderColor: "purple",
    sourceUma: "婚纱目白高峰",
    conditions: [
      { label: "条件1", desc: "领头或距领头≤2马身", values: [{ type: "速度", value: "0.45" }], duration: "5" },
      { label: "条件2", desc: "其他位置", values: [{ type: "速度", value: "0.25" }], duration: "5" },
    ],
  },
  {
    nameJP: "迷える時も、幽かなる時も", nameCN: "彷徨四顾，花前月下",
    rarity: "独特", restriction: "差行", iconColor: "蓝色",
    descCN: "比赛中盘回复耐力；若是长距离比赛则比赛后半段位于中后方时持续向前突进＜作战・差行＞",
    triggerCode: "条件1: phase==1 &running_style==3\n条件2: is_activate_other_skill_detail==1 &distance_type==4 &distance_rate>=50 &order_rate>=30 &order_rate<=70",
    triggerCondition: "条件1：中盘、差行\n条件2：发动第一段技能、长距离、行进距离≥50%、30%≤名次≤70%",
    skillType: "耐力恢复、即时速度",
    values: [{ type: "耐力恢复", value: "0.055" }],
    duration: "瞬时", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/manhattan-wedding-skill-unique.png", borderColor: "purple",
    sourceUma: "婚纱曼城茶座",
    conditions: [
      { label: "条件1", desc: "中盘、差行", values: [{ type: "耐力恢复", value: "0.055" }], duration: "瞬时" },
      { label: "条件2", desc: "长距离、后半段、中团", values: [{ type: "即时速度", value: "0.35" }], duration: "6" },
    ],
  },
  {
    nameJP: "心からのおもてにゃし", nameCN: "诚心诚意，以喵待人",
    rarity: "独特", restriction: "通用", iconColor: "黄色",
    descCN: "比赛前半段若一直位于队伍中后方则在比赛终盘的最终弯道以及往后向前小幅突进，如果是长距离比赛则增加效果量",
    triggerCode: "条件1: distance_type==4 &phase>=2 &is_finalcorner==1\n条件2: phase>=2 &is_finalcorner==1",
    triggerCondition: "前置条件：行进距离≥50%、前半段一直保持名次≥40%\n条件1：长距离、终盘、最终弯道及往后\n条件2：终盘、最终弯道及往后",
    skillType: "即时速度",
    values: [{ type: "即时速度", value: "0.35/0.25" }],
    duration: "5", cooldown: "500", costPT: "", totalPT: "", score: "340", ptRatio: "",
    icon: "/images/manhattan-sayo-skill-unique.png", borderColor: "purple",
    sourceUma: "柳緑小夜",
    conditions: [
      { label: "条件1", desc: "长距离、终盘、最终弯道及往后", values: [{ type: "即时速度", value: "0.35" }], duration: "5" },
      { label: "条件2", desc: "终盘、最终弯道及往后", values: [{ type: "即时速度", value: "0.25" }], duration: "5" },
    ],
  },
];

const inherentInheritSkills: InherentSkill[] = [
  {
    nameJP: "シューティングスター", nameCN: "流星",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "在比赛终盘处于队伍中游靠前并超过对手时，就会乘势稍微向前突进且提升微量加速度",
    triggerCode: "phase>=2 &order>=1 &order_rate<=70 &change_order_onetime<0",
    triggerCondition: "终盘，名次≥1，名次≤70%，超过至少一人",
    skillType: "即时速度、加速度",
    values: [{ type: "即时速度", value: "0.15" }, { type: "加速度", value: "0.05" }],
    duration: "3.6", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/skill-inherit-shooting-star.png", borderColor: "purple",
    sourceUma: "原皮特别周",
  },
  {
    nameJP: "わやかわ♪マリンダイヴ", nameCN: "超级可爱♪飞身入海",
    rarity: "普通·继承", restriction: "通用", iconColor: "蓝色",
    descCN: "比赛中盘时如果使用了两次技能且位于队伍中间时，回复少量体力并略微提升速度",
    triggerCode: "phase==1 &order>=2 &order_rate<=80 &activate_count_middle>=2",
    triggerCondition: "中盘、名次≥2且名次≤80%、触发技能次数≥2",
    skillType: "耐力恢复、速度",
    values: [{ type: "耐力恢复", value: "0.015" }, { type: "速度", value: "0.05" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/summer-sw-skill-inherit.png", borderColor: "purple",
    sourceUma: "泳装特别周",
  },
  {
    nameJP: "威風堂々、夢錦！", nameCN: "威风凛凛，逐梦似锦！",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "在终盘最终弯道发动技能后，速度稍微提升。如果处于中山竞马场，速度少量提升",
    triggerCode: "phase>=2 &is_finalcorner==1 &corner!=0 &is_activate_any_skill==1",
    triggerCondition: "条件1前置：中山竞马场\n条件1：终盘、最终弯道、发动任意技能\n条件2：终盘、最终弯道、发动任意技能",
    skillType: "速度",
    values: [{ type: "速度", value: "0.25/0.05" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/kimono-sw-skill-inherit.png", borderColor: "purple",
    sourceUma: "中山大奖赛特别周",
    conditions: [
      { label: "条件1", desc: "中山竞马场时", values: [{ type: "速度", value: "0.25" }], duration: "3" },
      { label: "条件2", desc: "其他场地", values: [{ type: "速度", value: "0.05" }], duration: "3" },
    ],
  },
  {
    nameJP: "叙情、旅路の果てに", nameCN: "旅途终点的抒情诗",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "临近终盘的某个位置位于后方时速度略微持续上升，且中距离或长距离比赛中远离领头时，效果提升",
    triggerCode: "distance_type==3 &phase_laterhalf_random==1 &order_rate>50 @distance_type==4 &phase_laterhalf_random==1 &order_rate>50",
    triggerCondition: "条件1：中距离或长距离、中盘后半随机位置、名次＞50%、距离领头≥8马身\n条件2：短距离或英里、中盘后半随机位置、名次＞50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.05/0.15" }],
    duration: "3.6", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/mr-cb-skill-inherit.png", borderColor: "purple",
    sourceUma: "千名代表",
    conditions: [
      { label: "条件1", desc: "中距/长距、中盘后、名次＞50%", values: [{ type: "速度", value: "0.05" }], duration: "3.6" },
      { label: "条件1*", desc: "中距/长距、中盘后、名次＞50%、距领头≥8马身(特殊效果)", values: [{ type: "速度", value: "0.15" }], duration: "3.6", special: true },
      { label: "条件2", desc: "短距/英里、中盘后、名次＞50%", values: [{ type: "速度", value: "0.05" }], duration: "3.6" },
    ],
  },
  {
    nameJP: "爛然闊歩", nameCN: "灿然阔步",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "比赛后半段位于后方时，根据剩余耐力进行相应时间的长距离冲刺，使速度略微持续上升",
    triggerCode: "distance_rate>=50 &order_rate>=50",
    triggerCondition: "行进距离≥50%、名次≥50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.035" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/mr-cb-flower-skill-inherit.png", borderColor: "purple",
    sourceUma: "花道千明代表",
  },
  {
    nameJP: "黄金を訪ねて", nameCN: "万苦千辛，终寻黄金",
    rarity: "普通·继承", restriction: "差行、追马", iconColor: "黄色",
    descCN: "比赛后半段速度略微持续提升；若是2000m以上的比赛则最终冲刺时短时间内略微提升加速度<差行/追马>",
    triggerCode: "条件1: distance_rate>=50\n条件2: is_activate_other_skill_detail==1 &course_distance>=2000 &is_lastspurt==1",
    triggerCondition: "条件1前置：差行或追马\n条件1：行进距离≥50%\n条件2：发动第一段技能、比赛距离≥2000m、最终冲刺状态",
    skillType: "速度、加速度",
    values: [{ type: "速度", value: "0.05" }],
    duration: "3.6", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/stay-gold-skill-inherit.png", borderColor: "purple",
    sourceUma: "黄金旅程",
    conditions: [
      { label: "条件1", desc: "比赛后半段", values: [{ type: "速度", value: "0.05" }], duration: "3.6" },
      { label: "条件2", desc: "2000m以上、发动第一段技能后、最终冲刺", values: [{ type: "加速度", value: "0.1" }], duration: "1.2" },
    ],
  },
  {
    nameJP: "黄金を訪ねて", nameCN: "万苦千辛，终寻黄金（进化）",
    rarity: "普通·继承·进化", restriction: "差行、追马", iconColor: "黄色",
    descCN: "比赛后半段速度略微持续提升；若是2000m以上的比赛则最终冲刺时短时间内略微提升加速度<差行/追马>\n【进化】育成开始时已解锁3★以上的育成赛马娘[Sunlit Outsider]黄金旅程，且育成开始时作为父母辈继承该技能",
    triggerCode: "条件1: distance_rate>=50\n条件2: is_activate_other_skill_detail==1 &course_distance>=2000 &is_lastspurt==1",
    triggerCondition: "条件1前置：差行或追马\n条件1：行进距离≥50%\n条件2：发动第一段技能、比赛距离≥2000m、最终冲刺状态",
    skillType: "速度、加速度",
    values: [{ type: "速度", value: "0.15" }],
    duration: "3.6", cooldown: "500", costPT: "", totalPT: "0", score: "240", ptRatio: "",
    icon: "/images/stay-gold-skill-evolved.png", borderColor: "pink",
    sourceUma: "黄金旅程",
    conditions: [
      { label: "条件1", desc: "比赛后半段", values: [{ type: "速度", value: "0.15" }], duration: "3.6" },
      { label: "条件2", desc: "2000m以上、发动第一段技能后、最终冲刺", values: [{ type: "加速度", value: "0.2" }], duration: "1.2" },
    ],
  },
  {
    nameJP: "ときめきが呼ぶほうへ", nameCN: "奔向那名为悸动的彼方",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "在临近终盘的下坡路处于中间集团附近，且距离终点尚远时，速度稍微提升",
    triggerCode: "distance_rate>=60 &slope==2 &phase==1 &order_rate>=40 &order_rate<=80 &remain_distance>=500",
    triggerCondition: "行进距离≥60%、下坡、中盘、名次≥40%、名次≤80%、剩余距离≥500m",
    skillType: "速度",
    values: [{ type: "速度", value: "0.15" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/mejiro-dober-summer-skill-inherit.png", borderColor: "purple",
    sourceUma: "夏装目白多伯",
  },
  {
    nameJP: "愛と熔けよただ熔けよ", nameCN: "消融在爱中吧",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "剩余1000m时若位于前方，则稍微加快速度",
    triggerCode: "remain_distance>=999 &remain_distance<=1001 &order_rate>=20 &order_rate<=50",
    triggerCondition: "剩余距离≥999m，剩余距离≤1001m，20%≤名次≤50%",
    skillType: "速度",
    values: [{ type: "速度", value: "0.15" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/mejiro-peak-skill-inherit.png", borderColor: "purple",
    sourceUma: "目白高峰",
  },
  {
    nameJP: "解けぬ結い目", nameCN: "至死不渝的爱",
    rarity: "普通·继承", restriction: "先行", iconColor: "黄色",
    descCN: "剩余300m的位置位于前方时速度略微提升，发动技能时若位于领头或距离领头2马身以内则速度少量提升<作战・先行>",
    triggerCode: "条件1: running_style==2 &order_rate<=40 &remain_distance>=299 &remain_distance<=301 &distance_diff_top<=5\n条件2: running_style==2 &order_rate<=40 &remain_distance>=299 &remain_distance<=301",
    triggerCondition: "条件1：先行、名次≤40%、299m≤剩余距离≤301m、与第一名距离≤5m\n条件2：先行、名次≤40%、299m≤剩余距离≤301m",
    skillType: "速度",
    values: [{ type: "速度", value: "0.25/0.05" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/mejiro-peak-wedding-skill-inherit.png", borderColor: "purple",
    sourceUma: "婚纱目白高峰",
    conditions: [
      { label: "条件1", desc: "领头或距领头≤2马身", values: [{ type: "速度", value: "0.25" }], duration: "3" },
      { label: "条件2", desc: "其他位置", values: [{ type: "速度", value: "0.05" }], duration: "3" },
    ],
  },
  {
    nameJP: "迷える時も、幽かなる時も", nameCN: "彷徨四顾，花前月下",
    rarity: "普通·继承", restriction: "差行", iconColor: "蓝色",
    descCN: "比赛中盘稍微回复耐力＜作战・差行＞",
    triggerCode: "phase==1 &running_style==3",
    triggerCondition: "中盘、差行",
    skillType: "耐力恢复",
    values: [{ type: "耐力恢复", value: "0.015" }],
    duration: "瞬时", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/manhattan-wedding-skill-inherit.png", borderColor: "purple",
    sourceUma: "婚纱曼城茶座",
  },
  {
    nameJP: "心からのおもてにゃし", nameCN: "诚心诚意，以喵待人",
    rarity: "普通·继承", restriction: "通用", iconColor: "黄色",
    descCN: "比赛前半段若一直位于队伍中后方则在比赛终盘的最终弯道以及往后向前极小幅突进，如果是长距离比赛则增加效果量",
    triggerCode: "条件1: distance_type==4 &phase>=2 &is_finalcorner==1\n条件2: phase>=2 &is_finalcorner==1",
    triggerCondition: "前置条件：行进距离≥50%、前半段一直保持名次≥40%\n条件1：长距离、终盘、最终弯道及往后\n条件2：终盘、最终弯道及往后",
    skillType: "即时速度",
    values: [{ type: "即时速度", value: "0.15/0.05" }],
    duration: "3", cooldown: "500", costPT: "200", totalPT: "200", score: "180", ptRatio: "0.90",
    icon: "/images/manhattan-sayo-skill-inherit.png", borderColor: "purple",
    sourceUma: "柳緑小夜",
    conditions: [
      { label: "条件1", desc: "长距离、终盘、最终弯道及往后", values: [{ type: "即时速度", value: "0.15" }], duration: "3" },
      { label: "条件2", desc: "终盘、最终弯道及往后", values: [{ type: "即时速度", value: "0.05" }], duration: "3" },
    ],
  },
];

/* ═══════════════════════════════════════════
   Skill Chains (普通技能 + 被动技能)
   ═══════════════════════════════════════════ */

const skillChains: Chain[] = [
  {
    id: "speed",
    category: "普通技能",
    lower: {
      nameJP: "末脚", nameCN: "末脚", rarity: "普通", restriction: "通用", iconColor: "黄色",
      descCN: "在最后冲刺的关键时刻，速度稍微加快",
      triggerCode: "is_lastspurt==1 &phase_firsthalf_random==3",
      triggerCondition: "最终冲刺状态，终盘四分之三段随机位置",
      skillType: "速度", values: [{ type: "速度", value: "0.15" }],
      duration: "2.4", cooldown: "500", costPT: "170", totalPT: "170", score: "217", ptRatio: "1.28",
      icon: "/images/skill-matsukaze.png", borderColor: "white",
    },
    upper: {
      nameJP: "全身全霊", nameCN: "全身心", rarity: "传说", restriction: "通用", iconColor: "黄色",
      descCN: "在最后冲刺的关键时刻，速度加快",
      triggerCode: "is_lastspurt==1 &phase_firsthalf_random==3",
      triggerCondition: "最终冲刺状态，终盘四分之三段随机位置",
      skillType: "速度", values: [{ type: "速度", value: "0.35" }],
      duration: "2.4", cooldown: "500", costPT: "170", totalPT: "340", score: "508", ptRatio: "1.49",
      icon: "/images/skill-zenshinzenrei.png", borderColor: "gold",
    },
  },
  {
    id: "stamina",
    category: "普通技能",
    lower: {
      nameJP: "栄養補給", nameCN: "营养补给", rarity: "普通", restriction: "先行", iconColor: "蓝色",
      descCN: "比赛中盘略微回复持久力（作战·先行）",
      triggerCode: "running_style==2 &phase_random==1",
      triggerCondition: "先行，中盘",
      skillType: "耐力恢复", values: [{ type: "耐力恢复", value: "0.015" }],
      duration: "瞬时", cooldown: "500", costPT: "180", totalPT: "180", score: "217", ptRatio: "1.21",
      icon: "/images/skill-eiyo-hokyu.png", borderColor: "white",
    },
    upper: {
      nameJP: "食いしん坊", nameCN: "大胃王", rarity: "传说", restriction: "先行", iconColor: "蓝色",
      descCN: "比赛中盘回复持久力（作战·先行）",
      triggerCode: "running_style==2 &phase_random==1",
      triggerCondition: "先行，中盘",
      skillType: "耐力恢复", values: [{ type: "耐力恢复", value: "0.055" }],
      duration: "瞬时", cooldown: "500", costPT: "180", totalPT: "360", score: "508", ptRatio: "1.41",
      icon: "/images/skill-kuishinbo.png", borderColor: "gold", unlockFrom: "栄養補給",
    },
  },
  {
    id: "douaku",
    category: "被动技能",
    lower: {
      nameJP: "道悪○", nameCN: "路况不佳○", rarity: "普通", restriction: "通用", iconColor: "绿色",
      descCN: "稍微擅长「稍重」「重」「不良」的马场状态",
      triggerCode: "ground_condition==2 @ground_condition==3 @ground_condition==4",
      triggerCondition: "稍重场，重场，不良场",
      skillType: "被动（力量）", values: [{ type: "力量", value: "40" }],
      duration: "始终", cooldown: "0", costPT: "90", totalPT: "90", score: "129", ptRatio: "1.43",
      icon: "/images/skill-douaku-maruki.png", borderColor: "white",
    },
    upper: {
      nameJP: "道悪◎", nameCN: "路况不佳◎", rarity: "普通", restriction: "通用", iconColor: "绿色",
      descCN: "擅长「稍重」「重」「不良」的马场状态",
      triggerCode: "ground_condition==2 @ground_condition==3 @ground_condition==4",
      triggerCondition: "稍重场，重场，不良场",
      skillType: "被动（力量）", values: [{ type: "力量", value: "60" }],
      duration: "始终", cooldown: "0", costPT: "110", totalPT: "200", score: "174", ptRatio: "0.87",
      icon: "/images/skill-douaku-maruki.png", borderColor: "white",
    },
  },
  {
    id: "douaku-oni",
    category: "被动技能",
    lower: {
      nameJP: "道悪◎", nameCN: "路况不佳◎", rarity: "普通", restriction: "通用", iconColor: "绿色",
      descCN: "擅长「稍重」「重」「不良」的马场状态",
      triggerCode: "ground_condition==2 @ground_condition==3 @ground_condition==4",
      triggerCondition: "稍重场，重场，不良场",
      skillType: "被动（力量）", values: [{ type: "力量", value: "60" }],
      duration: "始终", cooldown: "0", costPT: "110", totalPT: "200", score: "174", ptRatio: "0.87",
      icon: "/images/skill-douaku-maruki.png", borderColor: "white",
    },
    upper: {
      nameJP: "道悪の鬼", nameCN: "道恶之鬼", rarity: "传说", restriction: "通用", iconColor: "绿色",
      descCN: "非常擅长「稍重」「重」「不良」的马场状态",
      triggerCode: "ground_condition==2 @ground_condition==3 @ground_condition==4",
      triggerCondition: "稍重场，重场，不良场",
      skillType: "被动（力量）", values: [{ type: "力量", value: "80" }],
      duration: "始终", cooldown: "0", costPT: "110", totalPT: "310", score: "304", ptRatio: "0.98",
      icon: "/images/skill-douaku-no-oni.png", borderColor: "gold",
    },
  },
];

/* ─── Normal Single Skills ─── */
const normalSkills: Skill[] = [
  {
    nameJP: "外差し準備", nameCN: "外道超车准备", rarity: "普通", restriction: "通用", iconColor: "黄色",
    descCN: "在外道准备超车时速度稍微提升",
    triggerCode: "lane_type==2 &is_overtake==1", triggerCondition: "外道，准备超车",
    skillType: "速度", values: [{ type: "速度", value: "0.15" }],
    duration: "3", cooldown: "500", costPT: "170", totalPT: "170", score: "217", ptRatio: "1.28",
    icon: "/images/skill-zenshinzenrei.png", borderColor: "white",
  },
  {
    nameJP: "行雲流水", nameCN: "行云流水", rarity: "普通", restriction: "通用", iconColor: "黄色",
    descCN: "在比赛全程保持冷静，速度稍微提升",
    triggerCode: "is_activate==1", triggerCondition: "激活时",
    skillType: "速度", values: [{ type: "速度", value: "0.1" }],
    duration: "始终", cooldown: "0", costPT: "180", totalPT: "180", score: "304", ptRatio: "1.69",
    icon: "/images/skill-matsukaze.png", borderColor: "white",
  },
];

/* ─── Legend Skills ─── */
const legendSkills: Skill[] = [
  {
    nameJP: "食いしん坊", nameCN: "大胃王", rarity: "传说", restriction: "先行", iconColor: "蓝色",
    descCN: "比赛中盘回复持久力（作战·先行）",
    triggerCode: "running_style==2 &phase_random==1", triggerCondition: "先行，中盘",
    skillType: "耐力恢复", values: [{ type: "耐力恢复", value: "0.055" }],
    duration: "瞬时", cooldown: "500", costPT: "180", totalPT: "360", score: "508", ptRatio: "1.41",
    icon: "/images/skill-kuishinbo.png", borderColor: "gold", unlockFrom: "栄養補給",
  },
  {
    nameJP: "全身全霊", nameCN: "全身心", rarity: "传说", restriction: "通用", iconColor: "黄色",
    descCN: "在最后冲刺的关键时刻，速度加快",
    triggerCode: "is_lastspurt==1 &phase_firsthalf_random==3", triggerCondition: "最终冲刺状态，终盘四分之三段随机位置",
    skillType: "速度", values: [{ type: "速度", value: "0.35" }],
    duration: "2.4", cooldown: "500", costPT: "170", totalPT: "340", score: "508", ptRatio: "1.49",
    icon: "/images/skill-zenshinzenrei.png", borderColor: "gold", unlockFrom: "末脚",
  },
];

/* ─── Non-inherit Skills ─── */
const nonInheritSkills: NonInheritSkill[] = [
  {
    nameJP: "星の煌き", nameCN: "星辉", icon: "/images/skill-hoshi-no-kirameki.png",
    descCN: "特别周的专属技能，不可继承",
    detail: {
      rarity: "独特", restriction: "通用", triggerCode: "is_activate==1", triggerCondition: "激活时",
      skillType: "全属性", values: [{ type: "全属性", value: "??" }],
      duration: "始终", cooldown: "0", score: "???",
    },
  },
];

const rarityStyle: Record<string, string> = {
  "普通": "border-gray-500/30 bg-gray-500/20 text-gray-300",
  "传说": "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
  "独特": "border-purple-500/30 bg-purple-500/20 text-purple-300",
  "普通·继承": "border-blue-500/30 bg-blue-500/20 text-blue-300",
  "普通·继承·进化": "border-pink-500/30 bg-pink-500/20 text-pink-300",
};

/* ═══════════════════════════════════════════
   Detail Panel (shared expanded content)
   ═══════════════════════════════════════════ */

function DetailPanel({ skill }: { skill: Skill }) {
  return (
    <div className="space-y-2.5 border-t border-[var(--border-subtle)] p-3">
      {/* Description */}
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{skill.descCN}</p>

      {/* Trigger Code */}
      <div className="skill-code text-[11px]">{skill.triggerCode.replace(/</g, "\u003c")}</div>

      {/* Trigger Condition */}
      <p className="text-xs text-[var(--text-primary)]">
        <span className="text-[var(--text-muted)]">触发条件: </span>
        {skill.triggerCondition}
      </p>

      {/* Skill Type Badges */}
      <div className="flex flex-wrap gap-1.5">
        {skill.skillType.split("、").map((t) => (
          <Badge key={t} variant="outline" className="h-5 border-[var(--accent-pink)]/30 bg-[var(--accent-pink)]/10 px-1.5 text-[10px] text-[var(--accent-pink)]">
            {t}
          </Badge>
        ))}
      </div>

      {/* Condition Branches (if exists) */}
      {skill.conditions && (
        <div className="grid gap-2 sm:grid-cols-2">
          {skill.conditions.map((c) => (
            <div key={c.label} className={`rounded-xl border ${c.special ? "border-yellow-500/60" : "border-[var(--border-subtle)]"} bg-[var(--bg-secondary)] p-3`}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent-pink)]">{c.label}</span>
                {c.special && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px] border-yellow-500/30 bg-yellow-500/20 text-yellow-300">特殊效果</Badge>
                )}
              </div>
              <p className="mb-2 text-[10px] text-[var(--text-muted)]">{c.desc}</p>
              {c.values.map((v) => (
                <div key={v.type} className="mb-1 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">{v.type}</p>
                  <p className="text-xl font-bold text-[var(--accent-orange)]">{v.value}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2">
                <span className="text-[10px] text-[var(--text-muted)]">持续: {c.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Values + Duration + Cooldown grid (no conditions) */}
      {!skill.conditions && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {skill.values.map((v) => (
            <div key={v.type} className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-center">
              <p className="text-[10px] text-[var(--text-muted)]">{v.type}</p>
              <p className="text-lg font-bold text-[var(--accent-orange)]">{v.value}</p>
            </div>
          ))}
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">持续时间</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{skill.duration}</p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">冷却时间</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{skill.cooldown}</p>
          </div>
        </div>
      )}

      {/* Score + PT Info */}
      <div className="flex flex-wrap items-center gap-2">
        {skill.costPT && (
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">消耗PT: </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{skill.costPT}</span>
          </div>
        )}
        {skill.totalPT && (
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">共需PT: </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{skill.totalPT}</span>
          </div>
        )}
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
          <span className="text-[10px] text-[var(--text-muted)]">评价分: </span>
          <span className="text-xs font-bold text-[var(--accent-pink)]">{skill.score}</span>
        </div>
        {skill.ptRatio && (
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">PT比: </span>
            <span className="text-xs font-bold text-[var(--accent-pink)]">{skill.ptRatio}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Inherent Skill Card (with source uma)
   ═══════════════════════════════════════════ */

function InherentCard({ skill }: { skill: InherentSkill }) {
  const [expanded, setExpanded] = useState(false);
  const canInherit = skill.rarity === "普通" || skill.rarity === "普通·继承" || skill.rarity === "普通·继承·进化";

  const borderClass = skill.rarity === "独特"
    ? "border-purple-500/60"
    : skill.rarity === "普通·继承·进化"
    ? "border-pink-500/60"
    : "border-blue-500/60";

  return (
    <div className={`overflow-hidden rounded-xl border ${borderClass} bg-[var(--bg-primary)]`}>
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-[var(--bg-elevated)]">
        {/* Icon */}
        <div className="relative flex-shrink-0 self-center">
          <div className={`overflow-hidden rounded-lg border ${borderClass} bg-[var(--bg-secondary)] p-0.5`}>
            <img src={import.meta.env.BASE_URL + skill.icon.slice(1)} alt={skill.nameJP} className="h-10 w-10 object-contain" />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 self-center">
          {/* Names */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold leading-tight" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{skill.nameJP}</span>
            <span className="text-xs text-[var(--accent-pink)] leading-tight">{skill.nameCN}</span>
          </div>
          {/* Tags */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={`h-4 px-1 text-[10px] ${rarityStyle[skill.rarity] || rarityStyle["普通"]}`}>{skill.rarity}</Badge>
            <Badge variant="outline" className="h-4 border-[var(--accent-pink)]/30 bg-[var(--accent-pink)]/10 px-1.5 text-[10px] text-[var(--accent-pink)]">
              {skill.sourceUma}
            </Badge>
            {canInherit ? (
              <Badge variant="outline" className="h-4 border-green-500/30 bg-green-500/10 px-1 text-[9px] text-green-300"><Unlock className="mr-0.5 h-2 w-2" />可继承</Badge>
            ) : (
              <Badge variant="outline" className="h-4 border-red-500/30 bg-red-500/10 px-1 text-[9px] text-red-300"><Lock className="mr-0.5 h-2 w-2" />不可继承</Badge>
            )}
          </div>
        </div>

        {/* Values + Expand */}
        <div className="flex flex-shrink-0 items-center gap-2 self-center">
          {skill.values.map((v) => (
            <div key={v.type} className="text-right hidden sm:block">
              <p className="text-[9px] leading-none text-[var(--text-muted)]">{v.type}</p>
              <p className="text-sm font-bold leading-none text-[var(--accent-orange)]">{v.value}</p>
            </div>
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DetailPanel skill={skill} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Compact Skill Row
   ═══════════════════════════════════════════ */

function CompactRow({ skill, isUpper }: { skill: Skill; isUpper: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const canInherit = skill.rarity === "普通" || skill.rarity === "普通·继承";

  const borderClass = skill.borderColor === "gold"
    ? "border-yellow-500/60"
    : skill.borderColor === "purple"
    ? "border-purple-500/60"
    : "border-[var(--border-subtle)]";

  return (
    <div className={`overflow-hidden rounded-xl border ${borderClass} bg-[var(--bg-primary)]`}>
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-[var(--bg-elevated)]">
        {/* Icon */}
        <div className="relative flex-shrink-0 self-center">
          <div className={`overflow-hidden rounded-lg border ${borderClass} bg-[var(--bg-secondary)] p-0.5`}>
            <img src={import.meta.env.BASE_URL + skill.icon.slice(1)} alt={skill.nameJP} className="h-10 w-10 object-contain" />
          </div>
          {isUpper !== undefined && (
            <div className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${isUpper ? "bg-yellow-500/80 text-black" : "bg-gray-500/80 text-white"}`}>
              {isUpper ? "上" : "下"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 self-center">
          {/* Names — allow wrapping on mobile */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold leading-tight" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{skill.nameJP}</span>
            <span className="text-xs text-[var(--accent-pink)] leading-tight">{skill.nameCN}</span>
          </div>
          {/* Tags */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={`h-4 px-1 text-[10px] ${rarityStyle[skill.rarity] || rarityStyle["普通"]}`}>{skill.rarity}</Badge>
            <span className="text-[10px] text-[var(--text-muted)]">{skill.restriction}</span>
            {canInherit ? (
              <Badge variant="outline" className="h-4 border-green-500/30 bg-green-500/10 px-1 text-[9px] text-green-300"><Unlock className="mr-0.5 h-2 w-2" />可继承</Badge>
            ) : (
              <Badge variant="outline" className="h-4 border-red-500/30 bg-red-500/10 px-1 text-[9px] text-red-300"><Lock className="mr-0.5 h-2 w-2" />不可继承</Badge>
            )}
          </div>
        </div>

        {/* Values + Expand */}
        <div className="flex flex-shrink-0 items-center gap-2 self-center">
          {skill.values.map((v) => (
            <div key={v.type} className="text-right hidden sm:block">
              <p className="text-[9px] leading-none text-[var(--text-muted)]">{v.type}</p>
              <p className="text-sm font-bold leading-none text-[var(--accent-orange)]">{v.value}</p>
            </div>
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DetailPanel skill={skill} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Legend Skill Card
   ═══════════════════════════════════════════ */

function LegendCard({ skill }: { skill: Skill }) {
  const [expanded, setExpanded] = useState(false);
  const canInherit = skill.rarity === "普通";

  return (
    <div className="overflow-hidden rounded-xl border border-yellow-500/60 bg-[var(--bg-primary)]">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-[var(--bg-elevated)]">
        <div className="relative flex-shrink-0 self-center">
          <div className="overflow-hidden rounded-lg border border-yellow-500/60 bg-[var(--bg-secondary)] p-0.5">
            <img src={import.meta.env.BASE_URL + skill.icon.slice(1)} alt={skill.nameJP} className="h-10 w-10 object-contain" />
          </div>
        </div>
        <div className="min-w-0 flex-1 self-center">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold leading-tight" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{skill.nameJP}</span>
            <span className="text-xs text-[var(--accent-pink)] leading-tight">{skill.nameCN}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={`h-4 px-1 text-[10px] ${rarityStyle[skill.rarity]}`}>{skill.rarity}</Badge>
            {skill.unlockFrom && <span className="text-[10px] text-[var(--accent-orange)]">{skill.unlockFrom} 可解锁</span>}
            {canInherit ? (
              <Badge variant="outline" className="h-4 border-green-500/30 bg-green-500/10 px-1 text-[9px] text-green-300"><Unlock className="mr-0.5 h-2 w-2" />可继承</Badge>
            ) : (
              <Badge variant="outline" className="h-4 border-red-500/30 bg-red-500/10 px-1 text-[9px] text-red-300"><Lock className="mr-0.5 h-2 w-2" />不可继承</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 self-center">
          {skill.values.map((v) => (
            <div key={v.type} className="text-right hidden sm:block">
              <p className="text-[9px] leading-none text-[var(--text-muted)]">{v.type}</p>
              <p className="text-sm font-bold leading-none text-[var(--accent-orange)]">{v.value}</p>
            </div>
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DetailPanel skill={skill} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Non-Inherit Skill Card
   ═══════════════════════════════════════════ */

function NonInheritCard({ skill }: { skill: NonInheritSkill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-red-500/60 bg-[var(--bg-primary)]">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-[var(--bg-elevated)]">
        <div className="relative flex-shrink-0 self-center">
          <div className="overflow-hidden rounded-lg border border-red-500/60 bg-[var(--bg-secondary)] p-0.5">
            <img src={import.meta.env.BASE_URL + skill.icon.slice(1)} alt={skill.nameJP} className="h-10 w-10 object-contain" />
          </div>
          <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80">
            <Ban className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1 self-center">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold leading-tight" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{skill.nameJP}</span>
            <span className="text-xs text-[var(--accent-pink)] leading-tight">{skill.nameCN}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="h-4 px-1 text-[10px] border-purple-500/30 bg-purple-500/20 text-purple-300">独特</Badge>
            <Badge variant="outline" className="h-4 border-red-500/30 bg-red-500/10 px-1 text-[9px] text-red-300"><Ban className="mr-0.5 h-2 w-2" />不可继承</Badge>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center self-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && skill.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">{skill.descCN}</p>
              <div className="skill-code text-[11px]">{skill.detail.triggerCode.replace(/</g, "\u003c")}</div>
              <p className="text-xs text-[var(--text-primary)]">
                <span className="text-[var(--text-muted)]">触发: </span>{skill.detail.triggerCondition}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skill.detail.skillType.split("、").map((t) => (
                  <Badge key={t} variant="outline" className="h-5 border-[var(--accent-pink)]/30 bg-[var(--accent-pink)]/10 px-1.5 text-[10px] text-[var(--accent-pink)]">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {skill.detail.values.map((v) => (
                  <div key={v.type} className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">{v.type}</p>
                    <p className="text-lg font-bold text-[var(--accent-orange)]">{v.value}</p>
                  </div>
                ))}
                <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-center">
                  <p className="text-[10px] text-[var(--text-muted)]">持续</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{skill.detail.duration}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
                <span className="text-[10px] text-[var(--text-muted)]">冷却: {skill.detail.cooldown}</span>
                <span className="text-xs font-bold text-[var(--accent-pink)]">评价: {skill.detail.score}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export default function SkillIndex() {
  const [activeTab, setActiveTab] = useState<"all" | "inherent" | "inherent-inherit" | "normal" | "passive" | "legend" | "non-inherit">("all");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { key: "all" as const, label: "全部" },
    { key: "inherent" as const, label: "固有技能" },
    { key: "inherent-inherit" as const, label: "固有继承" },
    { key: "normal" as const, label: "普通技能" },
    { key: "passive" as const, label: "被动技能" },
    { key: "legend" as const, label: "传说技能" },
    { key: "non-inherit" as const, label: "不可继承" },
  ];

  const colorFilters = [
    { key: "黄色", label: "黄色", class: "border-yellow-500/60 bg-yellow-500/10 text-yellow-300" },
    { key: "蓝色", label: "蓝色", class: "border-blue-500/60 bg-blue-500/10 text-blue-300" },
    { key: "绿色", label: "绿色", class: "border-green-500/60 bg-green-500/10 text-green-300" },
    { key: "红色", label: "红色", class: "border-red-500/60 bg-red-500/10 text-red-300" },
  ];

  const matchesColor = (skill: Skill) => !colorFilter || skill.iconColor === colorFilter;
  const matchesSearch = (skill: Skill) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return skill.nameJP.toLowerCase().includes(q) || skill.nameCN.toLowerCase().includes(q);
  };
  const matchesSearchNonInherit = (s: NonInheritSkill) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.nameJP.toLowerCase().includes(q) || s.nameCN.toLowerCase().includes(q);
  };

  const filteredChains = activeTab === "all" ? skillChains
    : skillChains.filter((c) => c.category === (activeTab === "normal" ? "普通技能" : activeTab === "passive" ? "被动技能" : ""));

  const colorFilteredChains = colorFilter
    ? filteredChains.filter((c) => matchesColor(c.lower) || matchesColor(c.upper))
    : filteredChains;

  const filteredNormal = colorFilter
    ? normalSkills.filter(matchesColor)
    : normalSkills;

  const filteredLegend = colorFilter
    ? legendSkills.filter(matchesColor)
    : legendSkills;

  const filteredInherentUnique = inherentUniqueSkills.filter((s) => matchesColor(s) && matchesSearch(s));
  const filteredInherentInherit = inherentInheritSkills.filter((s) => matchesColor(s) && matchesSearch(s));

  const showInherent = (activeTab === "all" || activeTab === "inherent") && filteredInherentUnique.length > 0;
  const showInherentInherit = (activeTab === "all" || activeTab === "inherent-inherit") && filteredInherentInherit.length > 0;
  const showLegend = (activeTab === "all" || activeTab === "legend") && (!colorFilter || filteredLegend.length > 0);
  const showNormal = activeTab === "all" || activeTab === "normal";
  const showPassive = activeTab === "all" || activeTab === "passive";
  const showNonInherit = (activeTab === "all" || activeTab === "non-inherit") && !colorFilter;
  const showNormalSingle = showNormal && !colorFilter;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-12">
      {/* Back Button */}
      <div className="fixed top-20 left-4 z-40">
        <Link to="/" className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
          <ArrowLeft className="h-4 w-4" />
          <span>返回图鉴</span>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">技能一览</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Skill Index</p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[var(--accent-pink)]" />
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-4 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--accent-pink)] text-white shadow-lg"
                  : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Color Filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-4 flex flex-wrap justify-center gap-2">
          <span className="mr-2 flex items-center text-xs text-[var(--text-muted)]">图标颜色:</span>
          {colorFilters.map((cf) => (
            <button
              key={cf.key}
              onClick={() => setColorFilter(colorFilter === cf.key ? null : cf.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${cf.class} ${
                colorFilter === cf.key ? "ring-2 ring-offset-1 ring-offset-[var(--bg-primary)] ring-[var(--accent-pink)]" : "opacity-60 hover:opacity-100"
              }`}
            >
              {cf.label}
            </button>
          ))}
          {colorFilter && (
            <button onClick={() => setColorFilter(null)} className="ml-2 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-pink)]">
              清除筛选
            </button>
          )}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-8 mx-auto max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索技能名称（日文/中文）..."
              className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-pink)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-pink)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ═══ Inherent Skills (Unique) ═══ */}
        {showInherent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px]">固有技能</Badge>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <div className="space-y-2">
              {filteredInherentUnique.map((skill, i) => (
                <InherentCard key={i} skill={skill} />
              ))}
            </div>
            {filteredInherentUnique.length === 0 && searchQuery && (
              <p className="py-4 text-center text-sm text-[var(--text-muted)]">无匹配结果</p>
            )}
          </motion.div>
        )}

        {/* ═══ Inherent Skills (Inherit) ═══ */}
        {showInherentInherit && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={showInherent ? "mt-6" : ""}>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-[10px]">固有继承技能</Badge>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <div className="space-y-2">
              {filteredInherentInherit.map((skill, i) => (
                <InherentCard key={i} skill={skill} />
              ))}
            </div>
            {filteredInherentInherit.length === 0 && searchQuery && (
              <p className="py-4 text-center text-sm text-[var(--text-muted)]">无匹配结果</p>
            )}
          </motion.div>
        )}

        {/* ═══ Skill Chains (普通 + 被动) ═══ */}
        {(showNormal || showPassive) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${!colorFilter && (showInherent || showInherentInherit) ? "mt-8" : ""} space-y-6`}>
            {colorFilteredChains.map((chain) => (
              <motion.div key={chain.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px]">{chain.category}</Badge>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{chain.lower.nameCN}</span>
                  <span className="text-xs text-[var(--text-muted)]">→</span>
                  <span className="text-sm font-bold text-[var(--accent-pink)]">{chain.upper.nameCN}</span>
                  <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <CompactRow skill={chain.lower} isUpper={false} />
                  <CompactRow skill={chain.upper} isUpper={true} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══ Normal Single Skills ═══ */}
        {showNormalSingle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px]">普通技能</Badge>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <div className="space-y-2">
              {filteredNormal.map((skill, i) => (
                <CompactRow key={i} skill={skill} isUpper={false} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ Legend Skills ═══ */}
        {showLegend && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-300 text-[10px]">传说技能</Badge>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <div className="space-y-2">
              {filteredLegend.map((skill, i) => (
                <LegendCard key={i} skill={skill} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ Non-Inherit Skills ═══ */}
        {showNonInherit && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline" className="border-red-500/30 text-red-300 text-[10px]">不可继承</Badge>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <div className="space-y-2">
              {nonInheritSkills.filter(matchesSearchNonInherit).map((skill) => (
                <NonInheritCard key={skill.nameJP} skill={skill} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[var(--accent-pink)]" fill="var(--accent-pink)" />
              <span className="text-lg font-bold">赛马娘<span className="text-[var(--accent-pink)]">Wiki</span></span>
            </Link>
            <p className="text-xs text-[var(--text-muted)]">赛马娘 Pretty Derby 版权归 Cygames 所有 | 本站为 fan-made 项目</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
