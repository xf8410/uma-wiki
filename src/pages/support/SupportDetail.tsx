import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Star, TrendingUp, Zap } from "lucide-react";
import { supportCards } from "@/data/supportCards";
import { cardDetails } from "@/data/supportCardDetails";
import { supportCardSkills } from "@/data/supportCardSkills";
import { skillData } from "@/data/skillData";

const TYPE_COLORS: Record<string, string> = {
  "速度": "text-red-400 border-red-500/30 bg-red-500/10",
  "耐力": "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  "力量": "text-orange-400 border-orange-500/30 bg-orange-500/10",
  "根性": "text-purple-400 border-purple-500/30 bg-purple-500/10",
  "智力": "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "友人": "text-green-400 border-green-500/30 bg-green-500/10",
};

// 等级显示的关键节点
const KEY_LEVELS = [1, 10, 20, 30, 40, 50];

export default function SupportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const card = supportCards.find((c) => c.id === Number(id));
  const detail = cardDetails[Number(id)];
  const skills = supportCardSkills[Number(id)];

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">支援卡不存在</p>
          <button onClick={() => navigate("/support")} className="mt-4 text-[var(--accent-pink)] hover:underline">
            返回支援卡目录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <button onClick={() => navigate("/")} className="hover:text-[var(--accent-pink)] transition-colors">首页</button>
            <span>&gt;</span>
            <button onClick={() => navigate("/support")} className="hover:text-[var(--accent-pink)] transition-colors">支援卡图鉴</button>
            <span>&gt;</span>
            <span className="text-[var(--text-primary)] font-medium">{card.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left: Image */}
            <div className="md:w-72 flex-shrink-0 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] p-4 flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}support/${card.id}.png`}
                alt={card.name}
                className="h-auto w-full max-h-96 object-contain rounded-xl"
                loading="eager"
                decoding="async"
                width="384"
                height="512"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Right: Basic Info */}
            <div className="flex-1 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`rounded-full border px-3 py-1 text-sm font-bold ${
                  card.rarity === "SSR" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                }`}>
                  {card.rarity}
                </span>
                <span className={`rounded-full border px-3 py-1 text-sm font-medium ${TYPE_COLORS[card.type]}`}>
                  {card.type}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{card.name}</h1>
              <p className="text-sm text-[var(--text-muted)]">ID: {card.id}</p>

              {/* Back button */}
              <button
                onClick={() => navigate("/support")}
                className="mt-4 flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]"
              >
                <ArrowLeft className="h-4 w-4" />
                返回列表
              </button>
            </div>
          </div>
        </motion.div>

        {/* Effects Section */}
        {detail && detail.effects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            <div className="border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--accent-pink)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">支援效果</h2>
              </div>
            </div>

            {/* Effect Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] sticky left-0 bg-[var(--bg-primary)]">效果类型</th>
                    {KEY_LEVELS.map((lv) => (
                      <th key={lv} className="px-3 py-3 text-center text-xs font-medium text-[var(--text-muted)]">
                        <div className="flex flex-col items-center">
                          <span>Lv</span>
                          <span className="text-[var(--accent-pink)] font-bold">{lv}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.effects.map((eff, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-primary)] ${
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-primary)]/30'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)] sticky left-0 bg-inherit">
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-[var(--accent-pink)]" />
                          {eff.t}
                        </div>
                      </td>
                      {KEY_LEVELS.map((lv) => {
                        const val = eff.l[`lv${lv}`];
                        const hasValue = val !== undefined && val > 0;
                        return (
                          <td key={lv} className="px-3 py-3 text-center">
                            {hasValue ? (
                              <span className="inline-flex items-center justify-center rounded-lg bg-[var(--accent-pink)]/10 px-2 py-1 text-xs font-bold text-[var(--accent-pink)]">
                                {val >= 100 ? `${(val/100).toFixed(0)}%` : `+${val}`}
                              </span>
                            ) : (
                              <span className="text-[var(--border-subtle)]">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Skills Section */}
        {skills && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            <div className="border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">技能信息</h2>
              </div>
            </div>

            {/* Hint Skills */}
            {skills.hintSkills.length > 0 && (
              <div className="p-6 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold text-[var(--accent-pink)] mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  训练 Hint 技能
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    （训练时随机获得技能 Hint）
                  </span>
                </h3>
                <div className="space-y-2">
                  {skills.hintSkills.map((sid) => (
                    <div
                      key={sid}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-4 py-3"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-xs font-bold text-yellow-400">
                        H
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {skillData[sid] || `Skill #${sid}`}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">ID: {sid}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Skills */}
            {skills.eventSkills.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-bold text-[var(--accent-pink)] mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  事件技能
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    （通过支援卡事件获得）
                  </span>
                </h3>
                <div className="space-y-2">
                  {skills.eventSkills.map((sid) => (
                    <div
                      key={sid}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-4 py-3"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-400">
                        E
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {skillData[sid] || `Skill #${sid}`}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">ID: {sid}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No skills */}
            {skills.hintSkills.length === 0 && skills.eventSkills.length === 0 && (
              <div className="p-6">
                <p className="text-sm text-[var(--text-muted)]">暂无技能数据</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
