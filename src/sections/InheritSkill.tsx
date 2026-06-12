import { useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Timer, Award, Coins, ArrowRight, Link2 } from "lucide-react";
import { toast } from "sonner";

const skillData = {
  nameJP: "シューティングスター",
  nameCN: "流星",
  nameEN: "Shooting star",
  rarity: "普通·继承",
  restriction: "通用",
  iconColor: "黄色",
  descJP:
    "レース終盤以降に追い抜いて中団以前につけるとわずかに前に出続けて加速力をほんのちょっと上げ続ける",
  descCN:
    "在比赛终盘处于队伍中游靠前并超过对手时，就会乘势稍微向前突进且提升微量加速度",
  triggerCode: "phase>=2 &order>=1 &order_rate<=70 &change_order_onetime<0",
  triggerCondition: "终盘，名次≥1，名次≤70%，超过至少一人",
  skillType: "即时速度、加速度",
  values: [
    { type: "即时速度", value: "0.15" },
    { type: "加速度", value: "0.05" },
  ],
  duration: "3.6",
  cooldown: "500",
  costPT: "200",
  totalPT: "200",
  score: "180",
  ptRatio: "0.90",
};

export default function InheritSkill() {
  const handleSkillClick = useCallback(() => {
    toast.info("技能详细页面即将上线", {
      description: "敬请期待更多马娘数据！",
      duration: 3000,
    });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="card-hover relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8"
        style={{ borderTop: "4px solid var(--accent-pink)" }}
      >
        {/* Badge: Rarity */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="border border-blue-500/30 bg-blue-500/20 text-blue-300"
          >
            {skillData.rarity}
          </Badge>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Skill Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-shrink-0 flex-col items-center gap-3"
          >
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1">
              <img
                src="/images/skill-inherit-shooting-star.png"
                alt="シューティングスター 继承"
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              >
                {skillData.iconColor}
              </Badge>
            </div>
          </motion.div>

          {/* Skill Info */}
          <div className="flex-1 space-y-4">
            {/* Names - Clickable */}
            <div>
              <button
                onClick={handleSkillClick}
                className="group flex items-center gap-2 transition-colors"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)]" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
                  {skillData.nameJP}
                </h3>
                <Link2 className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[var(--accent-pink)]" />
              </button>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={handleSkillClick}
                  className="group text-base font-semibold text-[var(--accent-pink)] transition-colors hover:underline"
                >
                  {skillData.nameCN}
                </button>
                <span className="text-sm text-[var(--text-muted)]">
                  {skillData.nameEN}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-300"
              >
                条件: {skillData.restriction}
              </Badge>
            </div>

            {/* Descriptions */}
            <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
                {skillData.descJP}
              </p>
              <div className="border-t border-[var(--border-subtle)] pt-2">
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {skillData.descCN}
                </p>
              </div>
            </div>

            {/* Trigger Code */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                触发代码
              </span>
              <div className="skill-code">{skillData.triggerCode.replace(/</g, '\u003c')}</div>
            </div>

            {/* Trigger Condition */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                触发条件
              </span>
              <p className="text-sm text-[var(--text-primary)]">
                {skillData.triggerCondition}
              </p>
            </div>

            {/* Skill Type */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                技能类型
              </span>
              <div className="flex gap-2">
                {skillData.skillType.split("、").map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="border-[var(--accent-pink)]/30 bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Values Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                技能数值
              </span>
              <div className="grid grid-cols-2 gap-3">
                {skillData.values.map((v) => (
                  <div
                    key={v.type}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center"
                  >
                    <p className="text-xs text-[var(--text-muted)]">{v.type}</p>
                    <p className="text-2xl font-bold text-[var(--accent-orange)]">
                      {v.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration, Cooldown, Score */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">持续时间</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {skillData.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Timer className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">冷却时间</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {skillData.cooldown}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Award className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">评价分</p>
                  <p className="text-lg font-bold text-[var(--accent-pink)]">
                    {skillData.score}
                  </p>
                </div>
              </div>
            </div>

            {/* PT Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">技能消耗PT</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {skillData.costPT}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">共需技能PT</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {skillData.totalPT}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                <Award className="h-4 w-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">PT评价比</p>
                  <p className="text-lg font-bold text-[var(--accent-pink)]">
                    {skillData.ptRatio}
                  </p>
                </div>
              </div>
            </div>

            {/* Link to detail */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkillClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--accent-pink)]/40 bg-[var(--accent-pink)]/5 py-3 text-sm font-medium text-[var(--accent-pink)] transition-colors hover:bg-[var(--accent-pink)]/10"
            >
              <span>查看详细技能页面</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
