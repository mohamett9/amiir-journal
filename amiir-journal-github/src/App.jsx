import { useState, useEffect, useMemo } from "react";
import {
  Plus, TrendingUp, TrendingDown, Trash2, X, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Image as ImageIcon, LayoutGrid, ListChecks,
  Pencil, CheckSquare, Square,
} from "lucide-react";

const C = {
  bg: "#0B0F14",
  surface: "#0E141A",
  surface2: "#131A22",
  border: "#22292F",
  borderHover: "#3D434B",
  text: "#E7E2D6",
  textDim: "#8A8F98",
  textFaint: "#565C64",
  textFaint2: "#3D434B",
  gold: "#E8B44C",
  goldHover: "#F0C366",
  green: "#4FAE83",
  greenBright: "#8FE3C0",
  greenBg: "#1E5A41",
  red: "#D65F5F",
  redBright: "#F2A6A6",
  redBg: "#5C2323",
  notesText: "#B8BCC4",
};

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };
const labelStyle = { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textFaint, display: "block", marginBottom: "4px" };
const inputStyle = { ...mono, backgroundColor: C.surface2, border: `1px solid ${C.border}`, color: C.text };

const EMPTY_FORM = {
  symbol: "", date: new Date().toISOString().slice(0, 10), session: "london",
  purgeTime: "2am", direction: "buy", outcome: "win", risk: "1", rrRatio: "2",
  notes: "", image: null, imageUrl: "", model: "",
};

const SESSIONS = [
  { id: "asian", label: "Asian", flag: "🇯🇵", time: "8PM–9PM" },
  { id: "london", label: "London", flag: "🇬🇧", time: "2AM–3AM" },
  { id: "newyork", label: "New York", flag: "🇺🇸", time: "8AM–9AM" },
  { id: "others", label: "Others", flag: "🌐", time: "6AM–10AM" },
];
const PURGE_TIMES = { asian: ["8pm", "9pm"], london: ["2am", "3am"], newyork: ["8am", "9am"], others: ["6am", "10am"] };

