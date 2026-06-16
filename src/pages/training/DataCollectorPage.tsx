/**
 * 训练数据收集页面
 * 
 * 用于收集每回合的五维数值，积累训练样本
 * 
 * 核心设计：
 * - 只保存数字文本（不存图片），72回合 ≈ 15KB
 * - 快捷输入：从上一回合复制+快捷+/-按钮
 * - 支持截图OCR（提取后立即删图）
 * - 批量导出CSV/JSON用于AI训练
 */

import { useState, useEffect } from "react";
import { umaList } from "@/data/umaList";
import {
  createSession, saveSession, getAllSessions, deleteSession,
  addTurnRecord, parseStatsFromOCR,
  exportForAITraining, exportToCSV, estimateStorageSize,
  type CollectionSession, type FiveStats,
} from "@/utils/dataCollector";
import {
  Database, Plus, Trash2, Camera, Save, Download, ChevronRight,
  ArrowUp, ArrowDown, Copy, TrendingUp
} from "lucide-react";

const ACTION_LIST = [
  { key: "train-speed", label: "速训", color: "text-red-400", border: "border-red-500/30", bg: "hover:bg-red-500/10" },
  { key: "train-stamina", label: "耐训", color: "text-yellow-400", border: "border-yellow-500/30", bg: "hover:bg-yellow-500/10" },
  { key: "train-power", label: "力训", color: "text-orange-400", border: "border-orange-500/30", bg: "hover:bg-orange-500/10" },
  { key: "train-guts", label: "根训", color: "text-purple-400", border: "border-purple-500/30", bg: "hover:bg-purple-500/10" },
  { key: "train-wit", label: "智训", color: "text-blue-400", border: "border-blue-500/30", bg: "hover:bg-blue-500/10" },
  { key: "rest", label: "休息", color: "text-green-400", border: "border-green-500/30", bg: "hover:bg-green-500/10" },
  { key: "outing", label: "外出", color: "text-pink-400", border: "border-pink-500/30", bg: "hover:bg-pink-500/10" },
  { key: "race", label: "比赛", color: "text-yellow-400", border: "border-yellow-500/30", bg: "hover:bg-yellow-500/10" },
  { key: "clinic", label: "保健", color: "text-red-400", border: "border-red-500/30", bg: "hover:bg-red-500/10" },
  { key: "skill", label: "技能", color: "text-cyan-400", border: "border-cyan-500/30", bg: "hover:bg-cyan-500/10" },
];

