/**
 * 训练数据录入页面
 * 
 * 功能：
 * 1. 录入每回合训练决策
 * 2. 开局属性校准（对比数据库）
 * 3. 最终结果录入
 * 4. 历史记录查看
 * 5. 最优分析
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { umaList } from "@/data/umaList";
import { umaBaseStats, getStarStats } from "@/data/umaBaseStats";
import {
  createNurtureLog, saveNurtureLog, getAllNurtureLogs,
  addTurnRecord, setFinalResult, deleteNurtureLog,
  exportLogsToJSON, importLogsFromJSON,
  type NurtureLog, type TurnRecord, type FiveStats
} from "@/data/trainingLog";
import {
  extractStatEvaluation, calibrateBaseStats, analyzeOptimalPath
} from "@/utils/scoreCalculator";
import {
  BookOpen, Plus, Trash2, Save, Play, ChevronRight,
  TrendingUp, Target, AlertCircle, CheckCircle, Upload, Download
} from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  "train-speed": "速度训练", "train-stamina": "耐力训练",
  "train-power": "力量训练", "train-guts": "根性训练",
  "train-wit": "智力训练", "rest": "休息",
  "outing": "外出", "race": "比赛", "clinic": "保健室",
  "skill": "学技能", "ramen": "吃拉面"
};

export default function TrainingLogPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"list" | "new" | "edit" | "analysis">("list");
  const [logs, setLogs] = useState<NurtureLog[]>([]);
  const [currentLog, setCurrentLog] = useState<NurtureLog | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);

  useEffect(() => { setLogs(getAllNurtureLogs()); }, []);

  // ========== 新建记录 ==========
  const startNewLog = (cardId: string, star: 3 | 4 | 5, scenario: string) => {
    const uma = umaList.find(u => u.cardId === cardId);
    if (!uma) return;
    const log = createNurtureLog(cardId, uma.nameCN, star, scenario, uma as any, []);
    setCurrentLog(log);
    setCurrentTurn(1);
    setMode("edit");
  };

  // ========== 校准开局 ==========
  const calibrateStart = (stats: FiveStats) => {
    if (!currentLog) return;
    const result = calibrateBaseStats(currentLog.umaCardId, currentLog.star, stats);
    alert(result.message);
    if (result.calibrated && result.diff) {
      setCurrentLog({ ...currentLog, baseStats: stats });
    }
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

  // ========== 录入最终结果 ==========
  const saveFinalResult = (totalEval: number, skillEval: number, rank: string, finalStats: FiveStats) => {
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
                记录每回合决策，分析最优策略
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("analysis")}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent-pink)] flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />最优分析
              </button>
              <button onClick={() => setMode("new")}
                className="rounded-lg bg-[var(--accent-pink)] px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />新建记录
              </button>
            </div>
          </div>

          {/* 导入导出 */}
          <div className="mb-4 flex gap-2">
            <button onClick={() => {
              const json = exportLogsToJSON();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `uma_training_logs_${Date.now()}.json`; a.click();
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
                      setLogs(getAllNurtureLogs());
                      alert("导入成功！");
                    } else alert("导入失败，JSON格式错误");
                  };
                  reader.readAsText(file);
                }
              }} />
            </label>
          </div>

          {/* 记录列表 */}
          {logs.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-12 text-center">
              <Target className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">暂无训练记录</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                点击"新建记录"开始录入训练数据
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{log.umaName} ({log.star}星)</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {log.turns.length}回合 | 评分{log.finalEvaluation || "未完成"} | {log.rank || "未完成"}
                      </p>
                      {log.statEvaluation > 0 && (
                        <p className="text-xs text-green-400">
                          纯属性分: {log.statEvaluation} (总{log.finalEvaluation} - 技能{log.skillEvaluation})
                        </p>
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

  // ========== 新建模式 ==========
  if (mode === "new") {
    const [selCard, setSelCard] = useState("");
    const [selStar, setSelStar] = useState<3 | 4 | 5>(3);
    const [selScenario, setSelScenario] = useState("ura");

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4">新建训练记录</h1>

          {/* 选择马娘 */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">选择马娘</label>
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2">
              {umaList.map(uma => (
                <button key={uma.cardId}
                  onClick={() => setSelCard(uma.cardId)}
                  className={`rounded-lg p-2 text-center text-xs transition-all ${
                    selCard === uma.cardId
                      ? "border border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
                      : "border border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}>
                  {uma.nameCN}
                </button>
              ))}
            </div>
          </div>

          {/* 星级 */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">当前星级</label>
            <div className="flex gap-2">
              {[3, 4, 5].map(s => (
                <button key={s} onClick={() => setSelStar(s as 3|4|5)}
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

          {/* 数据库对比 */}
          {selCard && (() => {
            const base = umaBaseStats.find(u => u.cardId === selCard);
            if (!base) return <p className="text-xs text-red-400">数据库中暂无该马娘开局属性</p>;
            const stats = getStarStats(selCard, selStar);
            return (
              <div className="mb-4 rounded-lg bg-[var(--bg-secondary)] p-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">数据库开局属性（{selStar}星）:</p>
                <p className="text-sm text-[var(--accent-pink)]">
                  速{stats?.speed} 耐{stats?.stamina} 力{stats?.power} 根{stats?.guts} 智{stats?.wit}
                </p>
                <p className="text-xs text-green-400 mt-1">开局时请核对，偏差大则全局分析都不准</p>
              </div>
            );
          })()}

          <div className="flex gap-2">
            <button onClick={() => setMode("list")} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">
              返回
            </button>
            <button onClick={() => {
              if (!selCard) { alert("请选择马娘"); return; }
              startNewLog(selCard, selStar, selScenario);
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
          {/* 头部 */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                {currentLog.umaName} T{currentTurn}/72
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                已记录{currentLog.turns.length}回合 | {currentLog.scenario}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { saveNurtureLog(currentLog); setLogs(getAllNurtureLogs()); setMode("list"); }}
                className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">
                暂存
              </button>
            </div>
          </div>

          {/* 快速录入 - 当前回合 */}
          <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-2">T{currentTurn} 选择行动:</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => addTurn(key)}
                  className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                    key.startsWith("train-")
                      ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      : key === "rest"
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      : key === "outing"
                      ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                      : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 快捷跳转 */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">跳转:</span>
            <input type="number" min={1} max={72} value={currentTurn}
              onChange={e => setCurrentTurn(Math.max(1, Math.min(72, parseInt(e.target.value) || 1)))}
              className="w-16 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
          </div>

          {/* 历史回合 */}
          {currentLog.turns.length > 0 && (
            <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-2">已记录回合:</p>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {currentLog.turns.map((t, i) => (
                  <span key={i} className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-primary)]">
                    T{t.turn}: {ACTION_LABELS[t.action] || t.action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 录入最终结果 */}
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
              <p className="text-[var(--text-muted)]">没有足够的数据进行分析</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">请先录入至少一条完整的训练记录</p>
            </div>
          ) : (
            <>
              {/* 统计 */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-pink)]">{analysis.totalLogsAnalyzed}</p>
                  <p className="text-xs text-[var(--text-muted)]">分析记录数</p>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-pink)]">{Math.round(analysis.avgEvaluation)}</p>
                  <p className="text-xs text-[var(--text-muted)]">平均评分</p>
                </div>
                {analysis.bestLog && (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{analysis.bestLog.finalEvaluation}</p>
                    <p className="text-xs text-[var(--text-muted)]">最高分 ({analysis.bestLog.umaName})</p>
                  </div>
                )}
              </div>

              {/* 关键洞察 */}
              <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />关键发现
                </h3>
                {analysis.keyInsights.map((insight, i) => (
                  <p key={i} className="text-xs text-[var(--text-primary)] py-1">{insight}</p>
                ))}
              </div>

              {/* 回合推荐 */}
              {analysis.turnRecommendations.length > 0 && (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">回合推荐 (前10条)</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {analysis.turnRecommendations.slice(0, 10).map(rec => (
                      <div key={rec.turn} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-[var(--text-muted)]">T{rec.turn}</span>
                        <span className="text-[var(--accent-pink)] font-medium">
                          {ACTION_LABELS[rec.action] || rec.action}
                        </span>
                        <span className="text-[var(--text-muted)]">均分{Math.round(rec.avgScore)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ========== 子组件 ==========

function FinalResultForm({ onSave }: { onSave: (total: number, skill: number, rank: string, stats: FiveStats) => void }) {
  const [total, setTotal] = useState("");
  const [skill, setSkill] = useState("");
  const [rank, setRank] = "";
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

      {statEval > 0 && (
        <p className="text-sm text-green-400">
          纯属性分: {statEval} (总{total} - 技能{skill})
        </p>
      )}

      <div>
        <label className="text-xs text-[var(--text-muted)]">评级 (UG/UF/UE等)</label>
        <input type="text" value={rank} onChange={e => setRank(e.target.value)}
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
        if (!total || !skill) { alert("请填写总评分和技能分"); return; }
        onSave(parseInt(total), parseInt(skill), rank, {
          speed: parseInt(spd) || 0, stamina: parseInt(stm) || 0,
          power: parseInt(pow) || 0, guts: parseInt(gts) || 0, wit: parseInt(wit) || 0
        });
      }} className="w-full rounded-lg bg-[var(--accent-pink)] py-2 text-sm font-bold text-white flex items-center justify-center gap-2">
        <Save className="h-4 w-4" />保存并完成
      </button>
    </div>
  );
}
