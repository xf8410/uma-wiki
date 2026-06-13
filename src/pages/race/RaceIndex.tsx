import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, MapPin, Calendar, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { racesByMonth } from "@/data/races";

const GRADE_COLORS: Record<string, string> = {
  G1: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  G2: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  G3: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  OP: "text-green-400 bg-green-500/10 border-green-500/30",
  "Pre-OP": "text-gray-400 bg-gray-500/10 border-gray-500/30",
};

export default function RaceIndex() {
  const [expandedMonth, setExpandedMonth] = useState<number>(new Date().getMonth() + 1);
  const [gradeFilter, setGradeFilter] = useState<string>("全部");
  const [groundFilter, setGroundFilter] = useState<string>("全部");
  const [distanceFilter, setDistanceFilter] = useState<string>("全部");

  const filteredMonths = useMemo(() => {
    return racesByMonth.map((m) => ({
      ...m,
      races: m.races.filter((r) => {
        if (gradeFilter !== "全部" && r.grade !== gradeFilter) return false;
        if (groundFilter !== "全部" && r.ground !== groundFilter) return false;
        if (distanceFilter !== "全部" && r.distance !== distanceFilter) return false;
        return true;
      }),
    }));
  }, [gradeFilter, groundFilter, distanceFilter]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">比赛目录</h1>
              <p className="text-xs text-[var(--text-muted)]">レース一覧 · 按月份分类</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">等级:</span>
            </div>
            {["全部", "G1", "G2", "G3"].map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                  gradeFilter === g
                    ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {g}
              </button>
            ))}
            <span className="mx-1 text-[var(--border-subtle)]">|</span>
            <span className="text-xs text-[var(--text-muted)]">场地:</span>
            {["全部", "芝", "ダート"].map((g) => (
              <button
                key={g}
                onClick={() => setGroundFilter(g)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                  groundFilter === g
                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {g}
              </button>
            ))}
            <span className="mx-1 text-[var(--border-subtle)]">|</span>
            <span className="text-xs text-[var(--text-muted)]">距离:</span>
            {["全部", "短距離", "マイル", "中距離", "長距離"].map((d) => (
              <button
                key={d}
                onClick={() => setDistanceFilter(d)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                  distanceFilter === d
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month Accordion */}
      <div className="mx-auto max-w-5xl px-4 py-4 space-y-2">
        {filteredMonths.map((m) => {
          const isExpanded = expandedMonth === m.month;
          const hasRaces = m.races.length > 0;
          if (!hasRaces && (gradeFilter !== "全部" || groundFilter !== "全部" || distanceFilter !== "全部")) return null;

          return (
            <div key={m.month} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
              <button
                onClick={() => setExpandedMonth(isExpanded ? 0 : m.month)}
                className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[var(--bg-primary)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isExpanded ? "bg-[var(--accent-pink)]" : "bg-[var(--bg-primary)]"
                  }`}>
                    <Calendar className={`h-4 w-4 ${isExpanded ? "text-white" : "text-[var(--text-muted)]"}`} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{m.label}</span>
                    <div className="flex gap-2 text-[10px]">
                      {m.g1Count > 0 && <span className="text-yellow-400">G1×{m.g1Count}</span>}
                      {m.g2Count > 0 && <span className="text-purple-400">G2×{m.g2Count}</span>}
                      {m.g3Count > 0 && <span className="text-blue-400">G3×{m.g3Count}</span>}
                      <span className="text-[var(--text-muted)]">共{m.races.length}场</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-[var(--border-subtle)] px-3 py-2">
                      {m.races.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[var(--text-muted)]">该筛选条件下无比赛</div>
                      ) : (
                        <div className="space-y-1.5">
                          {m.races.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2"
                            >
                              <div className={`rounded-full border px-2 py-px text-[10px] font-bold ${GRADE_COLORS[r.grade]}`}>
                                {r.grade}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                                  {r.name}
                                  <span className="ml-1 text-[10px] text-[var(--text-muted)]">{r.nameJP}</span>
                                </div>
                                <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="h-2.5 w-2.5" />{r.course}
                                  </span>
                                  <span>{r.distance}</span>
                                  <span>{r.ground}</span>
                                  <span>{r.direction}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