export default function DataCollectorPage() {
  const [mode, setMode] = useState<"list" | "new" | "collect">("list");
  const [sessions, setSessions] = useState<CollectionSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollectionSession | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [storageInfo, setStorageInfo] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSessions(getAllSessions());
    setStorageInfo(estimateStorageSize());
  };

  // ========== 新建收集会话 ==========
  const startCollection = (cardId: string, star: number, scenario: string) => {
    const uma = umaList.find(u => u.cardId === cardId);
    if (!uma) return;
    const session = createSession(cardId, uma.nameCN, star, scenario, "", "", []);
    saveSession(session);
    setCurrentSession(session);
    setCurrentTurn(1);
    setMode("collect");
  };

  // ========== 添加快捷记录 ==========
  const quickRecord = (action: string, stats: FiveStats, vital: number, motivation: number, skillPt: number, isFat: boolean) => {
    if (!currentSession) return;
    addTurnRecord(currentSession, currentTurn, action, stats, vital, motivation, skillPt, isFat);
    // 重新加载（因为addTurnRecord内部已保存）
    const updated = getAllSessions().find(s => s.id === currentSession.id);
    if (updated) setCurrentSession(updated);
    setCurrentTurn(p => Math.min(72, p + 1));
  };

  // ========== 列表模式 ==========
  if (mode === "list") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Database className="h-6 w-6 text-[var(--accent-pink)]" />
                数据收集器
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                收集每回合数据 → 积累样本 → 训练AI | 存储: {storageInfo}
              </p>
            </div>
            <button onClick={() => setMode("new")}
              className="rounded-lg bg-[var(--accent-pink)] px-4 py-2 text-sm font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />新建收集
            </button>
          </div>

          {/* 功能说明 */}
          <div className="mb-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3">
            <p className="text-xs text-[var(--text-muted)]">
              只保存数字文本，不存图片。72回合 ≈ 15KB。截图OCR后图片立即释放。
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-12 text-center">
              <p className="text-[var(--text-muted)]">暂无收集会话</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{s.umaName} ({s.star}星)</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {s.scenario} | {s.turns.length}/72回合 | {s.isComplete ? "已完成" : "收集中"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!s.isComplete && (
                        <button onClick={() => {
                          setCurrentSession(s);
                          setCurrentTurn(s.turns.length > 0 ? s.turns[s.turns.length - 1].turn + 1 : 1);
                          setMode("collect");
                        }} className="rounded-lg border border-[var(--accent-pink)] px-3 py-1 text-xs text-[var(--accent-pink)]">
                          继续
                        </button>
                      )}
                      <button onClick={() => {
                        const csv = exportToCSV([s]);
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `${s.umaName}_${s.scenario}.csv`; a.click();
                      }} className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Download className="h-3 w-3" />CSV
                      </button>
                      <button onClick={() => { deleteSession(s.id); refreshData(); }}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* 批量导出 */}
              {sessions.length >= 2 && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => {
                    const json = exportForAITraining(sessions);
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `uma_ai_training_${Date.now()}.json`; a.click();
                  }} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Download className="h-3 w-3" />导出全部(JSON)
                  </button>
                  <button onClick={() => {
                    const csv = exportToCSV(sessions);
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `uma_data_${Date.now()}.csv`; a.click();
                  }} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Download className="h-3 w-3" />导出全部(CSV)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== 新建模式 ==========
  if (mode === "new") {
    const [selCard, setSelCard] = useState("");
    const [selStar, setSelStar] = useState(3);
    const [selScenario, setSelScenario] = useState("ura");

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4">新建数据收集</h1>

          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">马娘</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2">
              {umaList.map(uma => (
                <button key={uma.cardId}
                  onClick={() => setSelCard(uma.cardId)}
                  className={`rounded-lg p-2 text-center text-xs ${selCard === uma.cardId ? "border border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]" : "text-[var(--text-muted)]"}`}>
                  {uma.nameCN}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-[var(--text-muted)] mb-2 block">星级</label>
            <div className="flex gap-2">
              {[3, 4, 5].map(s => (
                <button key={s} onClick={() => setSelStar(s)}
                  className={`rounded-lg border px-4 py-2 text-sm ${selStar === s ? "border-yellow-400 text-yellow-400" : "border-[var(--border-subtle)] text-[var(--text-muted)]"}`}>
                  {s}星
                </button>
              ))}
            </div>
          </div>

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

          <div className="flex gap-2">
            <button onClick={() => setMode("list")} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)]">返回</button>
            <button onClick={() => { if (!selCard) { alert("选马娘"); return; } startCollection(selCard, selStar, selScenario); }}
              className="rounded-lg bg-[var(--accent-pink)] px-6 py-2 text-sm font-bold text-white">开始</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 收集模式 ==========
  if (mode === "collect" && currentSession) {
    return <CollectorInterface
      session={currentSession}
      currentTurn={currentTurn}
      setCurrentTurn={setCurrentTurn}
      onQuickRecord={quickRecord}
      onBack={() => { refreshData(); setMode("list"); }}
    />;
  }

  return null;
}

// ========== 快捷收集界面 ==========

function CollectorInterface({
  session, currentTurn, setCurrentTurn, onQuickRecord, onBack
}: {
  session: CollectionSession;
  currentTurn: number;
  setCurrentTurn: (t: number) => void;
  onQuickRecord: (action: string, stats: FiveStats, vital: number, motivation: number, skillPt: number, isFat: boolean) => void;
  onBack: () => void;
}) {
  // 从上一回合复制初始值
  const prevTurn = session.turns.find(t => t.turn === currentTurn - 1);
  const currentRecord = session.turns.find(t => t.turn === currentTurn);

  const [speed, setSpeed] = useState(currentRecord?.stats.speed ?? prevTurn?.stats.speed ?? 0);
  const [stamina, setStamina] = useState(currentRecord?.stats.stamina ?? prevTurn?.stats.stamina ?? 0);
  const [power, setPower] = useState(currentRecord?.stats.power ?? prevTurn?.stats.power ?? 0);
  const [guts, setGuts] = useState(currentRecord?.stats.guts ?? prevTurn?.stats.guts ?? 0);
  const [wit, setWit] = useState(currentRecord?.stats.wit ?? prevTurn?.stats.wit ?? 0);
  const [vital, setVital] = useState(currentRecord?.vital ?? prevTurn?.vital ?? 100);
  const [motivation, setMotivation] = useState(currentRecord?.motivation ?? prevTurn?.motivation ?? 3);
  const [skillPt, setSkillPt] = useState(currentRecord?.skillPt ?? prevTurn?.skillPt ?? 0);
  const [isFat, setIsFat] = useState(currentRecord?.isFat ?? false);
  const [selectedAction, setSelectedAction] = useState("");

  // 当回合切换时更新值
  useEffect(() => {
    const rec = session.turns.find(t => t.turn === currentTurn);
    if (rec) {
      setSpeed(rec.stats.speed); setStamina(rec.stats.stamina); setPower(rec.stats.power);
      setGuts(rec.stats.guts); setWit(rec.stats.wit); setVital(rec.vital);
      setMotivation(rec.motivation); setSkillPt(rec.skillPt); setIsFat(rec.isFat);
    } else {
      const prev = session.turns.find(t => t.turn === currentTurn - 1);
      if (prev) {
        setSpeed(prev.stats.speed); setStamina(prev.stats.stamina); setPower(prev.stats.power);
        setGuts(prev.stats.guts); setWit(prev.stats.wit); setVital(prev.vital);
        setMotivation(prev.motivation); setSkillPt(prev.skillPt); setIsFat(prev.isFat);
      }
    }
  }, [currentTurn, session.turns]);

  const stats: FiveStats = { speed, stamina, power, guts, wit };

  const handleSave = () => {
    if (!selectedAction) { alert("选行动"); return; }
    onQuickRecord(selectedAction, stats, vital, motivation, skillPt, isFat);
    setSelectedAction("");
  };

  // 从截图OCR获取（模拟）
  const handleOCR = () => {
    // 实际使用时会调用截图+OCR
    // 这里模拟：弹出输入框让用户粘贴OCR文本
    const text = prompt("粘贴OCR识别结果（或手动输入五维，用空格分隔）：\n例: 850 720 680 540 420");
    if (!text) return;

    // 尝试解析空格分隔的数字
    const nums = text.match(/\d+/g)?.map(n => parseInt(n)).filter(n => n > 10);
    if (nums && nums.length >= 5) {
      setSpeed(nums[0]); setStamina(nums[1]); setPower(nums[2]); setGuts(nums[3]); setWit(nums[4]);
    } else {
      // 尝试用parseStatsFromOCR
      const result = parseStatsFromOCR(text);
      if (result.stats) {
        setSpeed(result.stats.speed); setStamina(result.stats.stamina);
        setPower(result.stats.power); setGuts(result.stats.guts); setWit(result.stats.wit);
        if (result.vital > 0) setVital(result.vital);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="mx-auto max-w-lg">
        {/* 头部 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              {session.umaName} T{currentTurn}/72
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              已记录{session.turns.length}回合 | {session.scenario}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleOCR}
              className="rounded-lg border border-cyan-500/30 px-3 py-1 text-xs text-cyan-400 flex items-center gap-1">
              <Camera className="h-3 w-3" />OCR
            </button>
            <button onClick={onBack}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">
              返回
            </button>
          </div>
        </div>

        {/* 五维输入 */}
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">五维数值</p>
            {prevTurn && (
              <button onClick={() => {
                setSpeed(prevTurn.stats.speed); setStamina(prevTurn.stats.stamina);
                setPower(prevTurn.stats.power); setGuts(prevTurn.stats.guts); setWit(prevTurn.stats.wit);
              }} className="text-[10px] text-[var(--accent-pink)] flex items-center gap-1">
                <Copy className="h-3 w-3" />复制上回合
              </button>
            )}
          </div>

          <div className="space-y-2">
            {[
              { label: "速度", value: speed, setter: setSpeed, color: "text-red-400", short: "速" },
              { label: "耐力", value: stamina, setter: setStamina, color: "text-yellow-400", short: "耐" },
              { label: "力量", value: power, setter: setPower, color: "text-orange-400", short: "力" },
              { label: "根性", value: guts, setter: setGuts, color: "text-purple-400", short: "根" },
              { label: "智力", value: wit, setter: setWit, color: "text-blue-400", short: "智" },
            ].map(({ label, value, setter, color, short }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-8 text-xs ${color} font-medium`}>{short}</span>
                <button onClick={() => setter(Math.max(0, value - 5))}
                  className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-muted)]">-5</button>
                <button onClick={() => setter(Math.max(0, value - 1))}
                  className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-muted)]">-1</button>
                <input type="number" value={value}
                  onChange={e => setter(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
                <button onClick={() => setter(value + 1)}
                  className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-muted)]">+1</button>
                <button onClick={() => setter(value + 5)}
                  className="rounded bg-[var(--bg-primary)] px-2 py-1 text-[10px] text-[var(--text-muted)]">+5</button>
                {prevTurn && (
                  <span className="text-[10px] text-[var(--text-muted)] w-10">
                    {value > (prevTurn.stats as any)[short === "速" ? "speed" : short === "耐" ? "stamina" : short === "力" ? "power" : short === "根" ? "guts" : "wit"] ? "↑" : "="}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 体力和心情 */}
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)]">体力</label>
              <input type="number" value={vital} min={0} max={100}
                onChange={e => setVital(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 text-center text-sm text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)]">心情</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setMotivation(m)}
                    className={`flex-1 rounded py-2 text-xs ${motivation === m ? "bg-[var(--accent-pink)] text-white" : "bg-[var(--bg-primary)] text-[var(--text-muted)]"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)]">技能点</label>
              <input type="number" value={skillPt}
                onChange={e => setSkillPt(parseInt(e.target.value) || 0)}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={isFat} onChange={e => setIsFat(e.target.checked)}
                className="rounded border-[var(--border-subtle)]" />
              <span className="text-sm text-orange-400">吃胖</span>
            </label>
          </div>
        </div>

        {/* 行动选择 */}
        <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm font-bold text-[var(--text-primary)] mb-2">行动</p>
          <div className="grid grid-cols-5 gap-2">
            {ACTION_LIST.map(({ key, label, color, border, bg }) => (
              <button key={key}
                onClick={() => setSelectedAction(key)}
                className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                  selectedAction === key
                    ? `${border} ${color} ${bg} bg-opacity-20 ring-1 ring-current`
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 保存 */}
        <button onClick={handleSave}
          disabled={!selectedAction}
          className={`w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 ${
            selectedAction ? "bg-[var(--accent-pink)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
          }`}>
          <Save className="h-4 w-4" />
          保存 T{currentTurn} ({ACTION_LIST.find(a => a.key === selectedAction)?.label || "选行动"})
        </button>

        {/* 快捷跳转 */}
        <div className="mt-4 flex items-center gap-2 justify-center">
          <button onClick={() => setCurrentTurn(Math.max(1, currentTurn - 1))}
            className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">←上回合</button>
          <input type="number" min={1} max={72} value={currentTurn}
            onChange={e => setCurrentTurn(Math.max(1, Math.min(72, parseInt(e.target.value) || 1)))}
            className="w-16 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-center text-sm text-[var(--text-primary)]" />
          <button onClick={() => setCurrentTurn(Math.min(72, currentTurn + 1))}
            className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">下回合→</button>
        </div>

        {/* 收集进度 */}
        <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-muted)]">收集进度</span>
            <span className="text-xs text-[var(--accent-pink)]">{session.turns.length}/72</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-primary)]">
            <div className="h-full rounded-full bg-[var(--accent-pink)] transition-all"
              style={{ width: `${(session.turns.length / 72) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
