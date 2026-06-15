import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Zap, Heart, Brain, Wind, Shield, Sparkles, X, Star,
  Search, Swords, TrendingUp, Activity, Smile, Plus, Check,
  Trophy, MapPin, User, Hash, Cpu, Settings, GitBranch, Layers,
  Target, BarChart3, Flame, Dna, Info, Cross,
} from "lucide-react";
import { supportCards, friendCards } from "@/data/supportCards";
import { supportCardSkills } from "@/data/supportCardSkills";
import { skillData } from "@/data/skillData";
import { cardDetails } from "@/data/supportCardDetails";
import { umaList } from "@/data/umaList";
import { BREEDERS_CUP_BUFFS, BUFF_PT_COST, calculateBuffPt, type BuffColor } from "@/data/friendCardDetails";
import { RAMEN_MENU, RAMEN_CUP_CONFIG, eatRamen, updateRamenBuffs, type RamenBuff } from "@/data/ramenCup";
import {
  type TrainingState, createInitialState, calculateTrainingValue,
  applyRace, applyClinic,
  type SupportCard as SupportCardType, type AoharuCardEnergy, createAoharuCardEnergy, updateAoharuEnergy,
} from "./trainingEngine";

// ===================== 类型 =====================
interface SelectedCard { id: number; name: string; rarity: string; type: string; }
type Step = "char" | "scenario" | "support" | "buff" | "training";

interface ScenarioConfig {
  id: string; name: string; totalTurns: number; desc: string;
  features: string[]; trainingTurns: number; raceCount: number;
}

interface AIModule {
  id: string; name: string; desc: string; icon: typeof Cpu;
  enabled: boolean; weight: number;
}

// ===================== 常量 =====================
const SCENARIOS: ScenarioConfig[] = [
  { id: "ura", name: "URA Finals", totalTurns: 78, trainingTurns: 63, raceCount: 15,
    desc: "经典URA剧本", features: ["训练: 63回合", "比赛: 15场"] },
  { id: "aoharu", name: "青春杯", totalTurns: 78, trainingTurns: 63, raceCount: 15,
    desc: "支援卡拥有自身属性（最多700）", features: ["支援卡能量条", "团队比赛"] },
  { id: "peak", name: "巅峰杯", totalTurns: 78, trainingTurns: 58, raceCount: 20,
    desc: "大量G1比赛和道具系统", features: ["G1比赛加成", "道具系统"] },
  { id: "grandlive", name: "Grand Live", totalTurns: 75, trainingTurns: 68, raceCount: 7,
    desc: "约68个训练回合", features: ["技能系统强化"] },
  { id: "breeders", name: "育马者杯", totalTurns: 71, trainingTurns: 65, raceCount: 6,
    desc: "团队参数+梦想训练", features: ["不能洗点"] },
  { id: "ramen", name: "拉面杯", totalTurns: 72, trainingTurns: 58, raceCount: 14,
    desc: "原创剧本！吃拉面恢复体力，注意体重管理", features: ["拉面店系统", "体重机制", "无剧本buff", "基础训练加成"] },
];

const MOOD_NAMES = ["绝不调", "不调", "普通", "好调", "绝好调"];
const TYPE_COLORS: Record<string, string> = {
  速度: "text-red-400 border-red-500/30 bg-red-500/10",
  耐力: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  力量: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  根性: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  智力: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  友人: "text-green-400 border-green-500/30 bg-green-500/10",
};
const STAT_CFG = [
  { key: "speed" as const, label: "速度", icon: Wind, color: "text-red-400", bar: "bg-red-400", short: "速" },
  { key: "stamina" as const, label: "耐力", icon: Heart, color: "text-yellow-400", bar: "bg-yellow-400", short: "耐" },
  { key: "power" as const, label: "力量", icon: Swords, color: "text-orange-400", bar: "bg-orange-400", short: "力" },
  { key: "guts" as const, label: "根性", icon: Shield, color: "text-purple-400", bar: "bg-purple-400", short: "根" },
  { key: "wit" as const, label: "智力", icon: Brain, color: "text-blue-400", bar: "bg-blue-400", short: "智" },
];

const AI_MODS: AIModule[] = [
  { id: "bayesian", name: "贝叶斯网络", desc: "精确计算失败率、吃胖概率、羁绊提升期望", icon: Brain, enabled: true, weight: 1.0 },
  { id: "fuzzy", name: "模糊逻辑", desc: "处理模糊边界", icon: Layers, enabled: true, weight: 1.0 },
  { id: "markov", name: "状态转移图", desc: "体力→心情→属性马尔可夫转移", icon: GitBranch, enabled: true, weight: 1.0 },
  { id: "montecarlo", name: "蒙特卡洛", desc: "模拟长期期望", icon: BarChart3, enabled: true, weight: 1.0 },
  { id: "decision", name: "决策树", desc: "硬规则排除", icon: Target, enabled: true, weight: 1.0 },
  { id: "neural", name: "神经网络", desc: "MLP价值函数", icon: Cpu, enabled: false, weight: 0.5 },
  { id: "gnn", name: "图神经网络", desc: "支援卡羁绊互相影响", icon: Dna, enabled: false, weight: 0.5 },
  { id: "gan", name: "GAN", desc: "生成极端场景", icon: Flame, enabled: false, weight: 0.3 },
  { id: "genetic", name: "遗传算法", desc: "优化融合权重", icon: Settings, enabled: false, weight: 0.3 },
  { id: "ppo", name: "深度强化学习(PPO)", desc: "策略网络", icon: Zap, enabled: false, weight: 0.5 },
];

