{/* TAB 5: KAALMADA & ADMIN PANEL (SUPPORT) */}
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