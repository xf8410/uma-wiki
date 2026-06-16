/**
 * URA风格训练决策仪表盘
 * 
 * 设计灵感：UmamusumeResponseAnalyzer GUI版
 * - 黑色背景 + 彩色边框 + 等宽字体
 * - 五列训练卡片（速红/耐绿/力橙/根紫/智蓝）
 * - 右侧决策面板
 * - 支持快捷输入 + 记录到数据收集器
 * 
 * Phase C: 手动输入 + 精美GUI
 * Phase A: 后续加截图OCR自动填数
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { umaList } from "@/data/umaList";
import { getAllBaseStats, getStarStats, calculateExpectedStart, type ParentFactor } from "@/data/umaBaseStats";
import {
  createSession, saveSession, getAllSessions, addTurnRecord,
  type CollectionSession, type FiveStats,
} from "@/utils/dataCollector";
import {
  createNurtureLog, saveNurtureLog, type NurtureLog,
} from "@/data/trainingLog";

// ========== 常量 ==========
const MOOD_NAMES = ["", "绝不调", "不调", "普通", "好调", "绝好调"];
const MOOD_COLORS = ["", "#ff4444", "#ff8844", "#aaaaaa", "#44ff88", "#ffdd44"];

const TRAIN_TYPES = [
  { key: "speed", label: "速度", short: "速", color: "#ff4444", border: "#ff4444", bg: "rgba(255,68,68,0.08)", action: "train-speed" },
  { key: "stamina", label: "耐力", short: "耐", color: "#ffcc00", border: "#ffcc00", bg: "rgba(255,204,0,0.08)", action: "train-stamina" },
  { key: "power", label: "力量", short: "力", color: "#ff8844", border: "#ff8844", bg: "rgba(255,136,68,0.08)", action: "train-power" },
  { key: "guts", label: "根性", short: "根", color: "#cc44ff", border: "#cc44ff", bg: "rgba(204,68,255,0.08)", action: "train-guts" },
  { key: "wit", label: "智力", short: "智", color: "#4488ff", border: "#4488ff", bg: "rgba(68,136,255,0.08)", action: "train-wit" },
];

interface GameState {
  speed: number; stamina: number; power: number; guts: number; wit: number;
  vital: number; motivation: number; skillPt: number; turn: number; isFat: boolean;
}

export default function DataDashboard() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"setup" | "dashboard">("setup");

  // 设置参数
  const [selCard, setSelCard] = useState("");
  const [selStar, setSelStar] = useState(3);
  const [selScenario, setSelScenario] = useState("ura");
  const [p1, setP1] = useState<ParentFactor>({ speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 });
  const [p2, setP2] = useState<ParentFactor>({ speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 });

  // 游戏状态
  const [state, setState] = useState<GameState>({
    speed: 0, stamina: 0, power: 0, guts: 0, wit: 0,
    vital: 100, motivation: 3, skillPt: 120, turn: 1, isFat: false,
  });

  // 收集会话
  const [session, setSession] = useState<CollectionSession | null>(null);
  const [log, setLog] = useState<NurtureLog | null>(null);
  const [lastAction, setLastAction] = useState("");
  const [advice, setAdvice] = useState<string[]>([]);

  const allStats = getAllBaseStats();

  // 计算AI建议
  const calculateAdvice = useCallback((s: GameState): string[] => {
    const adv: string[] = [];
    const avg = (s.speed + s.stamina + s.power + s.guts + s.wit) / 5;

    // 紧急状态
    if (s.isFat) adv.push("【紧急】吃胖中！速度训练无效！去保健室！");
    if (s.vital < 15) adv.push("【紧急】体力危险！必须休息！");
    else if (s.vital < 30) adv.push("【警告】体力低，建议休息");

    // 心情
    if (s.motivation <= 1) adv.push("【紧急】绝不调！优先外出！");
    else if (s.motivation === 2) adv.push("【建议】不调，考虑外出");

    // 最优训练
    const stats = [
      { name: "速度", val: s.speed, key: "train-speed" },
      { name: "耐力", val: s.stamina, key: "train-stamina" },
      { name: "力量", val: s.power, key: "train-power" },
      { name: "根性", val: s.guts, key: "train-guts" },
      { name: "智力", val: s.wit, key: "train-wit" },
    ].filter(st => !s.isFat || st.name !== "速度");

    const minStat = stats.reduce((a, b) => a.val < b.val ? a : b);
    const maxStat = stats.reduce((a, b) => a.val > b.val ? a : b);

    if (s.vital >= 30 && s.motivation >= 3 && !s.isFat) {
      if (maxStat.val > 1200 && minStat.val < avg * 0.7) {
        adv.push(`⭐推荐：训练${minStat.name}（补弱，${maxStat.name}已超1200收益递减）`);
      } else {
        adv.push(`⭐推荐：训练${maxStat.name}（优势属性，心情好）`);
      }
    }

    // 替代方案
    if (s.vital < 40) adv.push("②备选：休息（+50体力）");
    if (s.motivation <= 2) adv.push("②备选：外出（+心情）");

    // 阶段提示
    const stages: Record<string, string> = {
      "ura": "URA", "aoharu": "青春杯", "mastery": "巅峰杯",
      "grand": "GrandLive", "ramen": "拉面杯",
    };
    adv.push(`📍${stages[selScenario] || selScenario} | T${s.turn}/72`);

    return adv;
  }, [selScenario]);

  useEffect(() => {
    setAdvice(calculateAdvice(state));
  }, [state, calculateAdvice]);

  // 开始仪表盘
  const startDashboard = () => {
    const uma = allStats.find(u => u.cardId === selCard);
    if (!uma) { alert("先选马娘"); return; }
    const naked = getStarStats(uma, selStar);
    if (!naked) { alert(`缺少${selStar}星数据`); return; }

    const expected = calculateExpectedStart(naked, p1, p2);
    const newState: GameState = {
      ...expected, vital: 100, motivation: 3, skillPt: 120, turn: 1, isFat: false,
    };
    setState(newState);

    // 创建收集会话
    const umaInfo = umaList.find(u => u.cardId === selCard);
    const s = createSession(selCard, umaInfo?.nameCN || uma.nameCN, selStar, selScenario, JSON.stringify(p1), JSON.stringify(p2), []);
    saveSession(s);
    setSession(s);

    // 创建训练日志
    const l = createNurtureLog(selCard, umaInfo?.nameCN || uma.nameCN, selStar as 3 | 4 | 5, selScenario, expected, []);
    setLog(l);

    setPhase("dashboard");
  };

  // 执行行动
  const doAction = (action: string) => {
    setState(prev => {
      const next = { ...prev, turn: prev.turn + 1 };

      switch (action) {
        case "train-speed":
          if (!prev.isFat) next.speed += Math.round(15 + Math.random() * 10);
          next.vital = Math.max(0, prev.vital - 21);
          break;
        case "train-stamina":
          next.stamina += Math.round(15 + Math.random() * 10);
          next.vital = Math.max(0, prev.vital - 21);
          break;
        case "train-power":
          next.power += Math.round(15 + Math.random() * 10);
          next.vital = Math.max(0, prev.vital - 21);
          break;
        case "train-guts":
          next.guts += Math.round(15 + Math.random() * 10);
          next.vital = Math.max(0, prev.vital - 21);
          break;
        case "train-wit":
          next.wit += Math.round(12 + Math.random() * 8);
          next.vital = Math.max(0, prev.vital - 10);
          break;
        case "rest":
          next.vital = Math.min(100, prev.vital + 50);
          break;
        case "outing":
          next.motivation = Math.min(5, prev.motivation + 1);
          next.vital = Math.min(100, prev.vital + 10);
          break;
        case "clinic":
          next.isFat = false;
          if (prev.motivation === 1) next.motivation = 2;
          break;
        case "race":
          next.skillPt += 35;
          next.isFat = false;
          break;
      }

      // 记录到收集器
      if (session) {
        addTurnRecord(session, prev.turn, action,
          { speed: next.speed, stamina: next.stamina, power: next.power, guts: next.guts, wit: next.wit },
          next.vital, next.motivation, next.skillPt, next.isFat
        );
      }

      return next;
    });

    setLastAction(action);
  };

  // 快捷调整属性
  const adjustStat = (key: keyof FiveStats, delta: number) => {
    setState(prev => ({ ...prev, [key]: Math.max(0, (prev[key] as number) + delta) }));
  };

  // ========== 设置界面 ==========
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-black p-4" style={{ fontFamily: "monospace" }}>
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-bold text-[#ff69b4] mb-1">UmaAI Dashboard</h1>
          <p className="text-xs text-gray-500 mb-4">URA风格训练决策仪表盘</p>

          {/* 马娘选择 */}
          <div className="mb-4 border border-gray-700 rounded p-3">
            <p className="text-xs text-cyan-400 mb-2">-- 马娘 --</p>
            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
              {umaList.map(uma => {
                const hasData = allStats.some(u => u.cardId === uma.cardId);
                return (
                  <button key={uma.cardId} onClick={() => setSelCard(uma.cardId)}
                    className={`rounded p-1 text-center text-[10px] border ${
                      selCard === uma.cardId ? "border-[#ff69b4] text-[#ff69b4] bg-[#ff69b4]/10"
                      : hasData ? "border-gray-700 text-gray-400 hover:text-white"
                      : "border-gray-800 text-gray-600"
                    }`}>
                    {uma.nameCN}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 星级 */}
          <div className="mb-4 border border-gray-700 rounded p-3">
            <p className="text-xs text-cyan-400 mb-2">-- 星级 --</p>
            <div className="flex gap-2">
              {[3, 4, 5].map(s => (
                <button key={s} onClick={() => setSelStar(s)}
                  className={`rounded border px-4 py-1 text-sm ${selStar === s ? "border-yellow-400 text-yellow-400" : "border-gray-700 text-gray-500"}`}>
                  {s}★
                </button>
              ))}
            </div>
          </div>

          {/* 剧本 */}
          <div className="mb-4 border border-gray-700 rounded p-3">
            <p className="text-xs text-cyan-400 mb-2">-- 剧本 --</p>
            <select value={selScenario} onChange={e => setSelScenario(e.target.value)}
              className="w-full rounded border border-gray-700 bg-black p-2 text-sm text-white">
              <option value="ura">URA</option>
              <option value="aoharu">青春杯</option>
              <option value="mastery">巅峰杯</option>
              <option value="grand">Grand Live</option>
              <option value="ramen">拉面杯</option>
            </select>
          </div>

          {/* 种马因子 */}
          <div className="mb-4 border border-gray-700 rounded p-3">
            <p className="text-xs text-cyan-400 mb-2">-- 种马蓝因子 (每星+7) --</p>
            <div className="mb-2">
              <p className="text-[10px] text-gray-500">种马1</p>
              <FactorInputMini factor={p1} onChange={setP1} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">种马2</p>
              <FactorInputMini factor={p2} onChange={setP2} />
            </div>
          </div>

          {/* 预期开局 */}
          {selCard && (() => {
            const uma = allStats.find(u => u.cardId === selCard);
            const naked = uma ? getStarStats(uma, selStar) : null;
            if (!naked) return null;
            const exp = calculateExpectedStart(naked, p1, p2);
            return (
              <div className="mb-4 border border-green-700 rounded p-3">
                <p className="text-xs text-green-400 mb-1">-- 预期开局 --</p>
                <p className="text-sm text-white">
                  速{exp.speed} 耐{exp.stamina} 力{exp.power} 根{exp.guts} 智{exp.wit}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">核对游戏实际开局，不一致请调整因子</p>
              </div>
            );
          })()}

          <button onClick={startDashboard}
            className="w-full rounded bg-[#ff69b4] py-3 text-sm font-bold text-black hover:bg-[#ff88cc] transition-colors">
            启动仪表盘
          </button>
        </div>
      </div>
    );
  }

  // ========== 仪表盘界面 ==========
  const totalStats = state.speed + state.stamina + state.power + state.guts + state.wit;
  const maxStat = Math.max(state.speed, state.stamina, state.power, state.guts, state.wit);

  return (
    <div className="min-h-screen bg-black text-white select-none" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* 顶部状态栏 */}
      <div className="border-b border-gray-800 px-3 py-2">
        <div className="mx-auto max-w-6xl flex items-center gap-4 flex-wrap">
          <div className="border border-cyan-500/50 rounded px-3 py-1">
            <p className="text-[10px] text-cyan-400">日期</p>
            <p className="text-sm font-bold">{getStageName(state.turn)}</p>
          </div>
          <div className="border border-green-500/50 rounded px-3 py-1">
            <p className="text-[10px] text-green-400">总属性</p>
            <p className="text-sm font-bold text-green-400">{totalStats} <span className="text-[10px] text-gray-500">Pt {state.skillPt}</span></p>
          </div>
          <div className="border border-yellow-500/50 rounded px-3 py-1">
            <p className="text-[10px] text-yellow-400">体力</p>
            <p className={`text-sm font-bold ${state.vital < 30 ? "text-red-400" : "text-yellow-400"}`}>
              {state.vital}/100
            </p>
          </div>
          <div className="border border-pink-500/50 rounded px-3 py-1">
            <p className="text-[10px] text-pink-400">干劲</p>
            <p className="text-sm font-bold" style={{ color: MOOD_COLORS[state.motivation] }}>
              {MOOD_NAMES[state.motivation]}
            </p>
          </div>
          {state.isFat && (
            <div className="border border-red-500 rounded px-3 py-1 bg-red-500/10 animate-pulse">
              <p className="text-[10px] text-red-400">状态</p>
              <p className="text-sm font-bold text-red-400">吃胖中！</p>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={() => setPhase("setup")}
              className="rounded border border-gray-700 px-3 py-1 text-[10px] text-gray-400 hover:text-white">
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 重要信息 */}
      <div className="border-b border-gray-800 px-3 py-2">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] text-yellow-400 mb-1">-- 重要信息 --</p>
          <div className="space-y-1">
            {advice.slice(0, 3).map((a, i) => (
              <p key={i} className={`text-xs ${a.includes("⭐") ? "text-green-400" : a.includes("【紧急】") ? "text-red-400 font-bold" : "text-gray-400"}`}>
                {a}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 主面板 */}
      <div className="mx-auto max-w-6xl px-3 py-3">
        <div className="flex gap-3">
          {/* 五列训练 */}
          <div className="flex-1 grid grid-cols-5 gap-2">
            {TRAIN_TYPES.map(tt => {
              const val = state[tt.key as keyof GameState] as number;
              const pct = maxStat > 0 ? Math.round((val / maxStat) * 100) : 0;
              const isFatBlock = tt.key === "speed" && state.isFat;
              const isRecommended = advice.some(a => a.includes(`训练${tt.label}`));

              return (
                <button key={tt.key}
                  onClick={() => doAction(tt.action)}
                  className={`rounded border p-2 text-left transition-all hover:brightness-125 ${
                    isRecommended ? "ring-1 ring-white/30" : ""
                  } ${isFatBlock ? "opacity-30" : ""}`}
                  style={{ borderColor: tt.border, backgroundColor: tt.bg }}>

                  {/* 标题 */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: tt.color }}>{tt.short}</span>
                    <span className="text-[10px] text-gray-500">({pct}%)</span>
                  </div>

                  {/* 数值 */}
                  <p className="text-lg font-bold" style={{ color: tt.color }}>{val}</p>

                  {/* 上限提示 */}
                  {val >= 1200 && (
                    <p className="text-[8px] text-yellow-400">超1200 收益↓</p>
                  )}
                  {val >= 1800 && (
                    <p className="text-[8px] text-red-400">接近上限</p>
                  )}

                  {/* 吃胖遮罩 */}
                  {isFatBlock && (
                    <p className="text-[10px] text-red-400 font-bold mt-1">无效</p>
                  )}

                  {/* 训练消耗 */}
                  <p className="text-[8px] text-gray-500 mt-1">
                    体力-{tt.key === "wit" ? "10" : "21"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* 右侧决策面板 */}
          <div className="w-56 space-y-2">
            {/* 决策 */}
            <div className="border border-cyan-500/30 rounded p-2">
              <p className="text-[10px] text-cyan-400 mb-1">-- 决策 --</p>
              {advice.filter(a => a.includes("⭐") || a.includes("②")).map((a, i) => (
                <p key={i} className={`text-[11px] ${a.includes("⭐") ? "text-green-400" : "text-gray-400"}`}>
                  {a.replace("⭐推荐：", "").replace("②备选：", "")}
                </p>
              ))}
            </div>

            {/* 其他动作 */}
            <div className="border border-gray-700 rounded p-2">
              <p className="text-[10px] text-gray-500 mb-1">-- 其他 --</p>
              <div className="space-y-1">
                <button onClick={() => doAction("rest")}
                  className="w-full rounded border border-green-500/30 bg-green-500/5 px-2 py-1 text-left text-[11px] text-green-400 hover:bg-green-500/10">
                  休息 +50体力
                </button>
                <button onClick={() => doAction("outing")}
                  className="w-full rounded border border-pink-500/30 bg-pink-500/5 px-2 py-1 text-left text-[11px] text-pink-400 hover:bg-pink-500/10">
                  外出 +1心情
                </button>
                <button onClick={() => doAction("race")}
                  className="w-full rounded border border-yellow-500/30 bg-yellow-500/5 px-2 py-1 text-left text-[11px] text-yellow-400 hover:bg-yellow-500/10">
                  比赛 +35pt
                </button>
                <button onClick={() => doAction("clinic")}
                  className="w-full rounded border border-red-500/30 bg-red-500/5 px-2 py-1 text-left text-[11px] text-red-400 hover:bg-red-500/10">
                  保健室 消debuff
                </button>
              </div>
            </div>

            {/* 回合信息 */}
            <div className="border border-gray-700 rounded p-2">
              <p className="text-[10px] text-gray-500 mb-1">-- Route --</p>
              <p className="text-[11px] text-gray-400">T{state.turn}/72</p>
              {lastAction && (
                <p className="text-[10px] text-gray-500 mt-1">上回合: {lastAction}</p>
              )}
            </div>
          </div>
        </div>

        {/* 底部快捷调整 */}
        <div className="mt-3 border-t border-gray-800 pt-3">
          <p className="text-[10px] text-gray-500 mb-2">-- 数值微调 (与实际核对) --</p>
          <div className="flex gap-3 flex-wrap">
            {TRAIN_TYPES.map(tt => (
              <div key={tt.key} className="flex items-center gap-1">
                <span className="text-[10px] w-4" style={{ color: tt.color }}>{tt.short}</span>
                <button onClick={() => adjustStat(tt.key as keyof FiveStats, -1)}
                  className="rounded border border-gray-700 px-1 text-[10px] text-gray-500">-</button>
                <span className="text-xs w-10 text-center" style={{ color: tt.color }}>
                  {state[tt.key as keyof GameState] as number}
                </span>
                <button onClick={() => adjustStat(tt.key as keyof FiveStats, 1)}
                  className="rounded border border-gray-700 px-1 text-[10px] text-gray-500">+</button>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-4">
              <span className="text-[10px] text-yellow-400">体</span>
              <input type="range" min={0} max={100} value={state.vital}
                onChange={e => setState(p => ({ ...p, vital: parseInt(e.target.value) }))}
                className="w-20" />
              <span className="text-xs text-yellow-400 w-6">{state.vital}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-pink-400">情</span>
              {[1, 2, 3, 4, 5].map(m => (
                <button key={m} onClick={() => setState(p => ({ ...p, motivation: m }))}
                  className={`rounded px-1 text-[10px] ${state.motivation === m ? "bg-pink-500 text-white" : "border border-gray-700 text-gray-500"}`}>
                  {m}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1 ml-4">
              <input type="checkbox" checked={state.isFat} onChange={e => setState(p => ({ ...p, isFat: e.target.checked }))}
                className="rounded" />
              <span className="text-[10px] text-orange-400">吃胖</span>
            </label>
          </div>
        </div>

        {/* 收集进度 */}
        {session && (
          <div className="mt-3 border-t border-gray-800 pt-3 flex items-center gap-4">
            <p className="text-[10px] text-gray-500">
              已收集 {session.turns.length} 回合
              {session.turns.length >= 72 && " ✓ 完成"}
            </p>
            <div className="h-1 flex-1 rounded-full bg-gray-800 max-w-[200px]">
              <div className="h-full rounded-full bg-[#ff69b4] transition-all"
                style={{ width: `${Math.min(100, (session.turns.length / 72) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 辅助组件 ==========

function FactorInputMini({ factor, onChange }: { factor: ParentFactor; onChange: (f: ParentFactor) => void }) {
  const fields = [
    { key: "speed" as const, label: "速", color: "text-red-400" },
    { key: "stamina" as const, label: "耐", color: "text-yellow-400" },
    { key: "power" as const, label: "力", color: "text-orange-400" },
    { key: "guts" as const, label: "根", color: "text-purple-400" },
    { key: "wit" as const, label: "智", color: "text-blue-400" },
  ];

  return (
    <div className="flex gap-1">
      {fields.map(({ key, label, color }) => (
        <div key={key} className="flex-1">
          <label className={`text-[8px] ${color}`}>{label}</label>
          <input type="number" min={0} max={9} value={factor[key]}
            onChange={e => onChange({ ...factor, [key]: Math.max(0, Math.min(9, parseInt(e.target.value) || 0)) })}
            className="w-full rounded border border-gray-700 bg-black p-1 text-center text-xs text-white" />
        </div>
      ))}
    </div>
  );
}

function getStageName(turn: number): string {
  if (turn <= 12) return `出道前 T${turn}`;
  if (turn <= 24) return `Junior T${turn}`;
  if (turn <= 36) return `Classic前半 T${turn}`;
  if (turn <= 48) return `Classic后半 T${turn}`;
  if (turn <= 60) return `Senior前半 T${turn}`;
  return `Senior后半 T${turn}`;
}