function r5(n: number) { return Math.round(n / 5) * 5; }
function getISP(cid: number) {
  const d = cardDetails[cid]; if (!d) return 0;
  const e = d.effects.find((x) => x.t === "初始技能点"); return e ? (e.l.lv1 || 0) : 0;
}

// ===================== 主组件 =====================
export default function TrainingSimulator() {
  const [step, setStep] = useState<Step>("char");
  const [selChar, setSelChar] = useState<(typeof umaList)[0] | null>(null);
  const [selScenario, setSelScenario] = useState(SCENARIOS[0]);
  const [selCards, setSelCards] = useState<SelectedCard[]>([]);
  const [selFriend, setSelFriend] = useState<number | null>(null); // 选择的友人卡
  const [selBuffs, setSelBuffs] = useState<number[]>([]); // 选择的剧本buff
  const [showCS, setShowCS] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [sq, setSq] = useState("");
  const [rf, setRf] = useState("全部");
  const [tf, setTf] = useState("全部");
  const [cq, setCq] = useState("");
  const [aiMods, setAiMods] = useState<AIModule[]>(AI_MODS);
  const [ts, setTs] = useState<TrainingState>(() => createInitialState(100101, 5, 78));
  const [aoharuE, setAoharuE] = useState<AoharuCardEnergy[]>([]);
  const [ramenBuffs, setRamenBuffs] = useState<RamenBuff[]>([]); // 拉面杯临时buff
  const [freeRamenLeft, setFreeRamenLeft] = useState(0); // 免费拉面次数
  const [showRamenShop, setShowRamenShop] = useState(false); // 显示拉面店
  const [log, setLog] = useState<string[]>([]);

  const fc = useMemo(() => supportCards.filter((c) => {
    if (sq && !c.name.toLowerCase().includes(sq.toLowerCase())) return false;
    if (rf !== "全部" && c.rarity !== rf) return false;
    if (tf !== "全部" && c.type !== tf) return false;
    return true;
  }), [sq, rf, tf]);

  const fch = useMemo(() => {
    if (!cq) return umaList;
    return umaList.filter((c) => c.nameCN.includes(cq) || c.nameJP.includes(cq));
  }, [cq]);

  const skills = useMemo(() => {
    const h: { sid: number; desc: string; cardName: string }[] = [];
    const e: { sid: number; desc: string; cardName: string }[] = [];
    selCards.forEach((c) => {
      const s = supportCardSkills[c.id]; if (!s) return;
      s.hintSkills.forEach((sid) => h.push({ sid, desc: skillData[sid] || `Skill #${sid}`, cardName: c.name }));
      s.eventSkills.forEach((sid) => e.push({ sid, desc: skillData[sid] || `Skill #${sid}`, cardName: c.name }));
    });
    return { hintSkills: h, eventSkills: e };
  }, [selCards]);

  const bsp = useMemo(() => selCards.reduce((s, c) => s + getISP(c.id), 0), [selCards]);
  const tsp = 120 + bsp;

  const tc = useCallback((card: (typeof supportCards)[0]) => {
    setSelCards((prev) => {
      const ex = prev.find((c) => c.id === card.id);
      if (ex) return prev.filter((c) => c.id !== card.id);
      if (prev.length >= 6) return prev;
      return [...prev, { id: card.id, name: card.name, rarity: card.rarity, type: card.type }];
    });
  }, []);

  const tAI = (id: string) => setAiMods((p) => p.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
  const sAIW = (id: string, w: number) => setAiMods((p) => p.map((m) => m.id === id ? { ...m, weight: w } : m));

  const start = () => {
    if (selCards.length === 0 || !selChar) return;
    setTs((p) => ({ ...p, skillPt: tsp, totalTurns: selScenario.totalTurns }));
    if (selScenario.id === "aoharu") setAoharuE(selCards.map((c) => createAoharuCardEnergy(c.id)));
    // 育马者杯进入buff选择
    if (selScenario.id === "breeders") {
      setStep("buff");
    } else if (selScenario.id === "ramen") {
      // 拉面杯初始化
      setFreeRamenLeft(RAMEN_CUP_CONFIG.freeRamenCount);
      setRamenBuffs([]);
      setStep("training");
    } else {
      setStep("training");
    }
  };

  const resetAll = () => {
    setStep("char"); setSelChar(null); setSelCards([]); setSelFriend(null); setSelBuffs([]);
    setAiMods(AI_MODS); setTs(createInitialState(100101, 5, 78)); setAoharuE([]); setRamenBuffs([]); setFreeRamenLeft(0); setShowRamenShop(false); setLog([]);
  };

  // 每回合结束更新拉面buff
  const endTurnRamenUpdate = () => {
    if (selScenario.id === "ramen") {
      setRamenBuffs((p) => updateRamenBuffs(p));
    }
  };

  const doTrain = (t: number) => {
    const k = STAT_CFG[t].key;
    const cards: SupportCardType[] = selCards.map((c, i) => ({
      id: c.id, name: c.name, type: c.type, rarity: c.rarity,
      bond: ts.cardBond[i] || 0, isShining: Math.random() < 0.3, isLink: i < ts.linkCount,
    }));
    const r = calculateTrainingValue(t, ts, cards);
    const nb = [...ts.cardBond];
    r.bondIncrease.forEach((inc, i) => { if (nb[i] !== undefined) nb[i] = Math.min(100, nb[i] + inc); });
    const ntl = [...ts.trainLevelCount] as [number, number, number, number, number];
    if (r.trainLevelUp) ntl[t] += 1;
    let g = r.statGains[t];
    // 吃胖状态下速度训练无效
    if (selScenario.id === "ramen" && t === 0 && ts.isFat) {
      g = 0;
    }
    const nv = Math.min(ts[`${k}Limit` as keyof TrainingState] as number, (ts[k] as number) + g);
    setTs((p) => ({ ...p, [k]: r5(nv), vital: Math.max(0, p.vital + r.vitalChange), skillPt: p.skillPt + r.ptGain, cardBond: nb, trainLevelCount: ntl, turn: p.turn + 1, consecutiveRaces: 0 }));
    if (selScenario.id === "aoharu") setAoharuE((p) => updateAoharuEnergy(p, cards.map((_, i) => i), r.success));
    const n = STAT_CFG[t].short;
    const fatMsg = selScenario.id === "ramen" && t === 0 && ts.isFat ? " 【吃胖中！速度训练无效】" : "";
    setLog((p) => [`[T${ts.turn + 1}] ${n}训练 ${r.success ? "成功" : "失败"} +${g}${r.isShining.filter(Boolean).length > 0 ? " (彩圈!)" : ""}${fatMsg}`, ...p].slice(0, 50));
    endTurnRamenUpdate();
  };

  const doRest = () => { setTs((p) => ({ ...p, vital: Math.min(p.maxVital, p.vital + 50), turn: p.turn + 1, consecutiveRaces: 0, arenaLevel: p.arenaLevel + 1 })); setLog((p) => [`[T${ts.turn + 1}] 休息 +50体力 竞技Lv+1`, ...p].slice(0, 50)); endTurnRamenUpdate(); };
  const doOut = () => { setTs((p) => ({ ...p, vital: Math.min(p.maxVital, p.vital + 70), motivation: Math.min(5, p.motivation + 1), turn: p.turn + 1, consecutiveRaces: 0, arenaLevel: p.arenaLevel + 1 })); setLog((p) => [`[T${ts.turn + 1}] 外出 +70体力 +心情 竞技Lv+1`, ...p].slice(0, 50)); endTurnRamenUpdate(); };
  const doRace = () => { 
    setTs((p) => applyRace(p)); 
    setLog((p) => [`[T${ts.turn + 1}] 比赛 +35pt`, ...p].slice(0, 50)); 
    endTurnRamenUpdate(); 
  };

  const doClinic = () => { 
    setTs((p) => applyClinic(p)); 
    setLog((p) => [`[T${ts.turn + 1}] 保健室 消除了吃胖！`, ...p].slice(0, 50)); 
    endTurnRamenUpdate(); 
  };

  const activeAI = aiMods.filter((m) => m.enabled);

  // ===================== 步骤1: 选择马娘 =====================
  if (step === "char") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"><User className="h-5 w-5 text-white" /></div>
            <div><h1 className="text-xl font-bold text-[var(--text-primary)]">选择训练马娘</h1><p className="text-xs text-[var(--text-muted)]">第一步: 选择要育成的马娘</p></div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" value={cq} onChange={(e) => setCq(e.target.value)} placeholder="搜索马娘..." className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {fch.map((char) => (
              <button key={char.cardId} onClick={() => { setSelChar(char); setStep("scenario"); }} className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 transition-all hover:border-[var(--accent-pink)] hover:ring-2 hover:ring-[var(--accent-pink)]/30">
                <div className="aspect-square rounded-lg bg-[var(--bg-primary)] overflow-hidden mb-1.5">
                  <img src={char.icon} alt={char.nameCN} className="h-full w-full object-contain" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <p className="text-[10px] text-[var(--text-primary)] text-center truncate leading-tight">{char.nameCN}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===================== 步骤2: 选择剧本 =====================
  if (step === "scenario") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"><MapPin className="h-5 w-5 text-white" /></div>
              <div><h1 className="text-xl font-bold text-[var(--text-primary)]">选择剧本</h1><p className="text-xs text-[var(--text-muted)]">{selChar?.nameCN} | 第二步</p></div>
            </div>
            <button onClick={() => setStep("char")} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-pink)]">← 重新选择马娘</button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCENARIOS.map((s) => (
              <button key={s.id} onClick={() => { setSelScenario(s); setStep("support"); }} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-left transition-all hover:border-[var(--accent-pink)] hover:ring-2 hover:ring-[var(--accent-pink)]/30">
                <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)]">{s.name}</h3><Trophy className="h-5 w-5 text-yellow-400" /></div>
                <p className="text-sm text-[var(--text-muted)] mb-4">{s.desc}</p>
                <div className="space-y-1.5">{s.features.map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Check className="h-3 w-3 text-[var(--accent-pink)]" /><span>{f}</span></div>)}</div>
                <div className="mt-4 flex gap-3 text-[10px] text-[var(--text-muted)]"><span className="rounded bg-[var(--bg-primary)] px-2 py-1">训练{s.trainingTurns}回合</span><span className="rounded bg-[var(--bg-primary)] px-2 py-1">比赛{s.raceCount}场</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===================== 步骤3: 选择支援卡 =====================
  if (step === "support") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"><Star className="h-5 w-5 text-white" /></div>
              <div><h1 className="text-xl font-bold text-[var(--text-primary)]">选择支援卡</h1><p className="text-xs text-[var(--text-muted)]">{selChar?.nameCN} | {selScenario.name} | 最多6张</p></div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("scenario")} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-pink)]">← 重选剧本</button>
              {selCards.length > 0 && <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 text-sm font-bold text-white hover:opacity-90"><Zap className="h-4 w-4" />开始训练{bsp > 0 && <span className="text-xs opacity-80">(+{bsp}pt)</span>}</button>}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
                <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-[var(--text-primary)]">已选支援卡 <span className="text-sm font-normal text-[var(--text-muted)]">{selCards.length}/6</span></h2><button onClick={() => setShowCS(!showCS)} className="flex items-center gap-1.5 rounded-lg border border-[var(--accent-pink)] px-3 py-1.5 text-sm text-[var(--accent-pink)] hover:bg-[var(--accent-pink)]/10"><Plus className="h-4 w-4" />{showCS ? "关闭" : "选择支援卡"}</button></div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {selCards.map((card, idx) => (
                    <motion.div key={card.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                      <div className="aspect-[3/4] rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-primary)]">
                        <img src={`${import.meta.env.BASE_URL}support/${card.id}.png`} alt={card.name} className="h-full w-full object-contain" loading="lazy" />
                        <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center"><span className="text-[10px] text-white font-bold">{idx + 1}</span></div>
                        <div className="absolute top-1 right-1"><span className={`text-[8px] font-bold px-1 py-px rounded ${card.rarity === "SSR" ? "bg-yellow-500/20 text-yellow-400" : "bg-purple-500/20 text-purple-400"}`}>{card.rarity}</span></div>
                        <div className="absolute bottom-1 right-1"><span className={`text-[8px] font-medium px-1 py-px rounded border ${TYPE_COLORS[card.type]}`}>{card.type}</span></div>
                      </div>
                      <p className="mt-1 text-[9px] text-[var(--text-muted)] line-clamp-2 leading-tight">{card.name}</p>
                      <button onClick={() => tc(supportCards.find((c) => c.id === card.id)!)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"><X className="h-3 w-3 text-white" /></button>
                    </motion.div>
                  ))}
                  {Array.from({ length: 6 - selCards.length }).map((_, i) => (
                    <div key={`e-${i}`} className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center bg-[var(--bg-primary)]/50"><span className="text-[var(--border-subtle)] text-xs">{selCards.length + i + 1}</span></div>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {showCS && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                    <div className="p-4 space-y-3 border-b border-[var(--border-subtle)]">
                      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" value={sq} onChange={(e) => setSq(e.target.value)} placeholder="搜索支援卡..." className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-pink)] focus:outline-none" /></div>
                      <div className="flex flex-wrap gap-2">
                        {["全部", "SSR", "SR"].map((r) => <button key={r} onClick={() => setRf(r)} className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${rf === r ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]" : "border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)]"}`}>{r}</button>)}
                        {["全部", "速度", "耐力", "力量", "根性", "智力", "友人"].map((t) => {
                          const isActive = tf === t;
                          const baseClass = "rounded-lg border px-3 py-1 text-xs font-medium transition-all ";
                          const activeClass = "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]";
                          const inactiveClass = "border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)]";
                          return <button key={t} onClick={() => setTf(t)} className={baseClass + (isActive ? activeClass : inactiveClass) + (t === "友人" ? " text-green-400" : "")}>{t}</button>;
                        })}
                      </div>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {fc.map((card) => {
                          const isSel = selCards.find((c) => c.id === card.id);
                          const isMax = selCards.length >= 6 && !isSel;
                          return (
                            <button key={card.id} onClick={() => !isMax && tc(card)} disabled={isMax} className={`relative rounded-lg border overflow-hidden transition-all ${isSel ? "border-[var(--accent-pink)] ring-2 ring-[var(--accent-pink)]/30" : isMax ? "border-[var(--border-subtle)] opacity-40" : "border-[var(--border-subtle)] hover:border-[var(--accent-pink)]/50"}`}>
                              <div className="aspect-[3/4] bg-[var(--bg-primary)]"><img src={`${import.meta.env.BASE_URL}support/${card.id}.png`} alt={card.name} className="h-full w-full object-contain" loading="lazy" /></div>
                              {isSel && <div className="absolute inset-0 bg-[var(--accent-pink)]/20 flex items-center justify-center"><div className="h-6 w-6 rounded-full bg-[var(--accent-pink)] flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div></div>}
                              <div className="absolute top-0.5 left-0.5"><span className={`text-[7px] font-bold px-1 py-px rounded ${card.rarity === "SSR" ? "bg-yellow-500/20 text-yellow-400" : "bg-purple-500/20 text-purple-400"}`}>{card.rarity}</span></div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" /><h2 className="text-lg font-bold text-[var(--text-primary)]">可获得技能</h2></div>
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {selCards.length === 0 ? <p className="text-sm text-[var(--text-muted)] text-center py-4">选择支援卡后查看技能</p> : <>
                    {skills.hintSkills.length > 0 && <div><h3 className="text-xs font-bold text-[var(--accent-pink)] mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Hint 技能 ({skills.hintSkills.length})</h3><div className="space-y-1.5">{skills.hintSkills.map((s) => <div key={`h-${s.sid}`} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-3 py-2"><p className="text-xs text-[var(--text-primary)] leading-relaxed">{s.desc}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.cardName}</p></div>)}</div></div>}
                    {skills.eventSkills.length > 0 && <div><h3 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />事件技能 ({skills.eventSkills.length})</h3><div className="space-y-1.5">{skills.eventSkills.map((s) => <div key={`e-${s.sid}`} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-3 py-2"><p className="text-xs text-[var(--text-primary)] leading-relaxed">{s.desc}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.cardName}</p></div>)}</div></div>}
                  </>}
                </div>
              </div>
              {selCards.length > 0 && <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">技能点计算</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]"><span>基础技能点</span><span>120 pt</span></div>
                  {selCards.map((c) => { const b = getISP(c.id); return b > 0 ? <div key={c.id} className="flex justify-between text-[var(--text-muted)]"><span className="truncate max-w-[150px]">{c.name}</span><span className="text-yellow-400">+{b} pt</span></div> : null; })}
                  <div className="border-t border-[var(--border-subtle)] pt-2 flex justify-between font-bold"><span className="text-[var(--text-primary)]">合计</span><span className="text-yellow-400">{tsp} pt</span></div>
                </div>
              </div>}
              {selScenario.id === "aoharu" && <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                <div className="flex items-center gap-2 mb-2"><Info className="h-4 w-4 text-yellow-400" /><h3 className="text-sm font-bold text-yellow-400">青春杯机制</h3></div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">支援卡在青春杯中相当于<strong className="text-yellow-400">团队队友</strong>，拥有独立的能量条和成长属性（最多700）。这些属性只影响团队比赛结果，<strong className="text-yellow-400">不会加在育成马娘属性上</strong>。</p>
              </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== 步骤3.5: 育马者杯Buff选择 =====================
  if (step === "buff") {
    const availablePt = calculateBuffPt(selFriend !== null);
    const spentPt = selBuffs.reduce((sum, bid) => {
      const buff = BREEDERS_CUP_BUFFS.find((b) => b.id === bid);
      return sum + (buff ? BUFF_PT_COST[buff.star as keyof typeof BUFF_PT_COST] : 0);
    }, 0);
    const remainingPt = availablePt - spentPt;

    const toggleBuff = (buffId: number) => {
      setSelBuffs((prev) => {
        if (prev.includes(buffId)) return prev.filter((id) => id !== buffId);
        const buff = BREEDERS_CUP_BUFFS.find((b) => b.id === buffId);
        if (!buff) return prev;
        const cost = BUFF_PT_COST[buff.star as keyof typeof BUFF_PT_COST];
        const currSpent = prev.reduce((s, bid) => {
          const b = BREEDERS_CUP_BUFFS.find((x) => x.id === bid);
          return s + (b ? BUFF_PT_COST[b.star as keyof typeof BUFF_PT_COST] : 0);
        }, 0);
        if (currSpent + cost > availablePt) return prev; // 不够pt
        return [...prev, buffId];
      });
    };

    const buffColors: Record<BuffColor, string> = {
      green: "border-green-500/30 bg-green-500/10 text-green-400",
      blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
      pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    };

    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"><Zap className="h-5 w-5 text-white" /></div>
              <div><h1 className="text-xl font-bold text-[var(--text-primary)]">剧本Buff选择</h1><p className="text-xs text-[var(--text-muted)]">育马者杯 | 分配剧本buff pt</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-400 font-bold">剩余PT: {remainingPt}/{availablePt}</span>
              <button onClick={() => setStep("support")} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-pink)]">← 返回</button>
              <button onClick={() => setStep("training")} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 text-sm font-bold text-white hover:opacity-90"><Zap className="h-4 w-4" />开始训练</button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* 友人卡选择 */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" />友人卡选择 <span className="text-sm font-normal text-[var(--text-muted)]">(带友人+5pt)</span></h2>
            <div className="flex gap-3">
              {friendCards.map((fc) => (
                <button key={fc.id} onClick={() => setSelFriend(selFriend === fc.id ? null : fc.id)} className={`rounded-xl border p-3 transition-all ${selFriend === fc.id ? "border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10" : "border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-pink-500/50"}`}>
                  <div className="aspect-[3/4] w-24 rounded-lg overflow-hidden bg-[var(--bg-primary)]"><img src={`${import.meta.env.BASE_URL}support/${fc.id}.png`} alt={fc.name} className="h-full w-full object-contain" loading="lazy" /></div>
                  <p className="mt-2 text-xs text-[var(--text-primary)] text-center">{fc.name}</p>
                  {selFriend === fc.id && <p className="text-[10px] text-pink-400 text-center mt-1">已选择 (+5pt)</p>}
                </button>
              ))}
            </div>
          </div>
          {/* Buff选择 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["green", "blue", "pink"] as BuffColor[]).map((color) => (
              <div key={color} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                <div className={`border-b border-[var(--border-subtle)] px-6 py-4 ${buffColors[color]}`}>
                  <h3 className="text-lg font-bold">
                    {color === "green" ? "绿色Buff (训练)" : color === "blue" ? "蓝色Buff (属性)" : "粉色Buff (技能/比赛)"}
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {BREEDERS_CUP_BUFFS.filter((b) => b.color === color).map((buff) => {
                    const isSelected = selBuffs.includes(buff.id);
                    const cost = BUFF_PT_COST[buff.star as keyof typeof BUFF_PT_COST];
                    return (
                      <button key={buff.id} onClick={() => toggleBuff(buff.id)} className={`w-full rounded-lg border p-3 text-left transition-all ${isSelected ? "border-pink-500 bg-pink-500/10" : "border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 hover:border-[var(--border-subtle)]/80"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? "text-pink-400" : "text-[var(--text-primary)]"}`}>{buff.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{buff.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-yellow-400">{cost}pt</span>
                            {isSelected && <Check className="h-4 w-4 text-pink-400" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* 已选Buff摘要 */}
          {selBuffs.length > 0 && (
            <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">已选Buff</h3>
              <div className="flex flex-wrap gap-2">
                {selBuffs.map((bid) => {
                  const buff = BREEDERS_CUP_BUFFS.find((b) => b.id === bid);
                  if (!buff) return null;
                  return <span key={bid} className={`rounded-full px-3 py-1 text-xs border ${buffColors[buff.color]}`}>{buff.name}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== 步骤4: 训练界面 =====================
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"><Dumbbell className="h-5 w-5 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">训练模拟器<span className="ml-2 text-xs font-normal text-[var(--text-muted)]">{selChar?.nameCN} | {selScenario.name}</span></h1>
                <p className="text-xs text-[var(--text-muted)]">回合 {ts.turn}/{selScenario.totalTurns}{ts.consecutiveRaces > 0 && <span className="ml-2 text-yellow-400">连续比赛: {ts.consecutiveRaces}</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAI(!showAI)} className="rounded-lg border border-[var(--accent-pink)] px-3 py-2 text-xs text-[var(--accent-pink)] hover:bg-[var(--accent-pink)]/10 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" />AI模块 ({activeAI.length})</button>
              <button onClick={() => setStep("support")} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)] hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)]">修改配卡</button>
              <button onClick={resetAll} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)] hover:border-red-400 hover:text-red-400">重置</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" />支援卡组</h2>
              <div className="grid grid-cols-6 gap-2">
                {selCards.map((card, idx) => (
                  <div key={card.id}>
                    <div className="aspect-[3/4] rounded-lg border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-primary)]">
                      <img src={`${import.meta.env.BASE_URL}support/${card.id}.png`} alt={card.name} className="h-full w-full object-contain" loading="lazy" />
                    </div>
                    <div className="mt-1"><div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full rounded-full bg-pink-400 transition-all" style={{ width: `${ts.cardBond[idx] || 0}%` }} /></div><p className="text-[8px] text-[var(--text-muted)] text-center mt-0.5">绊:{ts.cardBond[idx] || 0}</p></div>
                    {selScenario.id === "aoharu" && aoharuE[idx] && (
                      <div className="mt-0.5"><div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${(aoharuE[idx].energy / 700) * 100}%` }} /></div><p className="text-[7px] text-yellow-400 text-center">{aoharuE[idx].energy}/700</p></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
              <div className="border-b border-[var(--border-subtle)] px-6 py-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[var(--accent-pink)]" /><h2 className="text-lg font-bold text-[var(--text-primary)]">训练状态</h2></div></div>
              <div className="p-6 space-y-6">
                <div className={`grid gap-3 ${selScenario.id === "ramen" ? "grid-cols-5" : "grid-cols-4"}`}>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Sparkles className="h-4 w-4 text-pink-400" /><span className="text-[10px] text-[var(--text-muted)]">心情</span></div>
                    <p className="text-sm font-bold text-pink-400">{MOOD_NAMES[ts.motivation - 1]}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Heart className="h-4 w-4 text-red-400" /><span className="text-[10px] text-[var(--text-muted)]">体力</span></div>
                    <p className="text-sm font-bold text-red-400">{ts.vital}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Sparkles className="h-4 w-4 text-yellow-400" /><span className="text-[10px] text-[var(--text-muted)]">技能点</span></div>
                    <p className="text-sm font-bold text-yellow-400">{ts.skillPt}<span className="text-[8px]">pt</span></p>
                  </div>
                  {selScenario.id === "ramen" && <div className={`rounded-xl border p-3 text-center ${ts.isFat ? "border-red-500/30 bg-red-500/5" : "border-[var(--border-subtle)] bg-[var(--bg-primary)]"}`}>
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Hash className={`h-4 w-4 ${ts.isFat ? "text-red-400" : "text-green-400"}`} /><span className="text-[10px] text-[var(--text-muted)]">吃胖</span></div>
                    <p className={`text-sm font-bold ${ts.isFat ? "text-red-400" : "text-green-400"}`}>{ts.isFat ? "吃胖了！" : "正常"}{ts.isFat && <span className="text-[8px] block mt-0.5">速度训练无效！</span>}</p>
                  </div>}
                  {selScenario.id !== "ramen" && <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1"><Trophy className="h-4 w-4 text-green-400" /><span className="text-[10px] text-[var(--text-muted)]">竞技Lv</span></div>
                    <p className="text-sm font-bold text-green-400">Lv.{ts.arenaLevel}</p>
                  </div>}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[var(--accent-pink)]" />五维属性 <span className="text-[10px] text-[var(--text-muted)] font-normal">(训练等级计数: {ts.trainLevelCount.join(",")})</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STAT_CFG.map(({ key, label, icon: Icon, color, bar, short }, idx) => {
                      const value = ts[key]; const limit = ts[`${key}Limit` as keyof TrainingState] as number; const pct = Math.min((value / limit) * 100, 100);
                      return (
                        <div key={key} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span className="text-sm text-[var(--text-primary)]">{label}</span></div>
                            <span className={`text-lg font-bold ${color}`}>{value}<span className="text-xs font-normal text-[var(--text-muted)]"> / {limit}</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden mb-2"><motion.div className={`h-full rounded-full ${bar}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} /></div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[var(--text-muted)]">Lv.{Math.floor(ts.trainLevelCount[idx] / 4) + 1}</span>
                            <button onClick={() => doTrain(idx)} disabled={ts.vital < 10} className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 text-[10px] font-bold text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed">{short}训练</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`grid gap-3 ${selScenario.id === "ramen" ? "grid-cols-5" : "grid-cols-4"}`}>
                  <button onClick={doRest} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-center hover:border-green-400/50 transition-colors group">
                    <Heart className="h-5 w-5 text-green-400 mx-auto mb-1 group-hover:scale-110 transition-transform" /><p className="text-sm font-bold text-[var(--text-primary)]">休息</p><p className="text-[10px] text-[var(--text-muted)]">+50体力 竞技Lv+1</p>
                  </button>
                  <button onClick={doOut} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-center hover:border-pink-400/50 transition-colors group">
                    <Smile className="h-5 w-5 text-pink-400 mx-auto mb-1 group-hover:scale-110 transition-transform" /><p className="text-sm font-bold text-[var(--text-primary)]">外出</p><p className="text-[10px] text-[var(--text-muted)]">+70体力 +心情 竞技Lv+1</p>
                  </button>
                  <button onClick={doRace} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-center hover:border-yellow-400/50 transition-colors group">
                    <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1 group-hover:scale-110 transition-transform" /><p className="text-sm font-bold text-[var(--text-primary)]">比赛</p><p className="text-[10px] text-[var(--text-muted)]">+35pt {ts.consecutiveRaces >= 3 && <span className="text-red-400">(连续警告!)</span>}</p>
                  </button>
                  <button onClick={doClinic} disabled={!ts.isFat} className={`rounded-xl border p-4 text-center transition-colors group ${ts.isFat ? "border-red-500/30 bg-red-500/5 hover:border-red-400/50" : "border-[var(--border-subtle)] bg-[var(--bg-primary)] opacity-50"}`}>
                    <Cross className={`h-5 w-5 mx-auto mb-1 group-hover:scale-110 transition-transform ${ts.isFat ? "text-red-400" : "text-[var(--text-muted)]"}`} /><p className="text-sm font-bold text-[var(--text-primary)]">保健室</p><p className="text-[10px] text-[var(--text-muted)]">{ts.isFat ? <span className="text-red-400">消除吃胖！</span> : "无debuff"}</p>
                  </button>
                  {selScenario.id === "ramen" && (
                    <button onClick={() => setShowRamenShop(!showRamenShop)} className="rounded-xl border border-orange-500/30 bg-[var(--bg-primary)] p-4 text-center hover:border-orange-400/50 transition-colors group">
                      <svg className="h-5 w-5 text-orange-400 mx-auto mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <p className="text-sm font-bold text-[var(--text-primary)]">拉面店</p><p className="text-[10px] text-orange-400">{freeRamenLeft > 0 ? `免费${freeRamenLeft}次` : `消耗pt`}</p>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 拉面店面板 */}
            <AnimatePresence>
              {showRamenShop && selScenario.id === "ramen" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden rounded-2xl border border-orange-500/30 bg-[var(--bg-secondary)]">
                  <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg><h2 className="text-lg font-bold text-[var(--text-primary)]">拉面店</h2><span className="text-xs text-orange-400">{freeRamenLeft > 0 ? `免费${freeRamenLeft}次` : `${ts.skillPt}pt`}</span></div>
                    <button onClick={() => setShowRamenShop(false)} className="text-[var(--text-muted)] hover:text-orange-400"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {RAMEN_MENU.map((ramen) => {
                        const canAfford = freeRamenLeft > 0 || ts.skillPt >= ramen.costPt;
                        return (
                          <button key={ramen.id} onClick={() => {
                            const result = eatRamen(ramen, ts.vital, ts.maxVital, ts.motivation, ts.isFat, ts.skillPt, freeRamenLeft);
                            if (result.success) {
                              setTs((p) => ({ ...p, vital: result.newVital, motivation: result.newMotivation, isFat: result.newIsFat, skillPt: result.newSkillPt }));
                              setFreeRamenLeft(result.newFreeRamenLeft);
                              if (result.buff) setRamenBuffs((p) => [...p, result.buff!]);
                              setLog((p) => [`[T${ts.turn}] ${result.message}`, ...p].slice(0, 50));
                              setShowRamenShop(false);
                            }
                          }} disabled={!canAfford} className={`rounded-xl border p-3 text-left transition-all ${canAfford ? "border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 hover:border-orange-400/50" : "border-[var(--border-subtle)] opacity-40 cursor-not-allowed"}`}>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{ramen.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">{ramen.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {ramen.vitalRecover > 0 && <span className="text-[9px] rounded bg-green-500/10 text-green-400 px-1.5 py-px">体力+{ramen.vitalRecover}</span>}
                              {ramen.motivationChange > 0 && <span className="text-[9px] rounded bg-pink-500/10 text-pink-400 px-1.5 py-px">心情+{ramen.motivationChange}</span>}
                              {ramen.motivationChange < 0 && <span className="text-[9px] rounded bg-gray-500/10 text-gray-400 px-1.5 py-px">心情{ramen.motivationChange}</span>}
                              {ramen.isFat && <span className="text-[9px] rounded bg-red-500/10 text-red-400 px-1.5 py-px">可能吃胖</span>}
                              {ramen.curesFat && <span className="text-[9px] rounded bg-green-500/10 text-green-400 px-1.5 py-px">消除吃胖</span>}
                              {ramen.tempTrainBonus > 0 && <span className="text-[9px] rounded bg-purple-500/10 text-purple-400 px-1.5 py-px">训练+{Math.round(ramen.tempTrainBonus * 100)}%</span>}
                            </div>
                            <p className="text-[10px] text-yellow-400 mt-2 font-bold">{freeRamenLeft > 0 ? "免费" : `${ramen.costPt}pt`}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-3">* 体重超过8kg将降低训练效果，注意管理！</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showAI && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden rounded-2xl border border-[var(--accent-pink)]/30 bg-[var(--bg-secondary)]">
                  <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-[var(--accent-pink)]" /><h2 className="text-lg font-bold text-[var(--text-primary)]">AI 算法模块</h2></div>
                    <button onClick={() => setShowAI(false)} className="text-[var(--text-muted)] hover:text-[var(--accent-pink)]"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[var(--text-muted)] mb-3">开启/关闭各AI模块，调整权重影响决策</p>
                    {aiMods.map((mod) => {
                      const Icon = mod.icon;
                      return (
                        <div key={mod.id} className={`rounded-xl border p-3 transition-all ${mod.enabled ? "border-pink-500/30 bg-pink-500/5" : "border-[var(--border-subtle)] bg-[var(--bg-primary)]/50"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${mod.enabled ? "text-pink-400" : "text-gray-400"}`} /><span className={`text-sm font-bold ${mod.enabled ? "text-white" : "text-gray-400"}`}>{mod.name}</span></div>
                            <button onClick={() => tAI(mod.id)} className="rounded-full px-2 py-0.5 text-[10px] border transition-colors ${mod.enabled ? 'bg-pink-500/20 border-pink-500/30 text-pink-400' : 'bg-gray-500/20 border-gray-500/30 text-gray-400'}">{mod.enabled ? "ON" : "OFF"}</button>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-2">{mod.desc}</p>
                          {mod.enabled && (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-[var(--text-muted)]">权重</span>
                              <input type="range" min="0" max="100" value={mod.weight * 100} onChange={(e) => sAIW(mod.id, Number(e.target.value) / 100)} className="flex-1 h-1 accent-pink-500" />
                              <span className="text-[10px] text-pink-400 font-bold">{mod.weight.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {log.length > 0 && (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                <div className="border-b border-[var(--border-subtle)] px-6 py-3 flex items-center gap-2"><Activity className="h-4 w-4 text-[var(--accent-pink)]" /><h3 className="text-sm font-bold text-[var(--text-primary)]">训练日志</h3></div>
                <div className="p-4 max-h-[200px] overflow-y-auto space-y-1">{log.map((l, i) => <p key={i} className="text-[11px] text-[var(--text-muted)] font-mono">{l}</p>)}</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* 拉面杯Buff显示 */}
            {selScenario.id === "ramen" && (ramenBuffs.length > 0 || ts.isFat) && <div className="rounded-2xl border border-orange-500/20 bg-[var(--bg-secondary)] p-4">
              <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>拉面状态</h3>
              {ts.isFat && <p className="text-[10px] text-red-400 mb-1">【吃胖了！】速度训练无效！{<span className="text-yellow-400">去保健室消除</span>}</p>}
              <div className="flex flex-wrap gap-1.5">
                {ramenBuffs.map((b, i) => {
                  const ramen = RAMEN_MENU.find((r) => r.id === b.ramenId);
                  return <span key={i} className="rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-400">{ramen?.name} +{Math.round(b.trainBonus * 100)}% ({b.remainingTurns}回合)</span>;
                })}
              </div>
            </div>}
            {/* 育马者杯已选Buff */}
            {selScenario.id === "breeders" && selBuffs.length > 0 && <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <h3 className="text-sm font-bold text-[var(--accent-pink)] mb-2 flex items-center gap-2"><Zap className="h-4 w-4" />已选剧本Buff</h3>
              <div className="flex flex-wrap gap-1.5">
                {selBuffs.map((bid) => {
                  const buff = BREEDERS_CUP_BUFFS.find((b) => b.id === bid);
                  if (!buff) return null;
                  const c = buff.color === "green" ? "text-green-400 border-green-500/30 bg-green-500/10" : buff.color === "blue" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-pink-400 border-pink-500/30 bg-pink-500/10";
                  return <span key={bid} className={`rounded-full px-2 py-0.5 text-[10px] border ${c}`}>{buff.name}</span>;
                })}
              </div>
              {selFriend !== null && <p className="text-[10px] text-pink-400 mt-2">友人卡加成: +5pt</p>}
            </div>}
            {activeAI.length > 0 && <div className="rounded-2xl border border-pink-500/20 bg-[var(--bg-secondary)] p-4">
              <h3 className="text-sm font-bold text-pink-400 mb-2 flex items-center gap-2"><Cpu className="h-4 w-4" />已激活AI模块</h3>
              <div className="flex flex-wrap gap-1.5">{activeAI.map((m) => <span key={m.id} className="rounded-full bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 text-[10px] text-pink-400">{m.name} ({m.weight.toFixed(1)})</span>)}</div>
            </div>}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
              <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" /><h2 className="text-lg font-bold text-[var(--text-primary)]">可获得技能</h2></div>
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {skills.hintSkills.length > 0 && <div><h3 className="text-xs font-bold text-[var(--accent-pink)] mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Hint 技能 ({skills.hintSkills.length})</h3><div className="space-y-1.5">{skills.hintSkills.map((s) => <div key={`h-${s.sid}`} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-3 py-2"><p className="text-xs text-[var(--text-primary)] leading-relaxed">{s.desc}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.cardName}</p></div>)}</div></div>}
                {skills.eventSkills.length > 0 && <div><h3 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />事件技能 ({skills.eventSkills.length})</h3><div className="space-y-1.5">{skills.eventSkills.map((s) => <div key={`e-${s.sid}`} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 px-3 py-2"><p className="text-xs text-[var(--text-primary)] leading-relaxed">{s.desc}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.cardName}</p></div>)}</div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

