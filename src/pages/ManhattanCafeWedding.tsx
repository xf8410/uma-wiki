import { useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Star, Calendar, Ruler, Weight, Mic,
  Timer, Award, ArrowLeft, Coins, ArrowRight, Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════
   幽玄薔薇 — 婚纱曼城茶座
   ═══════════════════════════════════════════ */

const basicInfo = [
  { icon: Mic, label: "CV", value: "小仓唯" },
  { icon: Calendar, label: "生日", value: "3月5日" },
  { icon: Ruler, label: "身高", value: "155cm" },
  { icon: Weight, label: "体重", value: "无增减" },
];

const uniqueSkill = {
  nameJP: "迷える時も、幽かなる時も",
  nameCN: "彷徨四顾，花前月下",
  nameEN: "Mayoru Toki mo, Kasukaru Toki mo",
  rarity: "独特",
  restriction: "差行",
  iconColor: "蓝色",
  descJP: "レース中盤に持久力を回復する\n長距離レースならその後\nレース後半に中団にいると前に出続ける\n＜作戦・差し＞",
  descCN: "比赛中盘回复耐力\n若是长距离比赛则\n在比赛后半段位于中后方时持续向前突进\n＜作战・差行＞",
  triggerCode: "条件1: phase==1 &running_style==3\n条件2: is_activate_other_skill_detail==1 &distance_type==4 &distance_rate>=50 &order_rate>=30 &order_rate<=70",
  triggerCondition: "条件1：中盘、差行\n条件2：发动第一段技能、长距离、行进距离≥50%、30%≤名次≤70%",
  skillType: "耐力恢复、即时速度",
  values: [{ type: "耐力恢复", value: "0.055" }],
  duration: "瞬时",
  cooldown: "500",
  costPT: "",
  totalPT: "",
  score: "340",
  ptRatio: "",
  icon: "/images/manhattan-wedding-skill-unique.png",
  conditions: [
    { label: "条件1", desc: "中盘、差行", values: [{ type: "耐力恢复", value: "0.055" }], duration: "瞬时" },
    { label: "条件2", desc: "长距离、后半段、中团", values: [{ type: "即时速度", value: "0.35" }], duration: "6" },
  ],
};

const inheritSkill = {
  nameJP: "迷える時も、幽かなる時も",
  nameCN: "彷徨四顾，花前月下",
  nameEN: "Mayoru Toki mo, Kasukaru Toki mo",
  rarity: "普通·继承",
  restriction: "差行",
  iconColor: "蓝色",
  descJP: "レース中盤に持久力をわずかに回復する\n＜作戦・差し＞",
  descCN: "比赛中盘稍微回复耐力\n＜作战・差行＞",
  triggerCode: "phase==1 &running_style==3",
  triggerCondition: "中盘、差行",
  skillType: "耐力恢复",
  values: [{ type: "耐力恢复", value: "0.015" }],
  duration: "瞬时",
  cooldown: "500",
  costPT: "200",
  totalPT: "200",
  score: "180",
  ptRatio: "0.90",
  icon: "/images/manhattan-wedding-skill-inherit.png",
};

const gradeColors: Record<string, string> = {
  S: "var(--grade-s)", A: "var(--grade-a)", B: "var(--grade-b)",
  C: "var(--grade-c)", D: "var(--grade-d)", E: "var(--grade-e)",
  F: "var(--grade-f)", G: "var(--grade-g)",
};

const fieldData = [
  { label: "草地", grade: "A" }, { label: "泥地", grade: "G" },
];
const distanceData = [
  { label: "短距离", grade: "G" }, { label: "英里", grade: "F" },
  { label: "中距离", grade: "B" }, { label: "长距离", grade: "A" },
];
const strategyData = [
  { label: "逃", grade: "G" }, { label: "先行", grade: "C" },
  { label: "差行", grade: "A" }, { label: "追", grade: "C" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ManhattanCafeWedding() {
  const handleSkillClick = useCallback(() => {
    toast.info("技能详细页面即将上线", { description: "敬请期待更多马娘数据！", duration: 3000 });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="fixed top-20 left-4 z-40">
        <Link to="/" className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
          <ArrowLeft className="h-4 w-4" />
          <span>返回图鉴</span>
        </Link>
      </div>

      <section className="relative overflow-hidden pt-24 pb-12" style={{ background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 space-y-6">
              <motion.div variants={itemVariants} className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400" fill="currentColor" />)}
                <span className="ml-2 text-sm text-[var(--text-muted)]">初始三星 · 幽玄薔薇</span>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <p className="text-lg font-semibold" style={{ color: "#6b5ce7", fontFamily: '"Noto Sans JP", sans-serif' }}>幽玄薔薇</p>
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-5xl">婚纱曼城茶座</h1>
                <p className="font-[Poppins] text-lg italic text-[var(--text-muted)]">Manhattan Cafe (Wedding)</p>
              </motion.div>
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {basicInfo.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[var(--text-muted)]">
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  身着黑白色调婚纱的曼城茶座。暗红色玫瑰点缀于裙摆之上，
                  与平日阴暗神秘的她截然不同， wedding dress下的她依旧追逐着那道看不见的身影。
                  「我呢……有个想要追上的朋友……她总是跑在我前面……」
                </p>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} className="relative flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ background: "radial-gradient(circle, rgba(107,92,231,0.25) 0%, transparent 70%)" }} />
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <img src="/images/manhattan-wedding-victory.png" alt="婚纱曼城茶座 - 决胜服" className="h-auto w-72 object-contain sm:w-80 lg:w-96" />
                </div>
                <div className="absolute -bottom-4 -right-4 overflow-hidden rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
                  <img src="/images/manhattan-wedding-icon.png" alt="婚纱曼城茶座头像" className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Adaptation */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">适应性</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Adaptation</p>
          </div>
          <div className="space-y-3">
            {[{ title: "场地", color: "var(--accent-orange)", cells: fieldData, cols: 2 },
              { title: "距离", color: "var(--accent-purple)", cells: distanceData, cols: 4 },
              { title: "跑法", color: "var(--accent-pink)", cells: strategyData, cols: 4 }].map((row) => (
              <div key={row.title}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-1 w-4 rounded-full" style={{ background: row.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{row.title}</span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.cols}, minmax(0, 1fr))` }}>
                  {row.cells.map((cell) => (
                    <motion.div key={cell.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }} className="flex flex-col items-center justify-center h-24 sm:h-28 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                      <span className="text-[10px] text-[var(--text-muted)] text-center leading-tight">{cell.label}</span>
                      <span className="text-3xl font-extrabold sm:text-4xl" style={{ color: gradeColors[cell.grade] }}>{cell.grade}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Unique Skill */}
      <section id="skill" className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="card-hover relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8" style={{ borderTop: "4px solid var(--accent-orange)" }}>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="border border-purple-500/30 bg-purple-500/20 text-purple-300">{uniqueSkill.rarity}</Badge>
          </div>
          <div className="flex flex-col gap-6 md:flex-row">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-shrink-0 flex-col items-center gap-3">
              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1">
                <img src={uniqueSkill.icon} alt={uniqueSkill.nameJP} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">{uniqueSkill.iconColor}</Badge>
            </motion.div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{uniqueSkill.nameJP}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-semibold text-[var(--accent-pink)]">{uniqueSkill.nameCN}</span>
                  <span className="text-sm text-[var(--text-muted)]">{uniqueSkill.nameEN}</span>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">条件: {uniqueSkill.restriction}</Badge>
              <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{uniqueSkill.descJP}</p>
                <div className="border-t border-[var(--border-subtle)] pt-2">
                  <p className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-line">{uniqueSkill.descCN}</p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">触发代码</span>
                <div className="skill-code">{uniqueSkill.triggerCode.replace(/</g, '\u003c')}</div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">触发条件</span>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-line">{uniqueSkill.triggerCondition}</p>
              </div>
              {/* Condition Branches */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">技能数值</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {uniqueSkill.conditions?.map((c) => (
                    <div key={c.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--accent-pink)]">{c.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{c.desc}</span>
                      </div>
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
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Timer className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">冷却时间</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{uniqueSkill.cooldown}</p>
                </div>
                <div className="ml-4 border-l border-[var(--border-subtle)] pl-4">
                  <p className="text-xs text-[var(--text-muted)]">评价分</p>
                  <p className="text-lg font-bold text-[var(--accent-pink)]">{uniqueSkill.score}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Inherit Skill */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="card-hover relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8" style={{ borderTop: "4px solid var(--accent-pink)" }}>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="border border-blue-500/30 bg-blue-500/20 text-blue-300">{inheritSkill.rarity}</Badge>
          </div>
          <div className="flex flex-col gap-6 md:flex-row">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-shrink-0 flex-col items-center gap-3">
              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1">
                <img src={inheritSkill.icon} alt={`继承·${inheritSkill.nameJP}`} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">{inheritSkill.iconColor}</Badge>
            </motion.div>
            <div className="flex-1 space-y-4">
              <div>
                <button onClick={handleSkillClick} className="group flex items-center gap-2 transition-colors">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)]" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{inheritSkill.nameJP}</h3>
                  <Link2 className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[var(--accent-pink)]" />
                </button>
                <div className="mt-1 flex items-center gap-2">
                  <button onClick={handleSkillClick} className="text-base font-semibold text-[var(--accent-pink)] transition-colors hover:underline">{inheritSkill.nameCN}</button>
                  <span className="text-sm text-[var(--text-muted)]">{inheritSkill.nameEN}</span>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">条件: {inheritSkill.restriction}</Badge>
              <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>{inheritSkill.descJP}</p>
                <div className="border-t border-[var(--border-subtle)] pt-2">
                  <p className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-line">{inheritSkill.descCN}</p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">触发代码</span>
                <div className="skill-code">{inheritSkill.triggerCode.replace(/</g, '\u003c')}</div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">触发条件</span>
                <p className="text-sm text-[var(--text-primary)]">{inheritSkill.triggerCondition}</p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">技能数值</span>
                <div className="grid grid-cols-3 gap-3">
                  {inheritSkill.values.map((v) => (
                    <div key={v.type} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                      <p className="text-xs text-[var(--text-muted)]">{v.type}</p>
                      <p className="text-2xl font-bold text-[var(--accent-orange)]">{v.value}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                    <p className="text-xs text-[var(--text-muted)]">持续</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{inheritSkill.duration}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ icon: Timer, label: "冷却时间", value: inheritSkill.cooldown }, { icon: Award, label: "评价分", value: inheritSkill.score, accent: true }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                    <item.icon className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                      <p className="text-lg font-bold" style={{ color: item.accent ? "var(--accent-pink)" : "var(--text-primary)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ icon: Coins, label: "技能消耗PT", value: inheritSkill.costPT }, { icon: Coins, label: "共需技能PT", value: inheritSkill.totalPT }, { icon: Award, label: "PT评价比", value: inheritSkill.ptRatio, accent: true }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                    <item.icon className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                      <p className="text-lg font-bold" style={{ color: item.accent ? "var(--accent-pink)" : "var(--text-primary)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSkillClick} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--accent-pink)]/40 bg-[var(--accent-pink)]/5 py-3 text-sm font-medium text-[var(--accent-pink)] transition-colors hover:bg-[var(--accent-pink)]/10">
                <span>查看详细技能页面</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Chibi */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} className="fixed bottom-6 left-6 z-50">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="group relative">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl transition-all group-hover:border-[#6b5ce7] group-hover:shadow-violet-500/20">
            <img src="/images/manhattan-wedding-chibi.png" alt="婚纱曼城茶座 小人" className="h-full w-full object-contain" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--bg-secondary)] px-2 py-1 text-[10px] text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 border border-[var(--border-subtle)]">
            婚纱曼城茶座 · 小人
          </div>
        </motion.div>
      </motion.div>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
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
