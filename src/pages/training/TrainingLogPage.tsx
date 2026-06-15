/**
 * 训练数据录入页面
 * 
 * 核心功能：
 * 1. 开局属性校准（裸属性 + 种马蓝因子 = 预期开局）
 * 2. 每回合训练决策记录
 * 3. 最终结果录入 + 评分反推
 * 4. 最优决策分析
 * 
 * 【重要】开局属性 = 马娘裸属性 + 种马蓝因子加成
 * 蓝因子：每星+7，9星=63，18星=126
 */

import { useState, useEffect } from "react";
import { umaList } from "@/data/umaList";
import {
  getAllBaseStats, getStarStats, saveUmaBaseStats,
  type UmaBaseStats, type StarStats, type ParentFactor,
  calculateExpectedStart, BLUE_FACTOR_PER_STAR,
} from "@/data/umaBaseStats";
import {
  createNurtureLog, saveNurtureLog, getAllNurtureLogs,
  addTurnRecord, setFinalResult, deleteNurtureLog,
  exportLogsToJSON, importLogsFromJSON,
  type NurtureLog, type TurnRecord,
} from "@/data/trainingLog";
import { extractStatEvaluation, analyzeOptimalPath } from "@/utils/scoreCalculator";
import {
  BookOpen, Plus, Trash2, Save, Play, ChevronRight,
  TrendingUp, Target, AlertCircle, CheckCircle, Upload, Download,
  Star, Edit3, Database
} from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  "train-speed": "速度训练", "train-stamina": "耐力训练",
  "train-power": "力量训练", "train-guts": "根性训练",
  "train-wit": "智力训练", "rest": "休息",
  "outing": "外出", "race": "比赛", "clinic": "保健室",
  "skill": "学技能", "ramen": "吃拉面"
};

/** 空的种马因子 */
const emptyFactor = (): ParentFactor => ({ speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 });

