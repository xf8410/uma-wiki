import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Calculator, List, Info } from "lucide-react";
import { umaList } from "@/data/umaList";
import { compatibilityRanking } from "@/data/compatibilityRanking";
import { relationGroups } from "./CompatibilityData";
import CompatibilityCalc from "./CompatibilityCalc";

type TabMode = "calc" | "rank" | "detail";

export default function CompatibilityIndex() {
  const [activeTab, setActiveTab] = useState<TabMode>("calc");
  const [rankSearch, setRankSearch] = useState("");

  // 排行榜数据（从U-tools获取的真实数据）
  const rankList = useMemo(() => {
    return compatibilityRanking.map((r) => {
      const uma = umaList.find((u) => u.nameJP === r.nameJP || u.nameCN === r.nameCN);
      return {
        cardId: uma?.cardId || r.nameJP,
        nameCN: r.nameCN,
        nameJP: r.nameJP,
        icon: uma?.icon || "/icons/default.png",
        score: r.totalScore,
      };
    });
  }, []);

  const filteredRank = useMemo(() => {
    if (!rankSearch.trim()) return rankList;
    const q = rankSearch.toLowerCase();
    return rankList.filter((u) => u.nameCN.includes(q) || u.nameJP.toLowerCase().includes(q));
  }, [rankList, rankSearch]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-center">
          <div className="fixed top-20 left-4 z-40">
            <Link to="/" className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
              <ArrowLeft className="h-4 w-4" />
              <span>返回图鉴</span>
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">相性计算器</h1>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-[var(--accent-pink)]" />
        </motion.div>

        {/* Tab Switcher */}
        <div className="mb-6 flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-1">
          {[
            { key: "detail" as TabMode, label: "詳細", icon: Info },
            { key: "rank" as TabMode, label: "相性ランキング", icon: List },
            { key: "calc" as TabMode, label: "相性計算", icon: Calculator },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--accent-pink)] text-white shadow-lg"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* === 相性計算 === */}
          {activeTab === "calc" && (
            <motion.div key="calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CompatibilityCalc umaList={umaList} />
            </motion.div>
          )}

          {/* === 相性ランキング === */}
          {activeTab === "rank" && (
            <motion.div key="rank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div className="mx-auto mb-4 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={rankSearch}
                    onChange={(e) => setRankSearch(e.target.value)}
                    placeholder="搜索马娘..."
                    className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none"
                  />
                  {rankSearch && (
                    <button onClick={() => setRankSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-pink)]">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="space-y-1.5">
                {filteredRank.map((uma, index) => (
                  <div
                    key={uma.cardId}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2.5"
                  >
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      index === 1 ? "bg-gray-400/20 text-gray-300" :
                      index === 2 ? "bg-amber-700/20 text-amber-500" :
                      "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                      <img src={uma.icon} alt={uma.nameCN} className="h-full w-full object-contain p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{uma.nameCN}</p>
                      <p className="truncate text-[10px] text-[var(--text-muted)]">{uma.nameJP}</p>
                    </div>
                    <span className="text-lg font-bold text-[var(--accent-pink)]">{uma.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* === 詳細 === */}
          {activeTab === "detail" && (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">関係性グループ</h3>
                <div className="space-y-1">
                  {relationGroups.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--bg-primary)] px-3 py-1.5 text-xs">
                      <span className="w-8 text-right font-bold text-[var(--accent-pink)]">{g.pt}pt</span>
                      <span className="flex-1 text-[var(--text-primary)]">{g.name}</span>
                      <div className="flex gap-1">
                        <span className={`h-2 w-2 rounded-full ${g.col1 ? "bg-green-400" : "bg-[var(--border-subtle)]"}`} />
                        <span className={`h-2 w-2 rounded-full ${g.col2 ? "bg-green-400" : "bg-[var(--border-subtle)]"}`} />
                        <span className={`h-2 w-2 rounded-full ${g.col3 ? "bg-green-400" : "bg-[var(--border-subtle)]"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
