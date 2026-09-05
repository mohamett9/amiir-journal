"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  MessageSquare, 
  LifeBuoy, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  DollarSign, 
  Percent, 
  Upload, 
  ExternalLink,
  ShieldAlert,
  BellRing
} from 'lucide-react';

// SESSIONS CONFIGURATION
const SESSIONS = {
  asian: { label: "🇯🇵 Asian", time: "8PM–9PM", purges: ["8pm", "9pm"] },
  london: { label: "🇬🇧 London", time: "2AM–3AM", purges: ["2am", "3am"] },
  newyork: { label: "🇺🇸 New York", time: "8AM–9AM", purges: ["8am", "9am"] },
  others: { label: "🌐 Others", time: "6AM–10AM", purges: ["6am", "10am"] },
};

export default function AmirJournalApp() {
  // Navigation & Admin State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'checklist' | 'chat' | 'support'>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminBroadcast, setAdminBroadcast] = useState<string>("Ku soo dhawoow Amiir Journal V2! Nidaamka wuxuu ku shaqaynayaa nooca ugu dambeeyay.");
  const [newBroadcastInput, setNewBroadcastInput] = useState<string>("");

  // Account Capital ($)
  const [startingBalance, setStartingBalance] = useState<number>(10000);
  const [isEditingBalance, setIsEditingBalance] = useState<boolean>(false);
  const [tempBalance, setTempBalance] = useState<string>("10000");

  // Trades State
  const [trades, setTrades] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const initialForm = {
    symbol: 'NQ',
    date: new Date().toISOString().split('T')[0],
    session: 'london',
    purgeTime: '2am',
    direction: 'buy',
    outcome: 'win',
    risk: 1,      // % of account
    rrRatio: 2,   // 1 : X
    notes: '',
    imageType: 'file',
    imageUrl: '',
    image: null as string | null,
    model: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Checklist State
  const [activeModel, setActiveModel] = useState<'CRT' | 'MMXM'>('CRT');
  const [crtPurgingChecked, setCrtPurgingChecked] = useState<boolean>(false);
  const [crtSession, setCrtSession] = useState<string>('london');
  const [crtPurgeTime, setCrtPurgeTime] = useState<string>('2am');
  const [checklistChecks, setChecklistChecks] = useState<Record<string, boolean>>({});

  // Chat State
  const [messages, setMessages] = useState<any[]>([
    { id: 1, user: 'Amiir (Admin)', text: 'Dhammaan traders-ka, ku soo dhawaada nidaamka cusub ee buluugga ah!', time: '10:00 AM', isAdmin: true },
    { id: 2, user: 'Guled_FX', text: 'London Session breakout-ka maanta wuxuu ahaa mid aad u qurux badan.', time: '10:14 AM', isAdmin: false },
    { id: 3, user: 'Khadar_Trader', text: 'CRT model-ka yaa ku qaatay EURUSD?', time: '10:30 AM', isAdmin: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Support State
  const [supportTickets, setSupportTickets] = useState<any[]>([
    { id: 'TK-101', subject: 'Cilad xagga xisaabinta R:R', status: 'Xalliyay', date: '2026-03-01' }
  ]);
  const [newTicketSubject, setNewTicketSubject] = useState('');

  // Load / Persist data using localStorage safely (Client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTrades = localStorage.getItem('amir_trades_v2');
      if (savedTrades) {
        try { setTrades(JSON.parse(savedTrades)); } catch (e) {}
      } else {
        // Initial mock trades
        const initialTrades = [
          {
            id: '1',
            symbol: 'NAS100',
            date: new Date().toISOString().split('T')[0],
            session: 'newyork',
            purgeTime: '8am',
            direction: 'buy',
            outcome: 'win',
            risk: 1,
            rrRatio: 2.5,
            reward: 2.5,
            rMultiple: 2.5,
            notes: 'M1 Entry shift after 8:30am news candle.',
            model: 'CRT',
            image: null
          },
          {
            id: '2',
            symbol: 'EURUSD',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            session: 'london',
            purgeTime: '2am',
            direction: 'sell',
            outcome: 'loss',
            risk: 1,
            rrRatio: 2,
            reward: 2,
            rMultiple: -1,
            notes: 'Late entry on Breaker Block, stopped out.',
            model: 'MMXM',
            image: null
          }
        ];
        setTrades(initialTrades);
      }

      const savedBalance = localStorage.getItem('amir_balance_v2');
      if (savedBalance) setStartingBalance(parseFloat(savedBalance));
    }
  }, []);

  const saveTrades = (updated: any[]) => {
    setTrades(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('amir_trades_v2', JSON.stringify(updated));
    }
  };

  const handleUpdateBalance = () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val) && val > 0) {
      setStartingBalance(val);
      if (typeof window !== 'undefined') {
        localStorage.setItem('amir_balance_v2', val.toString());
      }
    }
    setIsEditingBalance(false);
  };

  // Calculations
  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.outcome === 'win').length;
    const losses = trades.filter(t => t.outcome === 'loss').length;
    const be = trades.filter(t => t.outcome === 'be').length;
    const netR = trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0);
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    
    // Currency Calculations based on starting balance
    // 1R = (Risk% / 100) * Starting Balance
    let totalDollarPnL = 0;
    trades.forEach(t => {
      const dollarRiskPerTrade = (t.risk / 100) * startingBalance;
      if (t.outcome === 'win') totalDollarPnL += dollarRiskPerTrade * t.rrRatio;
      else if (t.outcome === 'loss') totalDollarPnL -= dollarRiskPerTrade;
    });

    const currentEquity = startingBalance + totalDollarPnL;
    const totalReturnPercent = startingBalance > 0 ? (totalDollarPnL / startingBalance) * 100 : 0;

    return { total, wins, losses, be, netR, winRate, totalDollarPnL, currentEquity, totalReturnPercent };
  }, [trades, startingBalance]);

  // Handle Trade Form Save
  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    let rMult = 0;
    if (formData.outcome === 'win') rMult = formData.risk * formData.rrRatio;
    else if (formData.outcome === 'loss') rMult = -formData.risk;
    else rMult = 0;

    const tradeItem = {
      ...formData,
      id: editingId || Date.now().toString(),
      reward: formData.risk * formData.rrRatio,
      rMultiple: rMult,
      image: formData.imageType === 'file' ? formData.image : formData.imageUrl
    };

    let updated: any[];
    if (editingId) {
      updated = trades.map(t => t.id === editingId ? tradeItem : t);
    } else {
      updated = [tradeItem, ...trades];
    }

    saveTrades(updated);
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleEditTrade = (t: any) => {
    setFormData({
      ...t,
      imageType: t.image?.startsWith('http') ? 'url' : 'file',
      imageUrl: t.image?.startsWith('http') ? t.image : '',
      image: t.image?.startsWith('data:') ? t.image : null
    });
    setEditingId(t.id);
    setIsFormOpen(true);
    setActiveTab('journal');
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto ganacsigan?")) {
      saveTrades(trades.filter(t => t.id !== id));
    }
  };

  // Image Resize Helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 500;
          const scale = maxW / img.width;
          canvas.width = maxW;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.7) });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E7E2D6] font-sans pb-28">
      
      {/* 1. TOP HEADER & BRANDING */}
      <header className="sticky top-0 z-40 bg-[#0B0F14]/90 backdrop-blur-md border-b border-[#22292F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo Brand: AMIR with Sword Motif */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0E141A] rounded-[10px] flex items-center justify-center flex-col">
                <span className="text-[#3B82F6] font-black text-xs tracking-tighter">AMIIR</span>
                <div className="w-4 h-[2px] bg-[#3B82F6] rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-white">AMIIR JOURNAL</h1>
              <span className="text-[10px] text-[#3B82F6] font-mono tracking-widest uppercase">Trading Terminal V2</span>
            </div>
          </div>

          {/* Top Controls: Balance & Admin Switch */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAdmin 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm shadow-blue-500/30' 
                  : 'bg-[#131A22] border-[#22292F] text-[#8A8F98] hover:text-white'
              }`}
            >
              <ShieldCheck size={15} />
              <span>{isAdmin ? 'Admin: ON' : 'Admin Mode'}</span>
            </button>
          </div>
        </div>

        {/* System Broadcast Announcement */}
        {adminBroadcast && (
          <div className="bg-[#131A22] border-t border-[#22292F] px-4 py-1.5 flex items-center justify-between text-xs text-[#8A8F98]">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <BellRing size={13} className="text-[#3B82F6] shrink-0" />
              <span className="text-[11px] truncate text-slate-300">{adminBroadcast}</span>
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  const msg = prompt("Geli fariinta cusub ee aad u dirayso user-yada:", adminBroadcast);
                  if (msg !== null) setAdminBroadcast(msg);
                }} 
                className="text-[10px] text-blue-400 underline shrink-0 ml-2"
              >
                Beddel
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. STATS & BALANCE BAR ($ & %) */}
      <section className="max-w-4xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Equity / Balance Card */}
          <div className="bg-[#0E141A] border border-[#22292F] p-3.5 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-[#565C64] uppercase tracking-wider flex items-center gap-1">
                <DollarSign size={12} className="text-blue-500"/> Raasamaalka
              </span>
              <button onClick={() => setIsEditingBalance(!isEditingBalance)} className="text-[10px] text-blue-400 hover:underline">
                {isEditingBalance ? 'Xir' : 'Beddel'}
              </button>
            </div>
            {isEditingBalance ? (
              <div className="flex gap-1 mt-1">
                <input 
                  type="number" 
                  className="w-full bg-[#131A22] border border-[#3B82F6] p-1 rounded text-xs text-white" 
                  value={tempBalance}
                  onChange={e => setTempBalance(e.target.value)}
                />
                <button onClick={handleUpdateBalance} className="bg-[#3B82F6] text-white text-[10px] px-2 rounded font-bold">OK</button>
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold font-mono text-white">${stats.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-[#565C64]">Bilaaw: ${startingBalance.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Net Profit ($ and %) */}
          <div className="bg-[#0E141A] border border-[#22292F] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#565C64] uppercase tracking-wider flex items-center gap-1 mb-1">
              <Percent size={12} className="text-blue-500"/> Faa'iidada (P/L)
            </span>
            <div className={`text-lg font-bold font-mono ${stats.totalDollarPnL >= 0 ? 'text-[#4FAE83]' : 'text-[#D65F5F]'}`}>
              {stats.totalDollarPnL >= 0 ? '+' : ''}${stats.totalDollarPnL.toFixed(2)}
            </div>
            <div className={`text-[10px] font-mono font-bold ${stats.totalReturnPercent >= 0 ? 'text-[#4FAE83]' : 'text-[#D65F5F]'}`}>
              {stats.totalReturnPercent >= 0 ? '+' : ''}{stats.totalReturnPercent.toFixed(2)}%
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-[#0E141A] border border-[#22292F] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#565C64] uppercase tracking-wider flex items-center gap-1 mb-1">
              <TrendingUp size={12} className="text-blue-500"/> Win Rate
            </span>
            <div className="text-lg font-bold font-mono text-[#8FE3C0]">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#565C64] font-mono">
              <span className="text-[#4FAE83]">{stats.wins}W</span> / <span className="text-[#D65F5F]">{stats.losses}L</span> / <span>{stats.be}BE</span>
            </div>
          </div>

          {/* Net R-Multiple */}
          <div className="bg-[#0E141A] border border-[#22292F] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#565C64] uppercase tracking-wider flex items-center gap-1 mb-1">
              Net R-Multiple
            </span>
            <div className={`text-lg font-bold font-mono ${stats.netR >= 0 ? 'text-[#4FAE83]' : 'text-[#D65F5F]'}`}>
              {stats.netR >= 0 ? `+${stats.netR.toFixed(2)}R` : `${stats.netR.toFixed(2)}R`}
            </div>
            <div className="text-[10px] text-[#565C64]">Guud ahaan: {stats.total} trades</div>
          </div>

        </div>
      </section>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* TAB 1: MAAMULKA (DASHBOARD & PERFORMANCE CALENDAR) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Maamulka Guud (Dashboard)</h2>
                <p className="text-xs text-[#8A8F98]">Kalandarka waxqabadka iyo warbixinta maaliyadda.</p>
              </div>
              <button 
                onClick={() => { setIsFormOpen(true); setActiveTab('journal'); }} 
                className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus size={16} /> Ganacsi Cusub
              </button>
            </div>

            {/* Performance Calendar */}
            <PerformanceCalendar trades={trades} />

            {/* Recent Trades Preview */}
            <div className="bg-[#0E141A] border border-[#22292F] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">Ganacsiyadii ugu dambeeyay</h3>
              {trades.slice(0, 3).map(trade => (
                <div key={trade.id} className="bg-[#131A22] border border-[#22292F] p-3 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trade.outcome === 'win' ? 'bg-[#1E5A41] text-[#8FE3C0]' : 'bg-[#5C2323] text-[#F2A6A6]'}`}>
                      {trade.outcome}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-white">{trade.symbol} <span className="text-xs text-[#8A8F98]">({trade.direction.toUpperCase()})</span></div>
                      <div className="text-[10px] text-[#565C64]">{trade.date} • {trade.session}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className={`text-sm font-bold ${trade.rMultiple >= 0 ? 'text-[#4FAE83]' : 'text-[#D65F5F]'}`}>
                      {trade.rMultiple >= 0 ? `+${trade.rMultiple}%` : `${trade.rMultiple}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: DIIWAANKA (TRADE JOURNAL & ENTRY FORM) */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Diiwaanka Ganacsiga (Journal)</h2>
                <p className="text-xs text-[#8A8F98]">Geli, maamul, oo dib u eeg dhammaan ganacsiyadaada.</p>
              </div>
              <button 
                onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialForm); }}
                className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus size={16} /> {isFormOpen ? 'Xir Foomka' : 'Ganacsi Cusub'}
              </button>
            </div>

            {/* COLLAPSIBLE ENTRY FORM */}
            {isFormOpen && (
              <form onSubmit={handleSaveTrade} className="bg-[#0E141A] border border-[#3B82F6] p-6 rounded-xl space-y-4 shadow-xl shadow-blue-950/20">
                <div className="flex justify-between items-center border-b border-[#22292F] pb-3">
                  <h3 className="font-bold text-sm text-[#3B82F6]">
                    {editingId ? 'Wax ka beddel Ganacsiga' : 'Geli Ganacsi Cusub (New Trade)'}
                  </h3>
                  {formData.model && (
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
                      Model: {formData.model}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Symbol (tusaale: NQ, EURUSD)</label>
                    <input 
                      required 
                      className="w-full bg-[#131A22] border border-[#22292F] p-2.5 rounded text-sm text-white focus:outline-none focus:border-[#3B82F6]" 
                      value={formData.symbol} 
                      onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Taariikhda</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-[#131A22] border border-[#22292F] p-2.5 rounded text-sm text-white focus:outline-none focus:border-[#3B82F6]" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>

                {/* Session Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1.5">Session</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(SESSIONS).map(([key, info]) => (
                      <button 
                        type="button" 
                        key={key}
                        onClick={() => setFormData({...formData, session: key, purgeTime: info.purges[0]})}
                        className={`p-2 rounded border text-left transition-all ${
                          formData.session === key 
                            ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-white' 
                            : 'border-[#22292F] bg-[#131A22] text-[#8A8F98]'
                        }`}
                      >
                        <div className="text-xs font-bold">{info.label}</div>
                        <div className="text-[9px] opacity-70">{info.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purging Time Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1.5">Purging Time</label>
                  <div className="flex gap-2">
                    {(SESSIONS as any)[formData.session]?.purges.map((p: string) => (
                      <button 
                        type="button" 
                        key={p} 
                        onClick={() => setFormData({...formData, purgeTime: p})}
                        className={`px-4 py-1.5 rounded text-xs font-bold border transition-all ${
                          formData.purgeTime === p 
                            ? 'border-[#3B82F6] bg-[#3B82F6]/20 text-[#3B82F6]' 
                            : 'border-[#22292F] bg-[#131A22] text-[#8A8F98]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direction & Outcome */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1.5">Direction</label>
                    <div className="flex bg-[#131A22] p-1 rounded border border-[#22292F] gap-1">
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, direction: 'buy'})} 
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${formData.direction === 'buy' ? 'bg-[#3B82F6] text-white' : 'text-[#8A8F98]'}`}
                      >
                        BUY (Long)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, direction: 'sell'})} 
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${formData.direction === 'sell' ? 'bg-[#3B82F6] text-white' : 'text-[#8A8F98]'}`}
                      >
                        SELL (Short)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1.5">Natiijada (Outcome)</label>
                    <div className="flex bg-[#131A22] p-1 rounded border border-[#22292F] gap-1">
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, outcome: 'win'})} 
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${formData.outcome === 'win' ? 'bg-[#4FAE83] text-black' : 'text-[#8A8F98]'}`}
                      >
                        WIN
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, outcome: 'loss'})} 
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${formData.outcome === 'loss' ? 'bg-[#D65F5F] text-white' : 'text-[#8A8F98]'}`}
                      >
                        LOSS
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, outcome: 'be'})} 
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${formData.outcome === 'be' ? 'bg-[#565C64] text-white' : 'text-[#8A8F98]'}`}
                      >
                        BE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk, R:R, Reward Calculation */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Risk %</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="w-full bg-[#131A22] border border-[#22292F] p-2 rounded text-sm text-white" 
                      value={formData.risk} 
                      onChange={e => setFormData({...formData, risk: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">R:R Ratio (1:x)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="w-full bg-[#131A22] border border-[#22292F] p-2 rounded text-sm text-white" 
                      value={formData.rrRatio} 
                      onChange={e => setFormData({...formData, rrRatio: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Reward % (Auto)</label>
                    <div className="w-full bg-[#131A22]/60 border border-[#22292F] p-2 rounded text-sm font-mono text-[#4FAE83] font-bold">
                      +{(formData.risk * formData.rrRatio).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Screenshot Uploader / URL */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Sawirka Chart-ka</label>
                  <div className="border border-[#22292F] rounded-lg p-3 bg-[#131A22] space-y-2">
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="imgtype" 
                          checked={formData.imageType === 'file'} 
                          onChange={() => setFormData({...formData, imageType: 'file'})}
                        />
                        <span>Upload File</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="imgtype" 
                          checked={formData.imageType === 'url'} 
                          onChange={() => setFormData({...formData, imageType: 'url'})}
                        />
                        <span>Pasted Link</span>
                      </label>
                    </div>

                    {formData.imageType === 'file' ? (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="text-xs text-[#8A8F98] file:bg-[#3B82F6] file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 font-mono cursor-pointer"
                      />
                    ) : (
                      <input 
                        placeholder="https://tradingview.com/x/..." 
                        className="w-full bg-[#0B0F14] border border-[#22292F] p-2 rounded text-xs text-white"
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#565C64] mb-1">Fiiro Gaar Ah (Notes)</label>
                  <textarea 
                    rows={2} 
                    className="w-full bg-[#131A22] border border-[#22292F] p-2.5 rounded text-sm text-white" 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Sababta aad u gashay, qaladadkii dhacay, iwm..."
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition-colors"
                  >
                    {editingId ? 'Wax ka beddel' : 'Kaydi Ganacsiga'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsFormOpen(false); setEditingId(null); }} 
                    className="px-5 border border-[#22292F] text-xs font-bold rounded-lg hover:bg-white/5"
                  >
                    Kansal
                  </button>
                </div>
              </form>
            )}

            {/* SAVED TRADES LIST */}
            <div className="space-y-3">
              {trades.length === 0 ? (
                <div className="text-center py-16 bg-[#0E141A] border border-dashed border-[#22292F] rounded-xl text-[#565C64]">
                  <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Weli wax ganacsi ah ma diiwaangelin.</p>
                </div>
              ) : (
                trades.map(trade => (
                  <TradeRowItem 
                    key={trade.id} 
                    trade={trade} 
                    onEdit={handleEditTrade} 
                    onDelete={handleDeleteTrade} 
                  />
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 3: SHURUUDAHA (STRATEGY CHECKLIST: CRT & MMXM) */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Shuruudaha Kahor-Ganacsiga (Checklist)</h2>
              <p className="text-xs text-[#8A8F98]">Hubi dhammaan shuruudaha model-kaaga ka hor inta aadan suuqa gelin.</p>
            </div>

            {/* Model Selector Tabs */}
            <div className="flex bg-[#131A22] p-1 rounded-xl border border-[#22292F]">
              <button 
                onClick={() => setActiveModel('CRT')} 
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${activeModel === 'CRT' ? 'bg-[#3B82F6] text-white shadow' : 'text-[#8A8F98]'}`}
              >
                CRT MODEL
              </button>
              <button 
                onClick={() => setActiveModel('MMXM')} 
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${activeModel === 'MMXM' ? 'bg-[#3B82F6] text-white shadow' : 'text-[#8A8F98]'}`}
              >
                MMXM MODEL
              </button>
            </div>

            {/* Model Checklist Content */}
            <div className="bg-[#0E141A] border border-[#22292F] p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-[#3B82F6] uppercase tracking-wider">{activeModel} Rules Verification</h3>
              
              {activeModel === 'CRT' ? (
                <div className="space-y-3">
                  <CheckItemRow 
                    label="IRL TO ERL (Internal to External Range Liquidity)" 
                    checked={!!checklistChecks['crt_irl']} 
                    onChange={v => setChecklistChecks({...checklistChecks, crt_irl: v})}
                  />
                  
                  {/* Purging Check with nested session options */}
                  <div className="border border-[#22292F] bg-[#131A22] rounded-lg p-3 space-y-3">
                    <CheckItemRow 
                      label="PURGING (Liquidity Sweep)" 
                      checked={crtPurgingChecked} 
                      onChange={v => setCrtPurgingChecked(v)}
                    />
                    {crtPurgingChecked && (
                      <div className="pl-6 space-y-2 border-t border-[#22292F]/60 pt-3">
                        <span className="text-[10px] text-[#565C64] uppercase tracking-wider block">Dooro Session-ka & Purge Time-ka:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(SESSIONS).map(([key, info]) => (
                            <button 
                              key={key} 
                              onClick={() => { setCrtSession(key); setCrtPurgeTime(info.purges[0]); }}
                              className={`p-1.5 rounded text-[11px] font-bold border text-left ${crtSession === key ? 'border-[#3B82F6] text-[#3B82F6] bg-blue-500/10' : 'border-[#22292F] text-[#8A8F98]'}`}
                            >
                              {info.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          {(SESSIONS as any)[crtSession].purges.map((p: string) => (
                            <button 
                              key={p} 
                              onClick={() => setCrtPurgeTime(p)}
                              className={`px-3 py-1 rounded text-[10px] font-bold border ${crtPurgeTime === p ? 'border-[#3B82F6] bg-blue-500/20 text-[#3B82F6]' : 'border-[#22292F] text-[#8A8F98]'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <CheckItemRow 
                    label="SMT Divergence (Correlated pair discrepancy)" 
                    checked={!!checklistChecks['crt_smt']} 
                    onChange={v => setChecklistChecks({...checklistChecks, crt_smt: v})}
                  />
                  <CheckItemRow 
                    label="M1 / M5 Entry Shift (Displacement confirmation)" 
                    checked={!!checklistChecks['crt_m1']} 
                    onChange={v => setChecklistChecks({...checklistChecks, crt_m1: v})}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <CheckItemRow 
                    label="Institutional Orderflow Alignment" 
                    checked={!!checklistChecks['mmxm_orderflow']} 
                    onChange={v => setChecklistChecks({...checklistChecks, mmxm_orderflow: v})}
                  />
                  <CheckItemRow 
                    label="HTF Key Level Reached (PD Array / FVG)" 
                    checked={!!checklistChecks['mmxm_htf']} 
                    onChange={v => setChecklistChecks({...checklistChecks, mmxm_htf: v})}
                  />
                  <CheckItemRow 
                    label="Midnight Open Price Reaction (Buy under / Sell above)" 
                    checked={!!checklistChecks['mmxm_midnight']} 
                    onChange={v => setChecklistChecks({...checklistChecks, mmxm_midnight: v})}
                  />
                  <CheckItemRow 
                    label="Breaker Block ama Inversion FVG Formation" 
                    checked={!!checklistChecks['mmxm_breaker']} 
                    onChange={v => setChecklistChecks({...checklistChecks, mmxm_breaker: v})}
                  />
                </div>
              )}

              {/* Action: Forward to Trade Form */}
              <button 
                onClick={() => {
                  setFormData({
                    ...initialForm,
                    model: activeModel,
                    session: activeModel === 'CRT' && crtPurgingChecked ? crtSession : initialForm.session,
                    purgeTime: activeModel === 'CRT' && crtPurgingChecked ? crtPurgeTime : initialForm.purgeTime
                  });
                  setIsFormOpen(true);
                  setActiveTab('journal');
                }}
                className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20"
              >
                U Gudub Ganacsiga (Enter Trade) →
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: WADAHADALKA (COMMUNITY CHAT) */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Wadahadalka Traders-ka (Chat)</h2>
              <p className="text-xs text-[#8A8F98]">La wadaag setups-kaaga iyo falanqaynta suuqa asxaabtaada.</p>
            </div>

            <div className="bg-[#0E141A] border border-[#22292F] rounded-xl flex flex-col h-[480px]">
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="bg-[#131A22] border border-[#22292F] p-3 rounded-lg max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${m.isAdmin ? 'text-[#3B82F6]' : 'text-slate-300'}`}>
                        {m.user}
                      </span>
                      {m.isAdmin && (
                        <span className="text-[9px] bg-blue-600/20 text-blue-400 px-1 rounded font-mono">ADMIN</span>
                      )}
                      <span className="text-[9px] text-[#565C64] ml-auto">{m.time}</span>
                    </div>
                    <p className="text-xs text-[#E7E2D6] leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#0B0F14] border-t border-[#22292F] flex gap-2">
                <input 
                  type="text" 
                  placeholder="Qor farriin..." 
                  className="flex-1 bg-[#131A22] border border-[#22292F] p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-[#3B82F6]" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      setMessages([...messages, {
                        id: Date.now(),
                        user: isAdmin ? 'Amiir (Admin)' : 'Waxaad tahay (You)',
                        text: chatInput,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isAdmin
                      }]);
                      setChatInput('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (chatInput.trim()) {
                      setMessages([...messages, {
                        id: Date.now(),
                        user: isAdmin ? 'Amiir (Admin)' : 'Waxaad tahay (You)',
                        text: chatInput,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isAdmin
                      }]);
                      setChatInput('');
                    }
                  }}
                  className="bg-[#3B82F6] text-white p-2.5 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KAALMADA & ADMIN PANEL (SUPPORT) */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg{/* TAB 5: KAALMADA & ADMIN PANEL (SUPPORT) */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Kaalmada & Maamulka (Support)</h2>
              <p className="text-xs text-[#8A8F98]">La xiriir maamulka Amiir Journal ama gudbi cabasho.</p>
            </div>

            {/* Admin Notice Box */}
            <div className="bg-gradient-to-r from-blue-900/40 to-blue-600/10 border border-blue-500/30 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <ShieldCheck size={18} />
                <span>Toos ula xiriir Amiir</span>
              </div>
              <p className="text-xs text-[#E7E2D6] leading-relaxed">
                Haddii aad la kulanto cilad xagga xisaabinta ah ama aad rabto talooyin ku saabsan model-ka CRT iyo MMXM, fariin ku dhaaf sanduuqa hoose.
              </p>
            </div>

            {/* Support Ticket Creation */}
            <div className="bg-[#0E141A] border border-[#22292F] p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Fur Cabasho Cusub (New Ticket)</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Qor dhibaatada aad la kulantay..." 
                  className="flex-1 bg-[#131A22] border border-[#22292F] p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                />
                <button 
                  onClick={() => {
                    if (newTicketSubject.trim()) {
                      setSupportTickets([
                        ...supportTickets, 
                        { id: `TK-${Math.floor(100 + Math.random() * 900)}`, subject: newTicketSubject, status: 'Furan', date: new Date().toISOString().split('T')[0] }
                      ]);
                      setNewTicketSubject('');
                    }
                  }}
                  className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg"
                >
                  Gudbi
                </button>
              </div>

              {/* Tickets List */}
              <div className="space-y-2 pt-3 border-t border-[#22292F]">
                {supportTickets.map(t => (
                  <div key={t.id} className="bg-[#131A22] p-3 rounded-lg border border-[#22292F] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">{t.subject}</div>
                      <div className="text-[10px] text-[#565C64]">{t.id} • {t.date}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Xalliyay' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 4. BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E141A]/95 backdrop-blur-md border-t border-[#22292F] pb-safe">
        <div className="max-w-4xl mx-auto flex justify-around items-center px-2 py-2">
          <NavBtn 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={19} />} 
            label="Maamulka" 
          />
          <NavBtn 
            active={activeTab === 'journal'} 
            onClick={() => setActiveTab('journal')} 
            icon={<BookOpen size={19} />} 
            label="Diiwaanka" 
          />
          <NavBtn 
            active={activeTab === 'checklist'} 
            onClick={() => setActiveTab('checklist')} 
            icon={<CheckSquare size={19} />} 
            label="Checklist" 
          />
          <NavBtn 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            icon={<MessageSquare size={19} />} 
            label="Wadahadal" 
          />
          <NavBtn 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')} 
            icon={<LifeBuoy size={19} />} 
            label="Kaalmo" 
          />
        </div>
      </nav>

    </div>
  );
}

