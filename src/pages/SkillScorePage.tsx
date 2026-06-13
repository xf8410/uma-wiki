import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { skillData } from "@/data/skillData";

// 技能分类
const skillCategories: Record<string, number[]> = {
  "速度系": [200012, 200014, 200022, 200042, 200052, 200062, 200082, 200092, 200122, 200132, 200142, 200182, 200192, 200212, 200222, 200232, 200242, 200252, 200262, 200272, 200282, 200292, 200302, 200312, 200322, 200332, 200342, 200352, 200362, 200372, 200382, 200392, 200402, 200412, 200422, 200432, 200442, 200452, 200462, 200472, 200482, 200492, 200502, 200512, 200522, 200532, 200542, 200552, 200562, 200572, 200582, 200592, 200602, 200612, 200622, 200632, 200642, 200652, 200662, 200672, 200682, 200692, 200702, 200712, 200722, 200732, 200742, 200752, 200762, 200772, 200782, 200792, 200802, 200812, 200822, 200832, 200842, 200852, 200862, 200872, 200882, 200892, 200902, 200912, 200922, 200932, 200942, 200952, 200962, 200972, 200982, 200992],
  "体力系": [201012, 201022, 201032, 201042, 201052, 201062, 201072, 201082, 201092, 201102, 201112, 201122, 201132, 201142, 201152, 201162, 201172, 201182, 201192, 201202, 201212, 201222, 201232, 201242, 201252, 201262, 201272, 201282, 201292, 201302, 201312, 201322, 201332, 201342, 201352, 201362, 201372, 201382, 201392, 201402, 201412, 201422, 201432, 201442, 201452, 201462, 201472, 201482, 201492, 201502, 201512, 201522, 201532, 201542, 201552, 201562, 201572, 201582, 201592, 201602, 201612, 201622, 201632, 201642, 201652, 201662, 201672, 201682, 201692, 201702, 201712, 201722, 201732, 201742, 201752, 201762, 201772, 201782, 201792, 201802, 201812, 201822, 201832, 201842, 201852, 201862, 201872, 201882, 201892, 201902, 201912, 201922, 201932, 201942, 201952, 201962, 201972, 201982, 201992],
  "赛事技能": [900011, 900012, 900021, 900022, 900031, 900032, 900041, 900042, 900051, 900052, 900061, 900062, 900071, 900072, 900081, 900082, 900091, 900092, 900101, 900102, 900111, 900112, 900121, 900122, 900131, 900132, 900141, 900142, 900151, 900152, 900161, 900162, 900171, 900172, 900181, 900182, 900191, 900192, 900201, 900211, 900221, 900231, 900241, 900251, 900261, 900271, 900281, 900291, 900301, 900311, 900321, 900331, 900341, 900351, 900361, 900371, 900381, 900391, 900401, 900411, 900421, 900431, 900441, 900451, 900461, 900471, 900481, 900491, 900501, 900511, 900521, 900531, 900541, 900551, 900561, 900571, 900581, 900591, 900601, 900611, 900621, 900631, 900641, 900651, 900661, 900671, 900681, 900691, 900701, 900711, 900721, 900731, 900741, 900751, 900761, 900771, 900781, 900791, 900801],
};

export default function SkillScorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");

  const allSkills = useMemo(() => {
    const entries = Object.entries(skillData);
    if (category === "全部") return entries;
    const ids = skillCategories[category] || [];
    return entries.filter(([id]) => ids.includes(Number(id)));
  }, [category]);

  const filtered = useMemo(() => {
    if (!search) return allSkills;
    return allSkills.filter(([, desc]) => desc.toLowerCase().includes(search.toLowerCase()));
  }, [search, allSkills]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            技能分数一览
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            查看所有技能的描述和效果
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索技能..."
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["全部", "速度系", "体力系", "赛事技能"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  category === c
                    ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 text-xs font-bold text-[var(--text-muted)]">
            <div className="col-span-1">ID</div>
            <div className="col-span-11">技能描述</div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.map(([id, desc]) => (
              <div
                key={id}
                className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-primary)]/30 transition-colors"
              >
                <div className="col-span-1 text-xs font-mono text-[var(--text-muted)]">{id}</div>
                <div className="col-span-11 text-sm text-[var(--text-primary)]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
