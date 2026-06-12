import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Heart, RotateCcw, Star } from "lucide-react";

interface UmaEntry {
  cardId: string;
  nameCN: string;
  nameJP: string;
  icon: string;
  aptTurf: string;
  aptDirt: string;
  aptShort: string;
  aptMile: string;
  aptMiddle: string;
  aptLong: string;
  aptNige: string;
  aptSenko: string;
  aptSashi: string;
  aptOikomi: string;
}

/* ═══════════════════════════════════════════
   适应性配置
   ═══════════════════════════════════════════ */

interface RedApt { key: string; label: string; stars: number }

const APT_ALL = [
  { key: "turf", label: "芝", gradeKey: "aptTurf" as const },
  { key: "dirt", label: "ダ", gradeKey: "aptDirt" as const },
  { key: "short", label: "短", gradeKey: "aptShort" as const },
  { key: "mile", label: "マ", gradeKey: "aptMile" as const },
  { key: "middle", label: "中", gradeKey: "aptMiddle" as const },
  { key: "long", label: "長", gradeKey: "aptLong" as const },
  { key: "nige", label: "逃", gradeKey: "aptNige" as const },
  { key: "senko", label: "先", gradeKey: "aptSenko" as const },
  { key: "sashi", label: "差", gradeKey: "aptSashi" as const },
  { key: "oikomi", label: "追", gradeKey: "aptOikomi" as const },
];

/* ═══════════════════════════════════════════
   五代系谱二叉树 (63 nodes)
   ═══════════════════════════════════════════ */

interface TreeNode {
  id: string;
  label: string;
  cardId: string | null;
  icon: string | null;
  name: string | null;
  depth: number;
  children: string[];
  redApts: RedApt[];
}

function createNode(id: string, label: string, depth: number, children: string[] = []): TreeNode {
  return { id, label, cardId: null, icon: null, name: null, depth, children, redApts: [] };
}

function buildTree(): Record<string, TreeNode> {
  const n: Record<string, TreeNode> = {};
  n["child"] = createNode("child", "育成", 0, ["p1", "p2"]);
  n["p1"] = createNode("p1", "父1", 1, ["p1f", "p1m"]);
  n["p2"] = createNode("p2", "父2", 1, ["p2f", "p2m"]);

  ["p1f", "p1m", "p2f", "p2m"].forEach((id) => {
    n[id] = createNode(id, id.includes("f") ? "祖父" : "祖母", 2, [`${id}f`, `${id}m`]);
  });

  ["p1ff", "p1fm", "p1mf", "p1mm", "p2ff", "p2fm", "p2mf", "p2mm"].forEach((id) => {
    n[id] = createNode(id, "曾祖", 3, [`${id}f`, `${id}m`]);
  });

  const d4: string[] = [];
  ["p1ff", "p1fm", "p1mf", "p1mm", "p2ff", "p2fm", "p2mf", "p2mm"].forEach((p) => {
    const f = `${p}f`, m = `${p}m`;
    d4.push(f, m);
    n[f] = createNode(f, "高祖", 4, [`${f}f`, `${f}m`]);
    n[m] = createNode(m, "高祖母", 4, [`${f}f`, `${f}m`]);
  });

  d4.forEach((p) => {
    const f = `${p}f`, m = `${p}m`;
    n[f] = createNode(f, "天祖", 5, []);
    n[m] = createNode(m, "天祖母", 5, []);
  });

  return n;
}

function calcCompat(a: TreeNode, b: TreeNode, umaList: UmaEntry[]): number {
  if (!a.cardId || !b.cardId) return 0;
  const aUma = umaList.find((u) => u.cardId === a.cardId);
  const bUma = umaList.find((u) => u.cardId === b.cardId);
  if (!aUma || !bUma) return 0;
  const aBase = aUma.nameCN.replace(/^(泳装|婚纱|礼服|万圣节|情人节|秋|春|不死鸟|拉拉队|冒险家|机械杯|Σ|无人岛|凯旋门|中山|夏装|花道|柳緑)/, "");
  const bBase = bUma.nameCN.replace(/^(泳装|婚纱|礼服|万圣节|情人节|秋|春|不死鸟|拉拉队|冒险家|机械杯|Σ|无人岛|凯旋门|中山|夏装|花道|柳緑)/, "");
  if (aBase === bBase && a.cardId !== b.cardId) return 16;
  return 7;
}

