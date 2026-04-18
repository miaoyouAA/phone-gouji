import { useState, useMemo } from 'react';
import { Undo2, RotateCcw, History } from 'lucide-react';

type CardType = '鹰' | '大王' | '小王' | '2' | 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3';
type TargetType = 'partner' | 'others';

interface Action {
  id: string;
  target: TargetType;
  count: number;
  card: CardType;
  timestamp: number;
}

const cardList: CardType[] = ['鹰', '大王', '小王', '2', 'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];

const initialPublic: Record<string, number> = {
  '鹰': 6, '大王': 6, '小王': 6, '2': 24,
  'A': 24, 'K': 24, 'Q': 24, 'J': 24,
  '10': 24, '9': 24, '8': 24, '7': 24,
  '6': 24, '5': 24, '4': 24, '3': 24
};

export default function App() {
  const [history, setHistory] = useState<Action[]>([]);
  const [target, setTarget] = useState<TargetType>('partner');
  const [count, setCount] = useState<number>(1);
  const [basePartnerCards, setBasePartnerCards] = useState<number>(51);
  const [publicOffset, setPublicOffset] = useState<Record<string, number>>({'鹰': 0, '大王': 0, '小王': 0, '2': 0});

  // Derived state
  const state = useMemo(() => {
    let publicCards = { ...initialPublic };
    let partnerCards = basePartnerCards;
    let partnerPlayed: Record<string, number> = {};
    let othersPlayed: Record<string, number> = {};

    // Apply manual adjustments to initial public pool
    ['鹰', '大王', '小王', '2'].forEach(k => {
      publicCards[k] += publicOffset[k] || 0;
    });

    history.forEach(action => {
      if (action.target === 'partner') {
        partnerCards -= action.count;
        partnerPlayed[action.card] = (partnerPlayed[action.card] || 0) + action.count;
      } else if (action.target === 'others') {
        othersPlayed[action.card] = (othersPlayed[action.card] || 0) + action.count;
      }

      if (publicCards[action.card] !== undefined) {
        publicCards[action.card] -= action.count;
      }
    });

    return { publicCards, partnerCards, partnerPlayed, othersPlayed };
  }, [history, basePartnerCards, publicOffset]);

  const handlePlay = (card: CardType) => {
    const newAction: Action = {
      id: Math.random().toString(36).substr(2, 9),
      target,
      count,
      card,
      timestamp: Date.now()
    };
    setHistory([...history, newAction]);
    setCount(1); // Reset count back to 1 for quick tapping
  };

  const handleUndo = () => {
    setHistory(history.slice(0, -1));
  };

  const handleReset = () => {
    setHistory([]);
    setTarget('partner');
    setCount(1);
    setBasePartnerCards(51);
    setPublicOffset({'鹰': 0, '大王': 0, '小王': 0, '2': 0});
  };

  const adjustPublic = (card: string, delta: number) => {
    setPublicOffset(prev => ({...prev, [card]: (prev[card] || 0) + delta}));
  };

  // Helper for stunning colors (Fixed bg-clip-text bug to ensure text is always visible)
  const getCardStyle = (c: string) => {
    switch(c) {
      case '鹰': return 'text-[#FCD34D] border-[#F59E0B]/50 bg-[#F59E0B]/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-[#F59E0B]/40';
      case '大王': return 'text-[#FCA5A5] border-[#EF4444]/50 bg-[#EF4444]/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-1 ring-[#EF4444]/40';
      case '小王': return 'text-[#94A3B8] border-[#94A3B8]/50 bg-[#94A3B8]/10 shadow-[0_0_15px_rgba(148,163,184,0.2)] ring-1 ring-[#64748B]/40';
      case '2': return 'text-[#6EE7B7] border-[#10B981]/50 bg-[#10B981]/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-[#10B981]/40';
      default: return 'text-[#E2E8F0] border-[#2D333F]/80 bg-[#1C1F26] bg-gradient-to-b from-white/5 to-transparent shadow-sm';
    }
  };

  const lastAction = history[history.length - 1];

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-gradient-to-br from-[#0B0D14] to-[#161A24] text-[#E2E8F0] font-sans select-none overflow-hidden relative shadow-2xl">
      
      {/* 1) Fixed Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 shrink-0 bg-white/5 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h1 className="text-[17px] font-black text-blue-400 tracking-wide">记牌助手 V4</h1>
          <span className="text-[9px] text-[#94A3B8] font-medium tracking-widest">修复文字/自定义公库版</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-full active:scale-95 disabled:opacity-30 disabled:active:scale-100 text-[11px] font-bold transition-all"
          >
            <Undo2 size={13} strokeWidth={2.5} /> 撤销
          </button>
          <button 
            onClick={handleReset} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full active:scale-95 text-[11px] font-bold transition-all"
          >
            <RotateCcw size={13} strokeWidth={2.5} /> 刷新(新局)
          </button>
        </div>
      </div>
      
      {/* 2) Middle Adaptive Content (No Scroll) */}
      <div className="flex-1 flex flex-col justify-evenly px-4 py-1.5 overflow-hidden w-full relative z-0">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        {/* Public Cards Focus */}
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-1.5 px-1">
             <h2 className="text-[11px] font-black tracking-widest text-slate-400">大牌公共图表 <span className="opacity-50">(可根据自家牌微调)</span></h2>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {['鹰', '大王', '小王', '2'].map(c => {
             const style = getCardStyle(c);
             return (
               <div key={c} className={`flex flex-col items-center justify-center rounded-xl py-1.5 border ${style} backdrop-blur-sm relative overflow-hidden`}>
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
                 <span className="text-[10px] opacity-80 font-bold tracking-wider z-10">{c}</span>
                 <span className="text-[20px] font-black leading-none drop-shadow-md z-10 my-0.5">{state.publicCards[c]}</span>
                 
                 {/* +/- Buttons for initial adjustment */}
                 <div className="flex gap-1.5 z-10 mt-0.5">
                    <button onClick={() => adjustPublic(c, -1)} className="w-[22px] h-[20px] flex items-center justify-center bg-black/40 active:bg-black/80 rounded-[6px] text-[13px] font-mono leading-none border border-white/10 shadow-sm">-</button>
                    <button onClick={() => adjustPublic(c, 1)} className="w-[22px] h-[20px] flex items-center justify-center bg-black/40 active:bg-black/80 rounded-[6px] text-[13px] font-mono leading-none border border-white/10 shadow-sm">+</button>
                 </div>
               </div>
             )
            })}
          </div>
        </div>

        {/* Partner Area */}
        <div className="relative z-10 w-full">
           <div className="flex justify-between items-end mb-1.5 px-1">
             <h2 className="text-[11px] font-black tracking-widest text-[#818CF8]">对家 <span className="opacity-50 font-medium">明牌与张数</span></h2>
             <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm shadow-inner">
              <span className="text-[9px] text-[#94A3B8] font-bold tracking-widest pl-1">对家初始张数:</span>
              <div className="flex items-center bg-black/40 rounded border border-white/10 overflow-hidden">
                <button onClick={() => setBasePartnerCards(c => c-1)} className="px-2.5 py-[2px] text-slate-300 hover:bg-white/10 active:bg-white/20 text-[12px] font-mono font-bold leading-none transition-colors">-</button>
                <div className="px-2 border-x border-white/10 min-w-[32px] flex justify-center">
                   <span className="text-[11px] font-black text-[#10B981]">{state.partnerCards}</span>
                </div>
                <button onClick={() => setBasePartnerCards(c => c+1)} className="px-2.5 py-[2px] text-slate-300 hover:bg-white/10 active:bg-white/20 text-[12px] font-mono font-bold leading-none transition-colors">+</button>
              </div>
            </div>
          </div>
          <div className="bg-[#1C1F28]/60 backdrop-blur-md rounded-[16px] border border-white/10 p-2 shadow-lg w-full">
            <div className="grid grid-cols-8 gap-1.5 w-full">
              {cardList.map(c => {
                const style = getCardStyle(c);
                return (
                  <div key={c} className={`flex flex-col items-center justify-center h-[52px] rounded-lg border ${style} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                    <span className="text-[9px] font-black opacity-80 uppercase tracking-tighter mb-0.5 z-10">{c}</span>
                    <span className="text-[15px] font-black leading-none drop-shadow-md z-10">{state.partnerPlayed[c] || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Others Area */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <h2 className="text-[11px] font-black tracking-widest text-slate-400">其他人 <span className="opacity-50 font-medium">(非同伙大牌拦截)</span></h2>
          </div>
          <div className="bg-[#1C1F28]/60 backdrop-blur-md rounded-[16px] border border-white/10 py-3 px-4 shadow-lg w-full flex justify-between gap-2.5">
            {['鹰', '大王', '小王', '2'].map(c => {
               const style = getCardStyle(c);
               return (
                <div key={c} className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border ${style} relative`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
                  <span className="text-[10px] font-bold opacity-80 mb-0.5 tracking-wider z-10">{c}</span>
                  <span className="text-[20px] font-black leading-none drop-shadow-md z-10">{state.othersPlayed[c] || 0}</span>
                </div>
               )
            })}
          </div>
        </div>
      </div>

      {/* 3) Fixed Bottom Operation Panel */}
      <div className="px-4 pt-4 pb-6 bg-[#0E1016]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] shrink-0 z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <div className="max-w-md mx-auto">
          
          <div className="flex justify-between items-center mb-3">
             {/* Target Identity Tabs */}
             <div className="flex gap-2">
              {([
                { key: 'partner', label: '对家 操作' },
                { key: 'others', label: '其他人 操作' }
              ] as const).map(t => (
                <button 
                  key={t.key}
                  className={`w-28 flex items-center justify-center h-9 text-[12px] font-black rounded-xl transition-all border ${target === t.key ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-500/50' : 'bg-black/30 text-slate-400 border-white/5 hover:bg-white/5'}`}
                  onClick={() => setTarget(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Last Action Bar Mini */}
             <div className="flex-1 ml-3 flex flex-col items-end pr-1">
                <span className="text-[9px] text-slate-500 font-bold tracking-widest mb-0.5 flex items-center gap-1"><History size={10} /> 操作历史记录</span>
                {lastAction ? (
                   <div className="flex items-center gap-1 text-[11px] font-black">
                     <span className={lastAction.target === 'partner' ? 'text-indigo-400' : 'text-slate-400'}>{lastAction.target === 'partner' ? '对家' : '其它'}</span>
                     <span className="text-white mx-0.5">+{lastAction.count}张</span>
                     <span className={`px-1.5 py-[2px] rounded text-[10px] border leading-none ${
                        lastAction.card === '鹰' ? 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10' :
                        lastAction.card === '大王' ? 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' :
                        lastAction.card === '小王' ? 'text-[#94A3B8] border-[#94A3B8]/30 bg-[#94A3B8]/10' :
                        lastAction.card === '2' ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10' :
                        'text-slate-300 border-slate-600 bg-slate-800'
                     }`}>{lastAction.card}</span>
                   </div>
                ) : (
                   <span className="text-[11px] font-medium text-slate-600">空闲等待...</span>
                )}
             </div>
          </div>

          {/* Count Multiplier */}
          <div className="flex justify-between gap-1 bg-black/40 border border-white/5 p-1 rounded-[12px] mb-3">
            <div className="flex items-center shrink-0 pr-2 pl-1 border-r border-white/10">
               <span className="text-[9px] font-bold text-slate-500 tracking-widest whitespace-nowrap">数量</span>
            </div>
            <div className="flex-1 flex justify-between gap-1 pl-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 flex items-center justify-center h-[26px] text-[12px] rounded-[8px] transition-all font-black font-mono ${
                    count === n 
                    ? 'bg-[#3B82F6] text-white shadow-[0_2px_0_#1E3A8A]' 
                    : 'text-slate-400 hover:bg-white/5 active:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Card Grid Keyboard */}
          <div className="grid grid-cols-4 gap-[10px]">
            {cardList.map(c => {
               const isSpecial = ['鹰', '大王', '小王', '2'].includes(c);
               let baseClass = 'bg-[#1C1F28] border border-white/10 text-slate-200';
               let glowClass = '';
               
               if (c === '鹰') {
                 baseClass = 'text-[#FCD34D] border-[#F59E0B]';
                 glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-500/10 ring-1 ring-[#F59E0B]/50';
               }
               if (c === '大王') {
                 baseClass = 'text-[#FCA5A5] border-[#EF4444]';
                 glowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-rose-500/10 ring-1 ring-[#EF4444]/50';
               }
               if (c === '小王') {
                 baseClass = 'text-[#E2E8F0] border-[#94A3B8]';
                 glowClass = 'shadow-[0_0_15px_rgba(148,163,184,0.2)] bg-slate-500/10 ring-1 ring-[#64748B]/50';
               }
               if (c === '2') {
                 baseClass = 'text-[#6EE7B7] border-[#10B981]';
                 glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-500/10 ring-1 ring-[#10B981]/50';
               }

              return (
                <button
                  key={c}
                  onClick={() => handlePlay(c)}
                  className={`h-12 rounded-[14px] shadow-[0_4px_0_rgba(0,0,0,0.8)] active:translate-y-[4px] active:shadow-[0_0px_0_rgba(0,0,0,0)] transition-all select-none flex items-center justify-center outline-none relative overflow-hidden group ${baseClass} ${glowClass}`}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 group-active:bg-black/20 transition-colors"></div>
                  {isSpecial && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>}
                  <span className={`text-[19px] font-black z-10 ${!isSpecial ? 'drop-shadow-md' : ''}`}>{c}</span>
                </button>
              )
            })}
          </div>
          
        </div>
      </div>

    </div>
  );
}