const MODELS = {
  crt: { name: "CRT", items: [
    { id: "irl_erl", label: "IRL TO ERL" },
    { id: "purging", label: "PURGING", hasSession: true },
    { id: "smt", label: "SMT" },
    { id: "m1", label: "M1" },
  ]},
  mmxm: { name: "MMXM", items: [
    { id: "orderflow", label: "ORDERFLOW" },
    { id: "keylevel", label: "KEY LEVEL" },
    { id: "midnight", label: "MIDNIGHT" },
    { id: "breaker", label: "BREAKER / INVERSION" },
  ]},
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function resizeImage(dataUrl, maxWidth = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (err) { reject(err); }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function Toggle({ active, onClick, children, activeBg = C.gold, activeColor = C.bg }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-xs uppercase py-2 rounded border transition-colors"
      style={{ ...mono, backgroundColor: active ? activeBg : "transparent", color: active ? activeColor : C.textDim, borderColor: active ? activeBg : C.border }}
    >
      {children}
    </button>
  );
}

// ---------------- MAIN APP ----------------
export default function TradeJournal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("journal");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [lightbox, setLightbox] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [checked, setChecked] = useState({});
  const [clSession, setClSession] = useState("london");
  const [clPurgeTime, setClPurgeTime] = useState("2am");
  const [imgMode, setImgMode] = useState("file");

  useEffect(() => {
    try {
      const t = localStorage.getItem("amiir_trades");
      if (t) setTrades(JSON.parse(t));
    } catch (e) { /* no trades yet */ }
    setLoading(false);
  }, []);

  const persist = (next) => {
    setTrades(next);
    try {
      localStorage.setItem("amiir_trades", JSON.stringify(next));
    } catch (e) {
      setError("Ma kaydin karin xogta. Isku day mar kale — sawirku wuu weyn yahay laga yaabee.");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resized = await resizeImage(reader.result);
        setForm((f) => ({ ...f, image: resized, imageUrl: "" }));
      } catch (err) {
        setForm((f) => ({ ...f, image: reader.result, imageUrl: "" }));
      }
    };
    reader.onerror = () => setError("Sawirka lama akhrin karin, isku day mid kale.");
    reader.readAsDataURL(file);
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); setError(""); };

  const startEdit = (t) => {
    setForm({
      symbol: t.symbol, date: t.date, session: t.session, purgeTime: t.purgeTime,
      direction: t.direction, outcome: t.outcome, risk: String(t.risk), rrRatio: String(t.rrRatio),
      notes: t.notes || "", image: t.image || null, imageUrl: "", model: t.model || "",
    });
    setEditingId(t.id);
    setShowForm(true);
    setTab("journal");
    setExpanded(null);
  };

  const saveTrade = () => {
    if (!form.symbol || !form.date) { setError("Buuxi symbol-ka iyo taariikhda."); return; }
    const risk = parseFloat(form.risk) || 0;
    const rrRatio = parseFloat(form.rrRatio) || 0;
    const reward = +(risk * rrRatio).toFixed(2);
    const rMultiple = form.outcome === "win" ? reward : form.outcome === "loss" ? -risk : 0;
    const finalImage = form.imageUrl ? form.imageUrl : form.image;
    const base = {
      symbol: form.symbol.toUpperCase(), date: form.date, session: form.session, purgeTime: form.purgeTime,
      direction: form.direction, outcome: form.outcome, risk, rrRatio, reward, rMultiple,
      notes: form.notes, image: finalImage, model: form.model,
    };
    if (editingId) {
      persist(trades.map((t) => (t.id === editingId ? { ...t, ...base } : t)));
    } else {
      persist([{ id: Date.now().toString(), ...base }, ...trades]);
    }
    resetForm();
  };

  const removeTrade = (id) => persist(trades.filter((t) => t.id !== id));

  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter((t) => t.outcome === "win").length;
    const losses = trades.filter((t) => t.outcome === "loss").length;
    const netR = trades.reduce((s, t) => s + t.rMultiple, 0);
    const winRate = total ? Math.round((wins / total) * 100) : 0;
    return { total, wins, losses, netR, winRate };
  }, [trades]);

  const fmtR = (n) => (n > 0 ? "+" : "") + n.toFixed(2) + "%";

  const dayMap = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (!map[t.date]) map[t.date] = { net: 0, count: 0 };
      map[t.date].net += t.rMultiple;
      map[t.date].count += 1;
    });
    return map;
  }, [trades]);

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, key, data: dayMap[key] });
    }
    return cells;
  }, [viewYear, viewMonth, dayMap]);

  const monthNet = useMemo(() => Object.entries(dayMap)
    .filter(([k]) => k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`))
    .reduce((s, [, v]) => s + v.net, 0), [dayMap, viewYear, viewMonth]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  };

  const toggleCheck = (itemId) => setChecked((c) => ({ ...c, [itemId]: !c[itemId] }));

  const selectModelReset = (key) => {
    setSelectedModel(key);
    setChecked({});
  };

  const goToTradeFromChecklist = () => {
    const modelName = selectedModel ? MODELS[selectedModel].name : "";
    setForm((f) => ({
      ...EMPTY_FORM,
      model: modelName,
      session: selectedModel === "crt" ? clSession : f.session,
      purgeTime: selectedModel === "crt" ? clPurgeTime : f.purgeTime,
    }));
    setEditingId(null);
    setTab("journal");
    setShowForm(true);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
        input[type=file]::file-selector-button {
          margin-right: 0.75rem; padding: 0.5rem 0.9rem; border-radius: 0.25rem; border: none;
          background: ${C.gold}; color: ${C.bg}; font-size: 0.8rem; font-weight: 500; cursor: pointer;
        }
        input[type=file]::file-selector-button:hover { background: ${C.goldHover}; }
        input[type=file] { width: 100%; font-size: 12px; color: ${C.textDim}; }
      `}</style>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ ...display, color: C.gold }}>Amiir Journal</h1>
            <p className="text-sm mt-1" style={{ color: C.textDim }}>Joornaalkaaga ganacsiga.</p>
          </div>
          <button onClick={() => { showForm ? resetForm() : (setShowForm(true), setTab("journal")); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded text-sm font-medium transition-colors"
            style={{ ...mono, backgroundColor: C.gold, color: C.bg }}>
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Jooji" : "Ganacsi cusub"}
          </button>
        </div>

        <div className="flex gap-1 mb-6 rounded p-1 w-fit" style={{ border: `1px solid ${C.border}` }}>
          {[["journal", "Diiwaanka", ListChecks], ["dashboard", "Dashboard", LayoutGrid], ["checklist", "Checklist", CheckSquare]].map(([id, lbl, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors"
              style={{ backgroundColor: tab === id ? C.gold : "transparent", color: tab === id ? C.bg : C.textDim }}>
              <Icon size={14} /> {lbl}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-px rounded mb-8 overflow-hidden" style={{ backgroundColor: C.border, border: `1px solid ${C.border}` }}>
          <div className="px-3 py-3" style={{ backgroundColor: C.surface }}><div style={labelStyle}>Wadarta</div><div className="text-lg" style={mono}>{stats.total}</div></div>
          <div className="px-3 py-3" style={{ backgroundColor: C.surface }}><div style={labelStyle}>Guusha %</div><div className="text-lg" style={mono}>{stats.winRate}%</div></div>
          <div className="px-3 py-3" style={{ backgroundColor: C.surface }}>
            <div style={labelStyle}>Win/Loss</div>
            <div className="text-lg" style={mono}><span style={{ color: C.green }}>{stats.wins}</span><span style={{ color: C.textFaint }}>/</span><span style={{ color: C.red }}>{stats.losses}</span></div>
          </div>
          <div className="px-3 py-3" style={{ backgroundColor: C.surface }}>
            <div style={labelStyle}>Net R</div>
            <div className="text-lg" style={{ ...mono, color: stats.netR >= 0 ? C.green : C.red }}>{fmtR(stats.netR)}</div>
          </div>
        </div>

        {showForm && (
          <div className="rounded p-4 mb-8" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            {error && <div className="text-xs mb-3" style={{ ...mono, color: C.red }}>{error}</div>}
            {form.model && (
              <div className="text-xs mb-3 px-2 py-1.5 rounded inline-block" style={{ ...mono, color: C.gold, border: `1px solid ${C.gold}` }}>
                Model: {form.model}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label style={labelStyle}>Symbol</label>
                <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="NQ"
                  className="w-full rounded px-2.5 py-2 text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Taariikhda</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded px-2.5 py-2 text-sm focus:outline-none" style={inputStyle} />
              </div>

              <div className="col-span-2">
                <label style={labelStyle}>Session</label>
                <div className="flex gap-1.5 flex-wrap">
                  {SESSIONS.map((s) => (
                    <button key={s.id} onClick={() => setForm({ ...form, session: s.id, purgeTime: PURGE_TIMES[s.id][0] })}
                      className="flex-1 text-xs py-2 rounded border transition-colors flex flex-col items-center justify-center gap-0.5" style={{ minWidth: 70,
                        ...mono, backgroundColor: form.session === s.id ? C.gold : "transparent", color: form.session === s.id ? C.bg : C.textDim,
                        borderColor: form.session === s.id ? C.gold : C.border }}>
                      <span className="flex items-center gap-1.5">{s.flag} {s.label}</span>
                      <span style={{ fontSize: "9px", color: form.session === s.id ? "rgba(11,15,20,0.7)" : C.textFaint }}>{s.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label style={labelStyle}>Purging Time</label>
                <div className="flex gap-1.5">
                  {PURGE_TIMES[form.session].map((pt) => (
                    <Toggle key={pt} active={form.purgeTime === pt} onClick={() => setForm({ ...form, purgeTime: pt })}>{pt}</Toggle>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Direction</label>
                <div className="flex gap-1.5">
                  {["buy", "sell"].map((d) => (
                    <Toggle key={d} active={form.direction === d} onClick={() => setForm({ ...form, direction: d })}>{d}</Toggle>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Outcome</label>
                <div className="flex gap-1.5">
                  {["win", "loss", "be"].map((o) => (
                    <Toggle key={o} active={form.outcome === o} onClick={() => setForm({ ...form, outcome: o })}
                      activeBg={o === "win" ? C.green : o === "loss" ? C.red : C.textFaint}>{o}</Toggle>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Risk %</label>
                <input type="number" step="0.1" value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })}
                  className="w-full rounded px-2.5 py-2 text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>R:R Ratio (1 : x)</label>
                <input type="number" step="0.1" value={form.rrRatio} onChange={(e) => setForm({ ...form, rrRatio: e.target.value })}
                  className="w-full rounded px-2.5 py-2 text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Reward % (automatic)</label>
                <div className="w-full rounded px-2.5 py-2 text-sm" style={{ ...mono, backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.textDim }}>
                  {((parseFloat(form.risk) || 0) * (parseFloat(form.rrRatio) || 0)).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label style={labelStyle}>Sawir (chart screenshot)</label>
              <div className="flex gap-1 mb-2 rounded p-1 w-fit" style={{ border: `1px solid ${C.border}` }}>
                {["file", "link"].map((m) => (
                  <button key={m} onClick={() => setImgMode(m)} className="px-3 py-1.5 rounded text-xs transition-colors"
                    style={{ ...mono, backgroundColor: imgMode === m ? C.gold : "transparent", color: imgMode === m ? C.bg : C.textDim }}>
                    {m === "file" ? "📁 Upload File" : "🔗 Link (URL)"}
                  </button>
                ))}
              </div>
              <div className="rounded px-3 py-3" style={{ border: `1px dashed ${C.border}` }}>
                {imgMode === "file" ? (
                  <>
                    <div className="flex items-center gap-2 text-xs mb-2" style={{ color: C.textDim }}>
                      <ImageIcon size={15} /> Dooro sawir ka socda mobile-kaaga ama laptop-ka
                    </div>
                    <input type="file" accept="image/*" onChange={handleImage} />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs mb-2" style={{ color: C.textDim }}>
                      <ImageIcon size={15} /> Ku dheji link-ga sawirka (tusaale: imgur, tradingview, iwm)
                    </div>
                    <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://..." className="w-full rounded px-2.5 py-2 text-xs focus:outline-none" style={inputStyle} />
                  </>
                )}
              </div>
              {(form.imageUrl || form.image) && (
                <img src={form.imageUrl || form.image} alt="preview" className="mt-2 rounded max-h-40" style={{ border: `1px solid ${C.border}` }} />
              )}
            </div>

            <div className="mb-3">
              <label style={labelStyle}>Fiiro gaar ah</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                placeholder="Setup-ka, dareenka, waxa aad barateen..."
                className="w-full rounded px-2.5 py-2 text-sm focus:outline-none resize-none" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
            </div>
            <div className="flex gap-2">
              <button onClick={saveTrade} className="px-4 py-2 rounded text-sm font-medium transition-colors" style={{ ...mono, backgroundColor: C.gold, color: C.bg }}>
                {editingId ? "Cusboonaysii Ganacsiga" : "Kaydi Ganacsiga"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-4 py-2 rounded text-sm transition-colors" style={{ ...mono, color: C.textDim, border: `1px solid ${C.border}` }}>
                  Jooji
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-center py-10" style={{ color: C.textFaint }}>Soo raraya...</div>
        ) : tab === "journal" ? (
          trades.length === 0 ? (
            <div className="rounded py-12 text-center" style={{ border: `1px dashed ${C.border}` }}>
              <p className="text-sm" style={{ color: C.textFaint }}>Weli ma jiro ganacsi la diiwaan geliyay.</p>
              <p className="text-xs mt-1" style={{ color: C.textFaint2 }}>Riix "Ganacsi cusub" si aad u bilowdo.</p>
            </div>
          ) : (
            <div className="rounded overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {trades.map((t, idx) => {
                const isOpen = expanded === t.id;
                const sessionInfo = SESSIONS.find((s) => s.id === t.session);
                return (
                  <div key={t.id} style={{ backgroundColor: C.surface, borderTop: idx === 0 ? "none" : `1px solid ${C.border}` }}>
                    <button onClick={() => setExpanded(isOpen ? null : t.id)} className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors">
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.outcome === "win" ? <TrendingUp size={15} style={{ color: C.green }} /> :
                         t.outcome === "loss" ? <TrendingDown size={15} style={{ color: C.red }} /> :
                         <span style={{ width: 15, height: 2, backgroundColor: C.textFaint, display: "inline-block" }} />}
                        <span className="text-sm font-medium" style={mono}>{t.symbol}</span>
                        {t.model && <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5" style={{ color: C.gold, border: `1px solid ${C.gold}` }}>{t.model}</span>}
                        {sessionInfo && <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5" style={{ color: C.textFaint, border: `1px solid ${C.border}` }}>{sessionInfo.flag} {sessionInfo.label}{t.purgeTime ? ` · ${t.purgeTime}` : ""}</span>}
                        <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5" style={{ color: C.textFaint, border: `1px solid ${C.border}` }}>{t.direction}</span>
                        <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5" style={{ color: t.outcome === "win" ? C.green : t.outcome === "loss" ? C.red : C.textDim, border: `1px solid ${t.outcome === "win" ? C.green : t.outcome === "loss" ? C.red : C.border}` }}>{t.outcome}</span>
                        <span className="text-xs" style={{ ...mono, color: C.textFaint }}>{t.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ ...mono, color: t.rMultiple >= 0 ? C.green : C.red }}>{fmtR(t.rMultiple)}</span>
                        {isOpen ? <ChevronUp size={15} style={{ color: C.textFaint }} /> : <ChevronDown size={15} style={{ color: C.textFaint }} />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1">
                        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                          <div><div style={{ color: C.textFaint, marginBottom: 2 }}>Risk</div><div style={mono}>{t.risk}%</div></div>
                          <div><div style={{ color: C.textFaint, marginBottom: 2 }}>Reward</div><div style={mono}>{t.reward}%</div></div>
                          <div><div style={{ color: C.textFaint, marginBottom: 2 }}>R:R</div><div style={mono}>1:{t.rrRatio}</div></div>
                        </div>
                        {t.image && (
                          <img src={t.image} alt={t.symbol} onClick={() => setLightbox(t.image)} className="rounded max-h-56 mb-3 cursor-zoom-in" style={{ border: `1px solid ${C.border}` }} />
                        )}
                        {t.notes && <p className="text-sm mb-3 leading-relaxed" style={{ color: C.notesText }}>{t.notes}</p>}
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEdit(t)} className="flex items-center gap-1 text-xs transition-colors" style={{ color: C.gold }}>
                            <Pencil size={12} /> Wax ka beddel
                          </button>
                          <button onClick={() => removeTrade(t.id)} className="flex items-center gap-1 text-xs transition-colors" style={{ color: C.red }}>
                            <Trash2 size={12} /> Tirtir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : tab === "dashboard" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1.5 rounded" style={{ color: C.textDim }}><ChevronLeft size={18} /></button>
              <div className="text-center">
                <div className="text-sm font-medium" style={display}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
                <div className="text-xs mt-0.5" style={{ ...mono, color: monthNet >= 0 ? C.green : C.red }}>{fmtR(monthNet)}</div>
              </div>
              <button onClick={() => changeMonth(1)} className="p-1.5 rounded" style={{ color: C.textDim }}><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => <div key={d} className="text-[10px] uppercase tracking-wider text-center py-1" style={{ color: C.textFaint }}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, i) => {
                if (!cell) return <div key={i} className="aspect-square" />;
                const data = cell.data;
                const cellStyle = !data ? { backgroundColor: C.surface, border: `1px solid ${C.border}` } :
                  data.net > 0 ? { backgroundColor: C.greenBg, border: `1px solid ${C.green}` } :
                  data.net < 0 ? { backgroundColor: C.redBg, border: `1px solid ${C.red}` } :
                  { backgroundColor: "#1E2229", border: `1px solid ${C.textFaint}` };
                return (
                  <div key={i} className="aspect-square rounded px-1.5 py-1 flex flex-col justify-between" style={cellStyle}>
                    <span className="text-[10px]" style={{ ...mono, color: C.textDim }}>{cell.day}</span>
                    {data && (
                      <div className="text-right">
                        <div className="text-[10px] leading-tight font-medium" style={{ ...mono, color: data.net >= 0 ? C.greenBright : C.redBright }}>{fmtR(data.net)}</div>
                        <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.55)" }}>{data.count} trade{data.count > 1 ? "s" : ""}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // ---- Checklist tab ----
          <div>
            <p className="text-sm mb-4" style={{ color: C.textDim }}>Dooro model-ka aad isticmaali doonto, hubi checklist-ka intaadan trade gelin.</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {Object.entries(MODELS).map(([key, m]) => (
                <button key={key} onClick={() => selectModelReset(key)} className="py-3 rounded border text-xs font-medium transition-colors text-center"
                  style={{ ...mono, backgroundColor: selectedModel === key ? C.gold : "transparent", color: selectedModel === key ? C.bg : C.text, borderColor: selectedModel === key ? C.gold : C.border }}>
                  {m.name}
                </button>
              ))}
            </div>

            {selectedModel && (
              <div className="rounded p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                <div className="text-sm font-medium mb-3" style={{ ...display, color: C.gold }}>{MODELS[selectedModel].name} Checklist</div>
                <div className="space-y-2 mb-4">
                  {MODELS[selectedModel].items.map((item) => (
                    <div key={item.id}>
                      <button onClick={() => toggleCheck(item.id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded transition-colors" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
                        {checked[item.id] ? <CheckSquare size={17} style={{ color: C.green }} /> : <Square size={17} style={{ color: C.textFaint }} />}
                        <span className="text-sm" style={{ color: checked[item.id] ? C.text : C.textDim, textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.label}</span>
                      </button>
                      {item.hasSession && checked[item.id] && (
                        <div className="ml-3 mt-2 pl-3" style={{ borderLeft: `2px solid ${C.border}` }}>
                          <div className="flex gap-1.5 flex-wrap mb-2">
                            {SESSIONS.map((s) => (
                              <button key={s.id} onClick={() => { setClSession(s.id); setClPurgeTime(PURGE_TIMES[s.id][0]); }}
                                className="text-[11px] py-1.5 px-2.5 rounded border transition-colors"
                                style={{ ...mono, backgroundColor: clSession === s.id ? C.gold : "transparent", color: clSession === s.id ? C.bg : C.textDim, borderColor: clSession === s.id ? C.gold : C.border }}>
                                {s.flag} {s.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            {PURGE_TIMES[clSession].map((pt) => (
                              <button key={pt} onClick={() => setClPurgeTime(pt)} className="text-[11px] py-1.5 px-2.5 rounded border transition-colors"
                                style={{ ...mono, backgroundColor: clPurgeTime === pt ? C.gold : "transparent", color: clPurgeTime === pt ? C.bg : C.textDim, borderColor: clPurgeTime === pt ? C.gold : C.border }}>
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={goToTradeFromChecklist} className="w-full py-2.5 rounded text-sm font-medium transition-colors" style={{ ...mono, backgroundColor: C.gold, color: C.bg }}>
                  Ku sii soco → Gali Trade-ka
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 flex items-center justify-center p-6 z-50 cursor-zoom-out" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
          <img src={lightbox} alt="chart" className="max-w-full max-h-full rounded" />
        </div>
      )}
    </div>
  );
}