function calcTotal(tree: Record<string, TreeNode>, umaList: UmaEntry[]) {
  const child = tree["child"];
  if (!child.cardId) return { p1: 0, p2: 0, total: 0 };

  let p1Score = 0, p2Score = 0;
  const p1 = tree["p1"], p2 = tree["p2"];

  function sumLineage(node: TreeNode, parentNode: TreeNode): number {
    let score = 0;
    if (!parentNode.cardId) return 0;
    score += calcCompat(node, parentNode, umaList);
    for (const gid of parentNode.children) {
      const g = tree[gid];
      if (g?.cardId) {
        score += calcCompat(parentNode, g, umaList);
        for (const ggid of g.children) {
          const gg = tree[ggid];
          if (gg?.cardId) {
            score += calcCompat(g, gg, umaList);
            for (const gggid of gg.children) {
              const ggg = tree[gggid];
              if (ggg?.cardId) score += calcCompat(gg, ggg, umaList);
            }
          }
        }
      }
    }
    return score;
  }

  if (p1.cardId) p1Score = sumLineage(child, p1);
  if (p2.cardId) p2Score = sumLineage(child, p2);

  if (p1.cardId && p2.cardId) {
    const cross = calcCompat(p1, p2, umaList);
    p1Score += cross;
    p2Score += cross;
  }

  return { p1: p1Score, p2: p2Score, total: p1Score + p2Score };
}

function gradeColor(g: string): string {
  const map: Record<string, string> = {
    S: "text-purple-400", A: "text-red-400", B: "text-orange-400",
    C: "text-yellow-400", D: "text-green-400", E: "text-blue-400", F: "text-indigo-400", G: "text-gray-500",
  };
  return map[g] || "text-gray-500";
}

/* ═══════════════════════════════════════════
   适应性小格子（u-ma.org风格）
   ═══════════════════════════════════════════ */

