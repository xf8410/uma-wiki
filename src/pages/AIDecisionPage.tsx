import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Wind,
  Heart,
  Swords,
  Shield,
  Zap,
  Star,
  Trophy,
  TrendingUp,
  ChevronRight,
  Smartphone,
  Info,
  Cookie,
} from "lucide-react";

interface GameState {
  speed: number;
  stamina: number;
  power: number;
  guts: number;
  wit: number;
  vital: number;
  motivation: number;
  skillPt: number;
  turn: number;
  isFat: boolean;
}

interface Advice {
  action: string;
  reason: string;
  priority: number;
  color: string;
}

const STAT_CONFIG = [
  { key: "speed" as const, label: "速度", icon: Wind, color: "text-red-400" },
  { key: "stamina" as const, label: "耐力", icon: Heart, color: "text-yellow-400" },
  { key: "power" as const, label: "力量", icon: Swords, color: "text-orange-400" },
  { key: "guts" as const, label: "根性", icon: Shield, color: "text-purple-400" },
  { key: "wit" as const, label: "智力", icon: Zap, color: "text-blue-400" },
];

const MOOD_NAMES = ["绝不调", "不调", "普通", "好调", "绝好调"];

function getAdvice(state: GameState): Advice[] {
  const advices: Advice[] = [];
  const { speed, stamina, power, guts, wit, vital, motivation, skillPt, turn, isFat } = state;
  const avg = (speed + stamina + power + guts + wit) / 5;

  // 0. 吃胖状态 - 最高优先级提示
  if (isFat) {
    advices.push({ action: "去保健室！", reason: "吃胖状态下速度训练无效！必须去保健室消除吃胖debuff", priority: 10, color: "text-red-400" });
  }

  // 1. 体力判断
  if (vital < 20) {
    advices.push({ action: "休息", reason: "体力极低，必须恢复！继续训练可能失败", priority: 9, color: "text-red-400" });
  } else if (vital < 40) {
    advices.push({ action: "休息/外出", reason: "体力不足，建议恢复", priority: 8, color: "text-yellow-400" });
  }

  // 2. 心情判断
  if (motivation <= 2) {
    advices.push({ action: "外出", reason: "心情低落，训练效果差，建议外出提升心情", priority: 7, color: "text-pink-400" });
  }

  // 3. 劣势属性判断
  const stats = [
    { name: "速度", value: speed },
    { name: "耐力", value: stamina },
    { name: "力量", value: power },
    { name: "根性", value: guts },
    { name: "智力", value: wit },
  ];
  // 吃胖时排除速度训练
  const trainableStats = isFat ? stats.filter(s => s.name !== "速度") : stats;
  const minStat = trainableStats.reduce((a, b) => a.value < b.value ? a : b);
  if (minStat.value < avg * 0.8) {
    const note = isFat && minStat.name !== "速度" ? "（吃胖中，速度训练无效）" : "";
    advices.push({ action: `训练${minStat.name}`, reason: `${minStat.name}远低于平均水平，优先补弱${note}`, priority: 6, color: "text-blue-400" });
  }

  // 4. 优势属性继续强化（吃胖时排除速度）
  const maxStat = trainableStats.reduce((a, b) => a.value > b.value ? a : b);
  if (motivation >= 4 && vital >= 50) {
    const note = isFat ? "（吃胖中跳过速度）" : "";
    advices.push({ action: `训练${maxStat.name}`, reason: `心情好体力足，强化${maxStat.name}优势${note}`, priority: 5, color: "text-green-400" });
  }

  // 5. 比赛判断
  if (turn > 20 && skillPt > 200) {
    advices.push({ action: "比赛", reason: "技能点充足，可以比赛获取收益", priority: 4, color: "text-yellow-400" });
  }

  // 6. 一般训练建议
  if (advices.filter(a => !a.action.includes("吃胖")).length === 0) {
    if (motivation >= 3 && vital >= 40) {
      const note = isFat ? "（吃胖中跳过速度）" : "";
      advices.push({ action: `训练${minStat.name}`, reason: `状态良好，优先补弱属性${note}`, priority: 5, color: "text-blue-400" });
    } else {
      advices.push({ action: "外出", reason: "综合状态一般，建议外出调整", priority: 4, color: "text-pink-400" });
    }
  }

  return advices.sort((a, b) => b.priority - a.priority);
}