// -------------------------------------------------------------
// HELPER SUB-COMPONENTS
// -------------------------------------------------------------

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
        active ? 'text-[#3B82F6]' : 'text-[#565C64] hover:text-[#8A8F98]'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
      {active && <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full shadow-sm shadow-blue-500"></div>}
    </button>
  );
}

function CheckItemRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 p-3 bg-[#131A22] border border-[#22292F] rounded-lg cursor-pointer hover:border-[#3D434B] transition-colors">
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#3D434B]'}`}>
        {checked && <Plus size={14} className="text-white" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={`text-xs font-bold ${checked ? 'text-white' : 'text-[#8A8F98]'}`}>{label}</span>
    </label>
  );
}

function TradeRowItem({ trade, onEdit, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const isWin = trade.outcome === 'win';
  const isLoss = trade.outcome === 'loss';

  return (
    <div className="bg-[#0E141A] border border-[#22292F] rounded-xl overflow-hidden transition-all">
      <div className="p-3.5 flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWin ? 'bg-[#1E5A41] text-[#8FE3C0]' : isLoss ? 'bg-[#5C2323] text-[#F2A6A6]' : 'bg-[#22292F] text-[#8A8F98]'}`}>
            {isWin ? <TrendingUp size={16}/> : isLoss ? <TrendingDown size={16}/> : <Minus size={16}/>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{trade.symbol}</span>
              {trade.model && <span className="text-[9px] bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded font-bold">{trade.model}</span>}
              <span className={`text-[10px] font-bold uppercase ${trade.direction === 'buy' ? 'text-blue-400' : 'text-orange-400'}`}>
                {trade.direction}
              </span>
            </div>
            <div className="text-[10px] text-[#565C64] font-mono">{trade.date} • {trade.session} ({trade.purgeTime})</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`font-mono text-sm font-bold ${trade.rMultiple > 0 ? 'text-[#4FAE83]' : trade.rMultiple < 0 ? 'text-[#D65F5F]' : 'text-[#565C64]'}`}>
            {trade.rMultiple > 0 ? `+${trade.rMultiple}%` : `${trade.rMultiple}%`}
          </div>
          <span className={`text-[9px] font-bold uppercase ${isWin ? 'text-[#4FAE83]' : isLoss ? 'text-[#D65F5F]' : 'text-[#565C64]'}`}>
            {trade.outcome}
          </span>
        </div>
      </div>

      {open && (
        <div className="p-4 border-t border-[#22292F] bg-[#131A22]/40 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0E141A] p-2 rounded border border-[#22292F]">
              <div className="text-[9px] text-[#565C64] uppercase">Risk</div>
              <div className="text-xs font-mono">{trade.risk}%</div>
            </div>
            <div className="bg-[#0E141A] p-2 rounded border border-[#22292F]">
              <div className="text-[9px] text-[#565C64] uppercase">Reward</div>
              <div className="text-xs font-mono">{trade.reward}%</div>
            </div>
            <div className="bg-[#0E141A] p-2 rounded border border-[#22292F]">
              <div className="text-[9px] text-[#565C64] uppercase">R:R</div>
              <div className="text-xs font-mono">1:{trade.rrRatio}</div>
            </div>
          </div>

          {trade.image && (
            <div className="rounded border border-[#22292F] overflow-hidden bg-black max-h-48">
              <img src={trade.image} alt="Chart" className="w-full h-full object-contain cursor-pointer" onClick={() => window.open(trade.image, '_blank')} />
            </div>
          )}

          {trade.notes && (
            <div className="p-2.5 bg-[#0E141A] rounded border border-[#22292F] text-xs text-[#8A8F98]">
              {trade.notes}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(trade)} className="flex-1 py-1.5 bg-[#22292F] hover:bg-[#3D434B] text-white text-xs font-bold rounded flex items-center justify-center gap-1">
              <Pencil size={13} /> Wax ka beddel
            </button>
            <button onClick={() => onDelete(trade.id)} className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-[#D65F5F] text-xs font-bold rounded flex items-center justify-center border border-red-900/30">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceCalendar({ trades }: { trades: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-[#0E141A] border border-[#22292F] rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <button onClick={prevMonth} className="p-1.5 rounded border border-[#22292F] hover:bg-white/5 text-[#8A8F98]">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded border border-[#22292F] hover:bg-white/5 text-[#8A8F98]">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} className="text-[10px] font-bold text-[#565C64] uppercase pb-1">{d}</span>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 rounded bg-transparent"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayTrades = trades.filter(t => t.date === dateStr);
          const dayPnL = dayTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0);

          let bg = 'bg-[#131A22] border-[#22292F]';
          if (dayTrades.length > 0) {
            bg = dayPnL > 0 ? 'bg-[#1E5A41] border-[#4FAE83]/40' : dayPnL < 0 ? 'bg-[#5C2323] border-[#D65F5F]/40' : 'bg-slate-800 border-slate-700';
          }

          return (
            <div key={dayNum} className={`h-9 border rounded p-0.5 flex flex-col justify-between ${bg}`}>
              <span className="text-[8px] text-[#8A8F98] text-left">{dayNum}</span>
              {dayTrades.length > 0 && (
                <span className={`text-[8px] font-mono font-bold leading-none ${dayPnL >= 0 ? 'text-[#8FE3C0]' : 'text-[#F2A6A6]'}`}>
                  {dayPnL >= 0 ? `+${dayPnL.toFixed(1)}` : dayPnL.toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}