export default function TrainingLogPage() {
  const [mode, setMode] = useState<"list" | "new" | "edit" | "analysis" | "uma-db">("list");
  const [logs, setLogs] = useState<NurtureLog[]>([]);
  const [currentLog, setCurrentLog] = useState<NurtureLog | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [allStats, setAllStats] = useState<UmaBaseStats[]>([]);

  useEffect(() => {
    setLogs(getAllNurtureLogs());
    setAllStats(getAllBaseStats());
  }, []);

  // ========== 新建记录 ==========
  const startNewLog = (
    cardId: string, star: number, scenario: string,
    parent1: ParentFactor, parent2: ParentFactor
  ) => {
    const uma = umaList.find(u => u.cardId === cardId);
    const base = allStats.find(u => u.cardId === cardId);
    if (!uma || !base) { alert("未找到马娘数据"); return; }

    const nakedStats = getStarStats(base, star);
    if (!nakedStats) { alert(`缺少${star}星数据，请先录入`); return; }

    // 计算预期开局
    const expected = calculateExpectedStart(nakedStats, parent1, parent2);

    const log = createNurtureLog(cardId, uma.nameCN, star as 3 | 4 | 5, scenario, expected, []);
    setCurrentLog(log);
    setCurrentTurn(1);
    setMode("edit");
  };

  // ========== 添加回合 ==========
  const addTurn = (action: string) => {
    if (!currentLog) return;
    const record: TurnRecord = {
      turn: currentTurn,
      action: action as any,
      beforeStats: { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 },
      afterStats: { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 },
      vitalBefore: 0, vitalAfter: 0, motivation: 3, skillPt: 0,
      isFat: false, supportCards: []
    };
    addTurnRecord(currentLog, record);
    setCurrentLog({ ...currentLog });
    setCurrentTurn(p => Math.min(72, p + 1));
  };

  // ========== 保存最终结果 ==========
  const saveFinalResult = (totalEval: number, skillEval: number, rank: string, finalStats: StarStats) => {
    if (!currentLog) return;
    setFinalResult(currentLog, finalStats, totalEval, skillEval, rank);
    saveNurtureLog(currentLog);
    setLogs(getAllNurtureLogs());
    alert(`保存成功！\n总评分: ${totalEval}\n技能分: ${skillEval}\n纯属性分: ${extractStatEvaluation(totalEval, skillEval)}\n评级: ${rank}`);
    setMode("list");
  };

  // ========== 列表模式 ==========
  if (mode === "list") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[var(--accent-pink)]" />
                训练数据记录
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                记录每回合决策 → 分析最优策略 → 反推纯属性评分
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("uma-db")}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent-pink)] flex items-center gap-2">
                <Database className="h-4 w-4" />属性库
              </button>
              <button onClick={() => setMode("analysis")}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent-pink)] flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />最优分析
              </button>
              <button onClick={() => setMode("new")}
                className="rounded-lg bg-[var(--accent-pink)] px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />新建
              </button>
            </div>
          </div>

          {/* 导入导出 */}
          <div className="mb-4 flex gap-3">
            <button onClick={() => {
              const json = exportLogsToJSON();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `uma_logs_${Date.now()}.json`; a.click();
            }} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-pink)] flex items-center gap-1">
              <Download className="h-3 w-3" />导出JSON
            </button>
            <label className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-pink)] flex items-center gap-1 cursor-pointer">
              <Upload className="h-3 w-3" />导入JSON
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (importLogsFromJSON(ev.target?.result as string)) {
                      setLogs(getAllNurtureLogs()); alert("导入成功！");
                    } else alert("格式错误");
                  };
                  reader.readAsText(file);
                }
              }} />
            </label>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-12 text-center">
              <Target className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">暂无训练记录</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">点击"新建"开始录入</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{log.umaName} ({log.star}星)</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {log.turns.length}回合 | 剧本:{log.scenario}
                      </p>
                      {log.finalEvaluation > 0 && (
                        <>
                          <p className="text-xs text-yellow-400">
                            总{log.finalEvaluation} | 技能{log.skillEvaluation} | 属性{log.statEvaluation} | {log.rank}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            终局: 速{log.finalStats.speed} 耐{log.finalStats.stamina} 力{log.finalStats.power} 根{log.finalStats.guts} 智{log.finalStats.wit}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurrentLog(log); setCurrentTurn(log.turns.length + 1); setMode("edit"); }}
                        className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--accent-pink)]">
                        继续
                      </button>
                      <button onClick={() => { deleteNurtureLog(log.id); setLogs(getAllNurtureLogs()); }}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== 新建模式（含种马因子） ==========
  if (mode === "new") {
    const [selCard, setSelCard] = useState("");
    const [selStar, setSelStar] = useState(3);
    const [selScenario, setSelScenario] = useState("ura");
    const [p1, setP1] = useState<ParentFactor>(emptyFactor());
    const [p2, setP2] = useState<ParentFactor>(emptyFactor());

    // 计算预期开局
    const selectedUma = allStats.find(u => u.cardId === selCard);
    const nakedStats = selectedUma ? getStarStats(selectedUma, selStar) : null;
    const expectedStats = nakedStats ? calculateExpectedStart(nakedStats, p1, p2) : null;
    const p1Total = Object.values(p1).reduce((a, b) => a + b, 0);
    const p2Total = Object.values(p2).reduce((a, b) => a + b, 0);

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4">新建训练记录</h1>

          {/* 选择马娘 */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">选择马娘</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2">
              {umaList.map(uma => {
                const hasData = allStats.some(u => u.cardId === uma.cardId);
                return (
                  <button key={uma.cardId}
                    onClick={() => setSelCard(uma.cardId)}
                    className={`rounded-lg p-2 text-center text-xs transition-all ${
                      selCard === uma.cardId
                        ? "border border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                        : hasData
                        ? "border border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        : "border border-transparent text-red-400/50"
                    }`}>
                    {uma.nameCN}
                    {!hasData && <span className="block text-[8px] text-red-400">缺数据</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 星级 */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">当前星级</label>
            <div className="flex gap-2">
              {[3, 4, 5].map(s => (
                <button key={s} onClick={() => setSelStar(s)}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    selStar === s ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                  }`}>
                  {s}星
                </button>
              ))}
            </div>
          </div>

          {/* 剧本 */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">剧本</label>
            <select value={selScenario} onChange={e => setSelScenario(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]">
              <option value="ura">URA</option>
              <option value="aoharu">青春杯</option>
              <option value="mastery">巅峰杯</option>
              <option value="grand">Grand Live</option>
              <option value="ramen">拉面杯</option>
            </select>
          </div>

          {/* 种马因子输入 */}
          {selectedUma && (
            <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <p className="text-sm font-bold text-[var(--accent-pink)] mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />种马蓝因子（每星+{BLUE_FACTOR_PER_STAR}）
              </p>

              {/* 种马1 */}
              <div className="mb-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">种马1 (已分配{p1Total}/9星)</p>
                <FactorInput factor={p1} onChange={setP1} />
              </div>

              {/* 种马2 */}
              <div className="mb-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">种马2 (已分配{p2Total}/9星)</p>
                <FactorInput factor={p2} onChange={setP2} />
              </div>

              {/* 计算结果 */}
              {nakedStats && expectedStats && (
                <div className="mt-3 rounded-lg bg-[var(--bg-primary)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">预期开局属性（裸属性+因子）:</p>
                  <p className="text-sm text-green-400">
                    裸: 速{nakedStats.speed} 耐{nakedStats.stamina} 力{nakedStats.power} 根{nakedStats.guts} 智{nakedStats.wit}
                  </p>
                  <p className="text-sm text-[var(--accent-pink)]">
                    预期: 速{expectedStats.speed} 耐{expectedStats.stamina} 力{expectedStats.power} 根{expectedStats.guts} 智{expectedStats.wit}
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    因子加成: 速+{expectedStats.speed - nakedStats.speed} 耐+{expectedStats.stamina - nakedStats.stamina} 力+{expectedStats.power - nakedStats.power} 根+{expectedStats.guts - nakedStats.guts} 智+{expectedStats.wit - nakedStats.wit}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    ⚠️ 开局时请核对实际属性是否与预期一致，不一致则全局分析都不准
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setMode("list")} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">
              返回
            </button>
            <button onClick={() => {
              if (!selCard) { alert("请选择马娘"); return; }
              if (p1Total > 9) { alert("种马1因子超过9星"); return; }
              if (p2Total > 9) { alert("种马2因子超过9星"); return; }
              startNewLog(selCard, selStar, selScenario, p1, p2);
            }} className="rounded-lg bg-[var(--accent-pink)] px-6 py-2 text-sm font-bold text-white flex items-center gap-2">
              <Play className="h-4 w-4" />开始记录
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 编辑模式 ==========
  if (mode === "edit" && currentLog) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                {currentLog.umaName} T{currentTurn}/72
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                已记录{currentLog.turns.length}回合 | {currentLog.scenario}
              </p>
            </div>
            <button onClick={() => { saveNurtureLog(currentLog); setLogs(getAllNurtureLogs()); setMode("list"); }}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">
              暂存返回
            </button>
          </div>

          {/* 快捷录入 */}
          <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-2">T{currentTurn} 选择行动:</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => addTurn(key)}
                  className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                    key.startsWith("train-") ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    : key === "rest" ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                    : key === "outing" ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                    : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 历史 */}
          {currentLog.turns.length > 0 && (
            <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-2">已记录:</p>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {currentLog.turns.map((t, i) => (
                  <span key={i} className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-primary)]">
                    T{t.turn}:{ACTION_LABELS[t.action] || t.action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 最终结果 */}
          {currentTurn >= 72 && (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <p className="text-sm font-bold text-[var(--accent-pink)] mb-3">录入最终结果</p>
              <FinalResultForm onSave={saveFinalResult} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== 分析模式 ==========
  if (mode === "analysis") {
    const analysis = analyzeOptimalPath(logs);
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[var(--accent-pink)]" />
              最优决策分析
            </h1>
            <button onClick={() => setMode("list")}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">
              返回
            </button>
          </div>

          {analysis.totalLogsAnalyzed === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-12 text-center">
              <AlertCircle className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">数据不足</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">请先录入完整记录</p>
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-pink)]">{analysis.totalLogsAnalyzed}</p>
                  <p className="text-xs text-[var(--text-muted)]">记录数</p>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-pink)]">{Math.round(analysis.avgEvaluation)}</p>
                  <p className="text-xs text-[var(--text-muted)]">均分</p>
                </div>
                {analysis.bestLog && (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{analysis.bestLog.finalEvaluation}</p>
                    <p className="text-xs text-[var(--text-muted)]">最高 ({analysis.bestLog.umaName})</p>
                  </div>
                )}
              </div>

              <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />关键发现
                </h3>
                {analysis.keyInsights.map((insight, i) => (
                  <p key={i} className="text-xs text-[var(--text-primary)] py-1">{insight}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ========== 属性库管理 ==========
  if (mode === "uma-db") {
    return <UmaDatabasePage allStats={allStats} setAllStats={setAllStats} onBack={() => setMode("list")} />;
  }

  return null;
}

// ========== 种马因子输入组件 ==========

function FactorInput({ factor, onChange }: { factor: ParentFactor; onChange: (f: ParentFactor) => void }) {
  const fields: { key: keyof ParentFactor; label: string; color: string }[] = [
    { key: "speed", label: "速", color: "text-red-400" },
    { key: "stamina", label: "耐", color: "text-yellow-400" },
    { key: "power", label: "力", color: "text-orange-400" },
    { key: "guts", label: "根", color: "text-purple-400" },
    { key: "wit", label: "智", color: "text-blue-400" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {fields.map(({ key, label, color }) => (
        <div key={key} className="text-center">
          <label className={`text-[10px] ${color}`}>{label}</label>
          <input
            type="number" min={0} max={9} value={factor[key]}
            onChange={e => onChange({ ...factor, [key]: Math.max(0, Math.min(9, parseInt(e.target.value) || 0)) })}
            className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]"
          />
        </div>
      ))}
    </div>
  );
}

// ========== 最终结果表单 ==========

function FinalResultForm({ onSave }: { onSave: (total: number, skill: number, rank: string, stats: StarStats) => void }) {
  const [total, setTotal] = useState("");
  const [skill, setSkill] = useState("");
  const [rank, setRank] = useState("");
  const [spd, setSpd] = useState("");
  const [stm, setStm] = useState("");
  const [pow, setPow] = useState("");
  const [gts, setGts] = useState("");
  const [wit, setWit] = useState("");

  const statEval = total && skill ? parseInt(total) - parseInt(skill) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-muted)]">总评分</label>
          <input type="number" value={total} onChange={e => setTotal(e.target.value)}
            className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)]">技能分</label>
          <input type="number" value={skill} onChange={e => setSkill(e.target.value)}
            className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]" />
        </div>
      </div>
      {statEval > 0 && <p className="text-sm text-green-400">纯属性分: {statEval}</p>}
      <div>
        <label className="text-xs text-[var(--text-muted)]">评级</label>
        <input type="text" value={rank} onChange={e => setRank(e.target.value)}
          placeholder="UG/UF/UE..."
          className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]" />
      </div>
      <p className="text-xs text-[var(--text-muted)]">最终五维:</p>
      <div className="grid grid-cols-5 gap-2">
        {[
          ["速", spd, setSpd], ["耐", stm, setStm], ["力", pow, setPow],
          ["根", gts, setGts], ["智", wit, setWit]
        ].map(([label, val, setter]) => (
          <div key={label as string}>
            <label className="text-[10px] text-[var(--text-muted)]">{label}</label>
            <input type="number" value={val} onChange={e => (setter as Function)(e.target.value)}
              className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
          </div>
        ))}
      </div>
      <button onClick={() => {
        if (!total || !skill) { alert("填写总评分和技能分"); return; }
        onSave(parseInt(total), parseInt(skill), rank, {
          speed: parseInt(spd) || 0, stamina: parseInt(stm) || 0,
          power: parseInt(pow) || 0, guts: parseInt(gts) || 0, wit: parseInt(wit) || 0
        });
      }} className="w-full rounded-lg bg-[var(--accent-pink)] py-2 text-sm font-bold text-white flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />保存
      </button>
    </div>
  );
}

// ========== 属性库管理页面 ==========

function UmaDatabasePage({ allStats, setAllStats, onBack }: {
  allStats: UmaBaseStats[];
  setAllStats: (s: UmaBaseStats[]) => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState<UmaBaseStats | null>(null);

  const saveUma = (uma: UmaBaseStats) => {
    saveUmaBaseStats(uma);
    setAllStats(getAllBaseStats());
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Database className="h-6 w-6 text-[var(--accent-pink)]" />
            马娘属性库 ({allStats.length}个)
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing({
              cardId: `NEW_${Date.now()}`, nameCN: "", nameJP: "",
              star3: { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 },
              distance: "中", strategy: "先"
            })} className="rounded-lg bg-[var(--accent-pink)] px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />新增
            </button>
            <button onClick={onBack}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">
              返回
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="space-y-2">
          {allStats.map(uma => (
            <div key={uma.cardId} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{uma.nameCN} ({uma.nameJP})</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    3星: 速{uma.star3.speed} 耐{uma.star3.stamina} 力{uma.star3.power} 根{uma.star3.guts} 智{uma.star3.wit}
                    {uma.star4 && ` | 4星: 速${uma.star4.speed}...`}
                    {uma.star5 && ` | 5星: 速${uma.star5.speed}...`}
                    {!uma.star4 && <span className="text-red-400"> | 缺4星</span>}
                    {!uma.star5 && <span className="text-red-400"> | 缺5星</span>}
                  </p>
                </div>
                <button onClick={() => setEditing(uma)}
                  className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--accent-pink)] flex items-center gap-1">
                  <Edit3 className="h-3 w-3" />编辑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 编辑弹窗 */}
        {editing && (
          <UmaEditModal uma={editing} onSave={saveUma} onClose={() => setEditing(null)} />
        )}
      </div>
    </div>
  );
}

// ========== 编辑弹窗 ==========

function UmaEditModal({ uma, onSave, onClose }: {
  uma: UmaBaseStats; onSave: (u: UmaBaseStats) => void; onClose: () => void;
}) {
  const [data, setData] = useState<UmaBaseStats>({ ...uma });

  const updateStar = (star: keyof UmaBaseStats, field: keyof StarStats, val: number) => {
    const current = (data[star] as StarStats) || { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 };
    setData({ ...data, [star]: { ...current, [field]: val } });
  };

  const StarEdit = ({ label, starKey }: { label: string; starKey: keyof UmaBaseStats }) => {
    const stats = data[starKey] as StarStats | undefined;
    if (!stats && starKey !== "star3") {
      return (
        <div className="mb-2">
          <button onClick={() => setData({ ...data, [starKey]: { speed: 0, stamina: 0, power: 0, guts: 0, wit: 0 } })}
            className="text-xs text-red-400 underline">
            + 添加{label}数据
          </button>
        </div>
      );
    }
    if (!stats) return null;
    return (
      <div className="mb-3">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-1">{label}</p>
        <div className="grid grid-cols-5 gap-2">
          {(["speed", "stamina", "power", "guts", "wit"] as const).map(f => (
            <div key={f}>
              <label className="text-[10px] text-[var(--text-muted)]">{f.slice(0,2)}</label>
              <input type="number" value={stats[f]}
                onChange={e => updateStar(starKey, f, parseInt(e.target.value) || 0)}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-[var(--bg-secondary)] p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          {uma.cardId.startsWith("NEW") ? "新增马娘" : `编辑 ${uma.nameCN}`}
        </h2>

        <div className="mb-3">
          <label className="text-xs text-[var(--text-muted)]">中文名</label>
          <input value={data.nameCN} onChange={e => setData({ ...data, nameCN: e.target.value })}
            className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]" />
        </div>
        <div className="mb-3">
          <label className="text-xs text-[var(--text-muted)]">日文名</label>
          <input value={data.nameJP} onChange={e => setData({ ...data, nameJP: e.target.value })}
            className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]" />
        </div>

        <StarEdit label="3星（必须）" starKey="star3" />
        <StarEdit label="4星" starKey="star4" />
        <StarEdit label="5星" starKey="star5" />

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)]">距离适性</label>
            <select value={data.distance} onChange={e => setData({ ...data, distance: e.target.value })}
              className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]">
              <option value="短">短距离</option>
              <option value="英里">英里</option>
              <option value="中">中距离</option>
              <option value="长">长距离</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)]">跑法</label>
            <select value={data.strategy} onChange={e => setData({ ...data, strategy: e.target.value })}
              className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-sm text-[var(--text-primary)]">
              <option value="逃">逃</option>
              <option value="先">先</option>
              <option value="差">差</option>
              <option value="追">追</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">
            取消
          </button>
          <button onClick={() => {
            if (!data.nameCN) { alert("请填写中文名"); return; }
            onSave(data);
          }} className="rounded-lg bg-[var(--accent-pink)] px-6 py-2 text-sm font-bold text-white">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