export default function AIDecisionPage() {
  const [state, setState] = useState<GameState>({
    speed: 100,
    stamina: 100,
    power: 100,
    guts: 100,
    wit: 100,
    vital: 80,
    motivation: 3,
    skillPt: 120,
    turn: 1,
    isFat: false,
  });
  const [showAdvice, setShowAdvice] = useState(false);

  const advices = showAdvice ? getAdvice(state) : [];

  const update = (key: keyof GameState, val: number) => {
    setState((p) => ({ ...p, [key]: Math.max(0, val) }));
    setShowAdvice(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-lg px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="h-6 w-6 text-[var(--accent-pink)]" />
            AI实时决策
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">手机浏览器打开，输入当前游戏状态获取AI建议</p>
        </motion.div>

        {/* 使用说明 */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-[var(--accent-pink)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">手机使用方法</span>
          </div>
          <ol className="text-xs text-[var(--text-muted)] space-y-1 list-decimal pl-4">
            <li>在手机浏览器打开此页面（收藏夹保存）</li>
            <li>游戏暂停，查看当前马娘状态</li>
            <li>在本页输入对应的数值</li>
            <li>点击"获取AI建议"</li>
            <li>按照建议操作后，更新状态继续</li>
          </ol>
        </div>

        {/* 回合和技能点 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <label className="text-xs text-[var(--text-muted)]">回合</label>
            <input type="number" value={state.turn} onChange={(e) => update("turn", Number(e.target.value))}
              className="w-full mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-lg font-bold text-[var(--text-primary)] focus:border-[var(--accent-pink)] focus:outline-none" />
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <label className="text-xs text-[var(--text-muted)]">技能点</label>
            <input type="number" value={state.skillPt} onChange={(e) => update("skillPt", Number(e.target.value))}
              className="w-full mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-lg font-bold text-yellow-400 focus:border-[var(--accent-pink)] focus:outline-none" />
          </div>
        </div>

        {/* 吃胖状态 */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 mb-4">
          <button
            onClick={() => {
              setState((p) => ({ ...p, isFat: !p.isFat }));
              setShowAdvice(false);
            }}
            className={`w-full flex items-center justify-between rounded-lg px-4 py-3 transition-all ${
              state.isFat
                ? "bg-orange-500/20 border border-orange-500/50"
                : "bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Cookie className={`h-5 w-5 ${state.isFat ? "text-orange-400" : "text-[var(--text-muted)]"}`} />
              <span className={`text-sm font-bold ${state.isFat ? "text-orange-400" : "text-[var(--text-muted)]"}`}>
                吃胖状态
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all ${state.isFat ? "bg-orange-500" : "bg-[var(--border-subtle)]"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${state.isFat ? "translate-x-6" : "translate-x-0.5"}`} />
            </div>
          </button>
          {state.isFat && (
            <p className="text-xs text-orange-400 mt-2 px-1">
              吃胖中：速度训练无效，建议参加比赛消除或训练其他属性
            </p>
          )}
        </div>

        {/* 五维属性 */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 mb-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent-pink)]" />
            五维属性
          </h3>
          <div className="space-y-3">
            {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                <span className="text-xs text-[var(--text-muted)] w-8">{label}</span>
                <input type="range" min="0" max="2000" value={state[key]} onChange={(e) => update(key, Number(e.target.value))}
                  className="flex-1 h-1 accent-[var(--accent-pink)]" />
                <input type="number" min="0" max="2000" value={state[key]} onChange={(e) => update(key, Number(e.target.value))}
                  className={`w-16 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-sm font-bold ${color} text-center focus:border-[var(--accent-pink)] focus:outline-none`} />
              </div>
            ))}
          </div>
        </div>

        {/* 体力和心情 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <label className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" /> 体力
            </label>
            <input type="range" min="0" max="100" value={state.vital} onChange={(e) => update("vital", Number(e.target.value))}
              className="w-full h-1 accent-red-400 mt-2" />
            <div className="flex justify-between mt-1">
              <input type="number" value={state.vital} onChange={(e) => update("vital", Number(e.target.value))}
                className="w-16 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-sm font-bold text-red-400 text-center" />
              <span className="text-xs text-[var(--text-muted)] self-center">/100</span>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <label className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Star className="h-3 w-3 text-pink-400" /> 心情
            </label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button key={m} onClick={() => update("motivation", m)}
                  className={`flex-1 rounded-lg py-2 text-[10px] font-bold transition-all ${
                    state.motivation === m
                      ? "bg-[var(--accent-pink)] text-white"
                      : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                  }`}>
                  {MOOD_NAMES[m - 1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 获取建议按钮 */}
        <button
          onClick={() => setShowAdvice(true)}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity mb-4 flex items-center justify-center gap-2"
        >
          <Brain className="h-5 w-5" />
          获取AI建议
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* 建议结果 */}
        {showAdvice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {advices.map((a, i) => (
              <div key={i} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-primary)]`}>
                    {i === 0 ? <Trophy className={`h-5 w-5 ${a.color}`} /> : <TrendingUp className={`h-5 w-5 ${a.color}`} />}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${a.color}`}>{a.action}</p>
                    <p className="text-xs text-[var(--text-muted)]">{a.reason}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="text-xs font-bold text-[var(--text-muted)]">决策逻辑</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                AI基于多因素决策：体力{state.vital > 50 ? "充足" : state.vital > 20 ? "一般" : "不足"}
                ，心情{MOOD_NAMES[state.motivation - 1]}
                {state.isFat ? "，吃胖中（速度训练无效）" : ""}
                ，{advices[0]?.reason}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
