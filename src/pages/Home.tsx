import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Search, X } from "lucide-react";
import { umaList } from "@/data/umaList";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = umaList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.nameCN.includes(q) || u.nameJP.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
            马娘图鉴
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Umamusume Directory · 日服数据 · {umaList.length}个角色
          </p>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[var(--accent-pink)]" />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-6 max-w-sm"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索马娘..."
              className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-pink)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-pink)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Compact Grid — 6 columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
        >
          {filtered.map((uma) => (
            <motion.div key={uma.cardId} variants={cardVariants}>
              <Link
                to={uma.path}
                className="group relative block overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all hover:border-[var(--accent-pink)]/50 hover:shadow-lg hover:shadow-[var(--accent-pink)]/10"
              >
                {/* Victory outfit thumbnail (or icon as fallback) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-primary)]">
                  <img
                    src={uma.victoryIcon || uma.icon}
                    alt={uma.nameCN}
                    className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Name Label */}
                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1 py-1 text-center">
                  <p className="truncate text-[11px] font-semibold leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-pink)]">
                    {uma.nameCN}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && searchQuery && (
          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            未找到匹配的马娘
          </p>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-[var(--text-muted)]">
            赛马娘 Pretty Derby 版权归 Cygames 所有 | 数据源自日服
          </p>
        </motion.div>
      </div>
    </div>
  );
}
