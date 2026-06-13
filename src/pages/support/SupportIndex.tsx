import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Search, Heart, Star } from "lucide-react";
import { supportCards } from "@/data/supportCards";

const TYPE_COLORS: Record<string, string> = {
  "速度": "text-red-400 bg-red-500/10 border-red-500/30",
  "耐力": "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  "力量": "text-orange-400 bg-orange-500/10 border-orange-500/30",
  "根性": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "智力": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "友人": "text-green-400 bg-green-500/10 border-green-500/30",
};

export default function SupportIndex() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("全部");
  const [typeFilter, setTypeFilter] = useState<string>("全部");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = [...supportCards];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (rarityFilter !== "全部") list = list.filter((c) => c.rarity === rarityFilter);
    if (typeFilter !== "全部") list = list.filter((c) => c.type === typeFilter);
    return list;
  }, [search, rarityFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const byRarity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    supportCards.forEach((c) => {
      byRarity[c.rarity] = (byRarity[c.rarity] || 0) + 1;
      byType[c.type] = (byType[c.type] || 0) + 1;
    });
    return { total: supportCards.length, byRarity, byType };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">支援卡目录</h1>
              <p className="text-xs text-[var(--text-muted)]">サポートカード一覧 · {stats.total}张</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(stats.byRarity).map(([r, c]) => (
              <div key={r} className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5">
                <Star className={`h-4 w-4 ${r === "SSR" ? "text-yellow-400" : "text-purple-400"}`} />
                <span className="text-sm font-bold text-[var(--text-primary)]">{c}</span>
                <span className="text-xs text-[var(--text-muted)]">{r}</span>
              </div>
            ))}
            {Object.entries(stats.byType).map(([t, c]) => (
              <div key={t} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${TYPE_COLORS[t].split(" ")[2]}`}>
                <span className={`text-xs font-bold ${TYPE_COLORS[t].split(" ")[0]}`}>{t}</span>
                <span className="text-xs text-[var(--text-muted)]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索支援卡..."
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["全部", "SSR", "SR"].map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  rarityFilter === r
                    ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["全部", "速度", "耐力", "力量", "根性", "智力", "友人"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === t
                    ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((card) => (
            <motion.button
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate(`/support/${card.id}`)}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-all hover:border-[var(--accent-pink)]/50 hover:shadow-md text-left w-full"
            >
              {/* Card Image */}
              <div className="aspect-[3/4] w-full bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center relative">
                <img
                  src={`/support/${card.id}.png`}
                  alt={card.name}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Rarity badge on image */}
                <div className="absolute top-1.5 left-1.5">
                  <span className={`rounded-full border px-1.5 py-px text-[9px] font-bold ${
                    card.rarity === "SSR" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  }`}>
                    {card.rarity}
                  </span>
                </div>
                {/* Type badge */}
                <div className="absolute top-1.5 right-1.5">
                  <span className={`rounded-full border px-1.5 py-px text-[9px] font-medium ${TYPE_COLORS[card.type]}`}>
                    {card.type}
                  </span>
                </div>
              </div>
              {/* Card Name */}
              <div className="p-2">
                <h3 className="text-[11px] font-medium text-[var(--text-primary)] leading-tight line-clamp-2">
                  {card.name}
                </h3>
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-[var(--text-muted)]">没有找到匹配的支援卡</div>
        )}

        <div className="mt-4 text-center text-xs text-[var(--text-muted)]">
          共 {filtered.length} 张 · 数据来源: master.mdb
        </div>
      </div>
    </div>
  );
}