function AptCell({ label, grade, isRed, onClick }: {
  label: string; grade: string; isRed: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center rounded border px-0.5 py-px min-w-[22px] transition-colors ${isRed ? "border-red-500/50 bg-red-500/10" : "border-[var(--border-subtle)] bg-[var(--bg-primary)]"}`}>
      <span className={`text-[7px] leading-tight ${isRed ? "text-red-500" : "text-[var(--text-muted)]"}`}>{label}</span>
      <span className={`text-[9px] font-bold leading-tight ${isRed ? "text-red-500" : gradeColor(grade)}`}>{grade}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   节点组件（完全参考u-ma.org）
   ═══════════════════════════════════════════ */

function NodeBox({
  node,
  onClickAvatar,
  onClickApt,
  onCycleAptStars,
  umaList,
  compact = false,
}: {
  node: TreeNode;
  onClickAvatar: () => void;
  onClickApt: (aptKey: string) => void;
  onCycleAptStars: (aptKey: string) => void;
  umaList: UmaEntry[];
  compact?: boolean;
}) {
  const uma = umaList.find((u) => u.cardId === node.cardId);
  const hasData = !!node.cardId;

  const redMap: Record<string, RedApt> = {};
  node.redApts.forEach((a) => { redMap[a.key] = a; });

  // 紧凑模式（深层节点）
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* 头像 */}
        <button onClick={onClickAvatar} className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 transition-all hover:scale-110 ${hasData ? "border-[var(--accent-pink)] bg-[var(--bg-primary)]" : "border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]"}`} style={{ width: 36, height: 36 }}>
          {node.icon ? <img src={node.icon} alt="" className="h-full w-full object-contain p-0.5" /> : <span className="text-sm font-bold text-[var(--text-muted)]">+</span>}
        </button>
        {/* 適性按钮 */}
        <button onClick={() => onClickApt("toggle")} className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-px text-[8px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
          適性
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-1.5 shadow-sm">
      {/* 头像行 */}
      <div className="flex items-start gap-1">
        <button onClick={onClickAvatar} className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 ${hasData ? "border-[var(--accent-pink)] bg-[var(--bg-primary)]" : "border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]"}`} style={{ width: 40, height: 40 }}>
          {node.icon ? <img src={node.icon} alt="" className="h-full w-full object-contain p-0.5" /> : <span className="text-base font-bold text-[var(--text-muted)]">+</span>}
        </button>
        {/* 适应性网格 */}
        {uma && (
          <div className="flex flex-col gap-px">
            <div className="flex gap-px">
              {APT_ALL.slice(0, 2).map((apt) => {
                const red = redMap[apt.key];
                return <AptCell key={apt.key} label={apt.label} grade={uma[apt.gradeKey]} isRed={!!red} onClick={() => onClickApt(apt.key)} />;
              })}
            </div>
            <div className="flex gap-px">
              {APT_ALL.slice(2, 6).map((apt) => {
                const red = redMap[apt.key];
                return <AptCell key={apt.key} label={apt.label} grade={uma[apt.gradeKey]} isRed={!!red} onClick={() => onClickApt(apt.key)} />;
              })}
            </div>
            <div className="flex gap-px">
              {APT_ALL.slice(6, 10).map((apt) => {
                const red = redMap[apt.key];
                return <AptCell key={apt.key} label={apt.label} grade={uma[apt.gradeKey]} isRed={!!red} onClick={() => onClickApt(apt.key)} />;
              })}
            </div>
          </div>
        )}
      </div>

      {/* 红色因子条（適性 + 星星） */}
      {node.redApts.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 w-full">
          {node.redApts.map((apt) => (
            <button key={apt.key} onClick={() => onCycleAptStars(apt.key)} className="flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-px border border-red-500/20">
              <span className="text-[8px] font-bold text-red-500">{apt.label}</span>
              {[1, 2, 3].map((i) => (
                <Star key={i} className={`h-2 w-2 ${i <= apt.stars ? "fill-red-500 text-red-500" : "text-red-500/30"}`} />
              ))}
            </button>
          ))}
        </div>
      ) : hasData ? (
        <button onClick={() => onClickApt("toggle")} className="flex items-center gap-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2 py-px text-[9px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
          <span>適性</span>
          <Star className="h-2 w-2 text-[var(--border-subtle)]" />
          <Star className="h-2 w-2 text-[var(--border-subtle)]" />
          <Star className="h-2 w-2 text-[var(--border-subtle)]" />
        </button>
      ) : null}
    </div>
  );
}

function LineV({ h = 12 }: { h?: number }) { return <div className="mx-auto w-px bg-[var(--border-subtle)]" style={{ height: h }} />; }

/* ═══════════════════════════════════════════
   选择弹窗（只选马娘）
   ═══════════════════════════════════════════ */

function UmaPicker({ open, onSelect, onClose, umaList, title }: {
  open: boolean; onSelect: (uma: UmaEntry) => void; onClose: () => void; umaList: UmaEntry[]; title: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return umaList;
    return umaList.filter((u) => u.nameCN.includes(search) || u.nameJP.toLowerCase().includes(search.toLowerCase()));
  }, [search, umaList]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
          <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--accent-pink)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索马娘..." className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] py-2 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none" autoFocus />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-pink)]"><X className="h-4 w-4" /></button>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pt-1">
              <div className="grid grid-cols-6 gap-1.5">
                {filtered.map((u) => (
                  <button key={u.cardId} onClick={() => { onSelect(u); setSearch(""); }} className="flex flex-col items-center gap-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 transition-all hover:border-[var(--accent-pink)]">
                    <div className="aspect-square w-full overflow-hidden rounded-md"><img src={u.icon} alt={u.nameCN} className="h-full w-full object-contain" loading="lazy" /></div>
                    <span className="max-w-full truncate text-[9px] text-[var(--text-primary)]">{u.nameCN}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   Main
   ═══════════════════════════════════════════ */

export default function CompatibilityCalc({ umaList }: { umaList: UmaEntry[] }) {
  const [tree, setTree] = useState<Record<string, TreeNode>>(buildTree);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTitle, setPickerTitle] = useState("");
  const [pickerTarget, setPickerTarget] = useState<string>("child");

  const score = useMemo(() => calcTotal(tree, umaList), [tree, umaList]);
  const child = tree["child"];

  const openPicker = useCallback((targetId: string, title: string) => {
    setPickerTarget(targetId);
    setPickerTitle(title);
    setPickerOpen(true);
  }, []);

  const handleSelect = useCallback((uma: UmaEntry) => {
    setTree((prev) => {
      const next = { ...prev };
      next[pickerTarget] = { ...next[pickerTarget], cardId: uma.cardId, icon: uma.icon, name: uma.nameCN };
      return next;
    });
    setPickerOpen(false);
  }, [pickerTarget]);

  const toggleRedApt = useCallback((nodeId: string, aptKey: string) => {
    if (aptKey === "toggle") {
      return;
    }
    setTree((prev) => {
      const node = { ...prev[nodeId] };
      const existing = node.redApts.find((a) => a.key === aptKey);
      if (existing) {
        // 再次点击已选中的 = 取消选择
        node.redApts = [];
      } else {
        // 选择新的 = 替换（只保留1个）
        const cfg = APT_ALL.find((a) => a.key === aptKey)!;
        node.redApts = [{ key: aptKey, label: cfg.label, stars: 1 }];
      }
      return { ...prev, [nodeId]: node };
    });
  }, []);

  const cycleAptStars = useCallback((nodeId: string, aptKey: string) => {
    setTree((prev) => {
      const node = { ...prev[nodeId] };
      node.redApts = node.redApts.map((a) => a.key === aptKey ? { ...a, stars: a.stars >= 3 ? 1 : a.stars + 1 } : a);
      return { ...prev, [nodeId]: node };
    });
  }, []);

  const reset = useCallback(() => setTree(buildTree()), []);

  return (
    <div className="space-y-1">
      {/* Score */}
      {child.cardId && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-3 flex items-center justify-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
          <div className="text-center"><div className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Heart className="h-3.5 w-3.5 text-blue-400" fill="currentColor" />父1</div><div className="text-xl font-bold text-blue-400">{score.p1}</div></div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div className="text-center"><div className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Heart className="h-3.5 w-3.5 text-pink-400" fill="currentColor" />父2</div><div className="text-xl font-bold text-pink-400">{score.p2}</div></div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div className="text-center"><div className="text-xs text-[var(--text-muted)]">合計</div><div className="text-2xl font-extrabold text-[var(--accent-pink)]">{score.total}</div></div>
        </motion.div>
      )}

      {/* 育成 (第0代) */}
      <div className="flex justify-center">
        <NodeBox node={tree["child"]} onClickAvatar={() => openPicker("child", "选择育成马娘")} onClickApt={(k) => toggleRedApt("child", k)} onCycleAptStars={(k) => cycleAptStars("child", k)} umaList={umaList} />
      </div>
      {child.cardId && (
        <div className="flex justify-center">
          <button className="flex items-center gap-1 rounded-full bg-[var(--accent-pink)]/10 border border-[var(--accent-pink)]/30 px-3 py-1 text-xs text-[var(--accent-pink)]">
            <Heart className="h-3 w-3" fill="currentColor" />
            {score.total > 0 ? `${score.total}+?` : "0+?"}
          </button>
        </div>
      )}
      <LineV h={12} />

      {/* 第1代: 父母 */}
      <div className="flex justify-center gap-12">
        <NodeBox node={tree["p1"]} onClickAvatar={() => openPicker("p1", "选择父1")} onClickApt={(k) => toggleRedApt("p1", k)} onCycleAptStars={(k) => cycleAptStars("p1", k)} umaList={umaList} />
        <NodeBox node={tree["p2"]} onClickAvatar={() => openPicker("p2", "选择父2")} onClickApt={(k) => toggleRedApt("p2", k)} onCycleAptStars={(k) => cycleAptStars("p2", k)} umaList={umaList} />
      </div>
      <LineV h={10} />

      {/* 第2代: 祖父母 */}
      <div className="flex justify-center gap-4">
        <div className="flex gap-2">
          <NodeBox node={tree["p1f"]} onClickAvatar={() => openPicker("p1f", "选择祖父")} onClickApt={(k) => toggleRedApt("p1f", k)} onCycleAptStars={(k) => cycleAptStars("p1f", k)} umaList={umaList} />
          <NodeBox node={tree["p1m"]} onClickAvatar={() => openPicker("p1m", "选择祖母")} onClickApt={(k) => toggleRedApt("p1m", k)} onCycleAptStars={(k) => cycleAptStars("p1m", k)} umaList={umaList} />
        </div>
        <div className="flex gap-2">
          <NodeBox node={tree["p2f"]} onClickAvatar={() => openPicker("p2f", "选择祖父")} onClickApt={(k) => toggleRedApt("p2f", k)} onCycleAptStars={(k) => cycleAptStars("p2f", k)} umaList={umaList} />
          <NodeBox node={tree["p2m"]} onClickAvatar={() => openPicker("p2m", "选择祖母")} onClickApt={(k) => toggleRedApt("p2m", k)} onCycleAptStars={(k) => cycleAptStars("p2m", k)} umaList={umaList} />
        </div>
      </div>
      <LineV h={8} />

      {/* 第3代: 曾祖父母 */}
      <div className="flex justify-center gap-1">
        {["p1ff", "p1fm", "p1mf", "p1mm", "p2ff", "p2fm", "p2mf", "p2mm"].map((id) => (
          <NodeBox key={id} node={tree[id]} onClickAvatar={() => openPicker(id, `选择${tree[id].label}`)} onClickApt={(k) => toggleRedApt(id, k)} onCycleAptStars={(k) => cycleAptStars(id, k)} umaList={umaList} />
        ))}
      </div>
      <LineV h={6} />

      {/* 第4代: 高祖父母 */}
      <div className="flex justify-center gap-1 flex-wrap max-w-full">
        {Object.values(tree).filter((n) => n.depth === 4).map((n) => (
          <NodeBox key={n.id} node={n} onClickAvatar={() => openPicker(n.id, `选择${n.label}`)} onClickApt={(k) => toggleRedApt(n.id, k)} onCycleAptStars={(k) => cycleAptStars(n.id, k)} umaList={umaList} compact />
        ))}
      </div>
      <LineV h={4} />

      {/* 第5代: 天祖父母 */}
      <div className="flex justify-center gap-0.5 flex-wrap max-w-full">
        {Object.values(tree).filter((n) => n.depth === 5).map((n) => (
          <NodeBox key={n.id} node={n} onClickAvatar={() => openPicker(n.id, `选择${n.label}`)} onClickApt={(k) => toggleRedApt(n.id, k)} onCycleAptStars={(k) => cycleAptStars(n.id, k)} umaList={umaList} compact />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-[var(--text-muted)]">
        <span>● 育成(1)</span><span className="text-blue-400">● 父母(2)</span><span className="text-pink-400">● 祖父母(4)</span>
        <span>● 曾祖父母(8)</span><span>● 高祖父母(16)</span><span>● 天祖父母(32)</span>
      </div>

      {/* Reset */}
      <div className="mt-3 flex justify-center">
        <button onClick={reset} className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">
          <RotateCcw className="h-4 w-4" />リセット
        </button>
      </div>

      <UmaPicker open={pickerOpen} onSelect={handleSelect} onClose={() => setPickerOpen(false)} umaList={umaList} title={pickerTitle} />
    </div>
  );
}
