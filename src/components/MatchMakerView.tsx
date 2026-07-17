import React, { useState } from 'react';
import { Player, Match, MatchType, PlayerLevel } from '../types';
import { Play, Check, Users, Swords, Plus, Trash2, Camera, ShieldAlert, Award, Timer, Hourglass } from 'lucide-react';
import CameraCapture from './CameraCapture';

interface MatchMakerViewProps {
  players: Player[];
  matches: Match[];
  isAdmin: boolean;
  onAddPlayer: (player: Omit<Player, 'id' | 'wins' | 'losses' | 'draws' | 'totalMatches' | 'totalPoints' | 'joinedAt'>) => void;
  onStartMatch: (match: Omit<Match, 'id' | 'status' | 'startTime'> & { status?: Match['status'] }) => void;
  onCompleteMatch: (id: string, scoreA: number, scoreB: number, winner: Match['winner']) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'booking' | 'match' | 'expense') => void;
  onUpdateMatchStatus: (id: string, status: Match['status']) => void;
  onCancelMatch: (id: string) => void;
}

export default function MatchMakerView({
  players,
  matches,
  isAdmin,
  onAddPlayer,
  onStartMatch,
  onCompleteMatch,
  onAddNotification,
  onUpdateMatchStatus,
  onCancelMatch
}: MatchMakerViewProps) {
  // Roster form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState<PlayerLevel>('Intermediate');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Match setup form state
  const [courtId, setCourtId] = useState(1);
  const [matchType, setMatchType] = useState<MatchType>('doubles');
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [arrangingCourtId, setArrangingCourtId] = useState<number | null>(null);

  // Score recording states
  const [scoreA, setScoreA] = useState<Record<string, number>>({});
  const [scoreB, setScoreB] = useState<Record<string, number>>({});

  // Player waiting queue
  const [waitingQueue, setWaitingQueue] = useState<string[]>(['p3', 'p4', 'p5', 'p6', 'p7']);

  const activeMatches = matches.filter(m => m.status === 'active');
  const waitingMatches = matches.filter(m => m.status === 'waiting');

  const freePlayers = players.filter(p => 
    p.isActive && 
    !matches.some(m => (m.status === 'active' || m.status === 'waiting') && (m.teamA.includes(p.id) || m.teamB.includes(p.id)))
  );

  const addToQueue = (id: string) => {
    if (!waitingQueue.includes(id)) {
      setWaitingQueue([...waitingQueue, id]);
    }
  };

  const removeFromQueue = (id: string) => {
    setWaitingQueue(waitingQueue.filter(qid => qid !== id));
  };

  const clearQueue = () => {
    setWaitingQueue([]);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newPlayerName.trim()) return;

    onAddPlayer({
      name: newPlayerName.trim(),
      level: newPlayerLevel,
      photoUrl: newPlayerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true
    });

    onAddNotification(
      'เพิ่มผู้เล่นใหม่ 🏸',
      `เพิ่มคุณ ${newPlayerName} ระดับ ${newPlayerLevel === 'Advanced' ? 'ตบโหด' : newPlayerLevel === 'Intermediate' ? 'กลางๆ' : 'มือใหม่'} เข้าสู่ก๊วนสำเร็จ`,
      'info'
    );

    setNewPlayerName('');
    setNewPlayerPhoto('');
    alert('เพิ่มผู้เล่นเข้าก๊วนเรียบร้อยแล้ว!');
  };

  // Smart Auto-matchmaker algorithm
  const handleAutoMatch = () => {
    if (waitingQueue.length < (matchType === 'doubles' ? 4 : 2)) {
      alert(`มีคนในคิวไม่เพียงพอ สำหรับประเภท${matchType === 'doubles' ? 'คู่ (ต้องมีอย่างน้อย 4 คน)' : 'เดี่ยว (ต้องมีอย่างน้อย 2 คน)'}`);
      return;
    }

    const availableIds = [...waitingQueue];
    // Select candidates (first 4 or 2)
    const count = matchType === 'doubles' ? 4 : 2;
    const selectedIds = availableIds.slice(0, count);

    // Filter details
    const selectedPlayers = selectedIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];

    let tA: string[] = [];
    let tB: string[] = [];

    if (matchType === 'singles') {
      tA = [selectedPlayers[0].id];
      tB = [selectedPlayers[1].id];
    } else {
      // Sort candidates by level to balance them
      // Advanced = 3, Intermediate = 2, Beginner = 1
      const scoreMap = { 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
      const sorted = [...selectedPlayers].sort((a, b) => scoreMap[b.level] - scoreMap[a.level]);

      // Balance Team A: [1st, 4th], Team B: [2nd, 3rd]
      tA = [sorted[0].id, sorted[3].id];
      tB = [sorted[1].id, sorted[2].id];
    }

    setTeamA(tA);
    setTeamB(tB);
    alert('จัดทีมสมดุลอัตโนมัติสำเร็จ! สามารถตรวจสอบและกด "เริ่มแมตช์" ได้ทันที');
  };

  const handleStartMatchSubmit = (status: Match['status'] = 'active') => {
    if (teamA.length === 0 || teamB.length === 0) {
      alert('กรุณาเลือกผู้เล่นสำหรับทั้งสองทีม');
      return;
    }

    const requiredCount = matchType === 'doubles' ? 2 : 1;
    if (teamA.length !== requiredCount || teamB.length !== requiredCount) {
      alert(`ประเภท ${matchType === 'doubles' ? 'คู่ (ต้องมีทีมละ 2 คน)' : 'เดี่ยว (ต้องมีทีมละ 1 คน)'}`);
      return;
    }

    // Check overlap on courts (only if starting immediately)
    if (status === 'active') {
      const courtBusy = activeMatches.some(m => m.courtId === courtId);
      if (courtBusy) {
        alert(`คอร์ทที่ ${courtId} กำลังมีการแข่งขัน กรุณาบันทึกผลแมตช์เดิมก่อน หรือเลือกจัดคิวรอแข่ง ⏳`);
        return;
      }
    }

    onStartMatch({
      type: matchType,
      courtId,
      teamA,
      teamB,
      status
    });

    onAddNotification(
      status === 'active' ? 'เริ่มแมตช์ใหม่แล้ว 🚀' : 'จัดคู่แข่งขันใส่คิว ⏳',
      `คอร์ท ${courtId}: ${status === 'active' ? 'เริ่มการแข่งขันทันที' : 'จัดลงในระบบคิวเรียบร้อย'}ประเภท${matchType === 'doubles' ? 'คู่' : 'เดี่ยว'}!`,
      'match'
    );

    // Remove from waiting queue
    const allPlaying = [...teamA, ...teamB];
    setWaitingQueue(waitingQueue.filter(id => !allPlaying.includes(id)));

    // Clear form
    setTeamA([]);
    setTeamB([]);
  };

  const handleCompleteMatchSubmit = (id: string) => {
    const sA = scoreA[id] ?? 0;
    const sB = scoreB[id] ?? 0;

    let winner: Match['winner'] = 'draw';
    if (sA > sB) winner = 'teamA';
    else if (sB > sA) winner = 'teamB';

    onCompleteMatch(id, sA, sB, winner);

    // Clear local inputs
    const match = activeMatches.find(m => m.id === id);
    if (match) {
      onAddNotification(
        'บันทึกผลการแข่งสำเร็จ 🏆',
        `คอร์ท ${match.courtId}: ผลคะแนนจบลงที่ ${sA} - ${sB} คะแนนอัปเดตสู่อันดับคะแนนเรียบร้อย!`,
        'match'
      );
    }
  };

  const toggleSelectPlayer = (id: string, team: 'A' | 'B') => {
    const limit = matchType === 'doubles' ? 2 : 1;
    if (team === 'A') {
      if (teamA.includes(id)) {
        setTeamA(teamA.filter(pid => pid !== id));
      } else {
        if (teamA.length >= limit) return;
        setTeamA([...teamA, id]);
      }
    } else {
      if (teamB.includes(id)) {
        setTeamB(teamB.filter(pid => pid !== id));
      } else {
        if (teamB.length >= limit) return;
        setTeamB([...teamB, id]);
      }
    }
  };

  const handleStartInlineMatch = (cId: number, status: Match['status'] = 'active') => {
    if (teamA.length === 0 || teamB.length === 0) {
      alert('กรุณาเลือกผู้เล่นสำหรับทั้งสองทีม');
      return;
    }

    const requiredCount = matchType === 'doubles' ? 2 : 1;
    if (teamA.length !== requiredCount || teamB.length !== requiredCount) {
      alert(`ประเภท ${matchType === 'doubles' ? 'คู่ (ต้องมีทีมละ 2 คน)' : 'เดี่ยว (ต้องมีทีมละ 1 คน)'}`);
      return;
    }

    onStartMatch({
      type: matchType,
      courtId: cId,
      teamA,
      teamB,
      status
    });

    onAddNotification(
      status === 'active' ? 'เริ่มแมตช์ใหม่แล้ว 🚀' : 'จัดคู่แข่งขันใส่คิว ⏳',
      `คอร์ท ${cId}: ${status === 'active' ? 'เริ่มการแข่งขันทันที' : 'จัดลงในระบบคิวเรียบร้อย'}ประเภท${matchType === 'doubles' ? 'คู่' : 'เดี่ยว'}!`,
      'match'
    );

    // Remove from waiting queue
    const allPlaying = [...teamA, ...teamB];
    setWaitingQueue(waitingQueue.filter(id => !allPlaying.includes(id)));

    // Clear form and reset inline state
    setTeamA([]);
    setTeamB([]);
    setArrangingCourtId(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Visual Badminton Courts (Professional Court Layout Pattern) */}
      <div>
        <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-base">
          <Timer className="h-5 w-5 text-emerald-400" />
          สถานะสนามและการแข่งขันสด (Badminton Court Status)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((courtNum) => {
            const activeMatch = activeMatches.find(m => m.courtId === courtNum);
            const isBusy = !!activeMatch;
            const isArranging = arrangingCourtId === courtNum;

            return (
              <div 
                key={courtNum} 
                className={`relative rounded-3xl p-4.5 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  isArranging 
                    ? 'bg-slate-900 border-2 border-amber-500/80 min-h-[460px]' 
                    : 'bg-emerald-950 border border-emerald-500/30 min-h-[380px]'
                }`}
              >
                {/* Court Visual lines layout - only show when not arranging to keep layout clean */}
                {!isArranging && (
                  <div className="absolute inset-2 border-2 border-emerald-400/25 pointer-events-none rounded-xl">
                    {/* Outer double bounds line */}
                    <div className="absolute inset-1 border border-emerald-400/15"></div>
                    {/* Net line in the center */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-300/40"></div>
                    {/* Left-Right Half Center Lines */}
                    <div className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 border-l border-emerald-400/15"></div>
                    <div className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 border-l border-emerald-400/15"></div>
                    {/* Service Court Short Lines */}
                    <div className="absolute top-1/4 inset-x-0 border-b border-emerald-400/20"></div>
                    <div className="absolute bottom-1/4 inset-x-0 border-t border-emerald-400/20"></div>
                  </div>
                )}

                {isArranging ? (
                  // Inline arrangement setup console (Requested by user)
                  <div className="relative z-10 flex flex-col flex-1 justify-between h-full space-y-3">
                    {/* Arrangement Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                      <span className="text-[11px] font-black text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-xl border border-amber-500/20 font-mono">
                        จัดคู่ คอร์ท {courtNum}
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setArrangingCourtId(null);
                          setTeamA([]);
                          setTeamB([]);
                        }}
                        className="text-[9px] text-slate-400 hover:text-white font-extrabold bg-slate-800 px-2 py-1 rounded border border-slate-700 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>

                    {/* Match Type Select */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMatchType('singles');
                          setTeamA([]);
                          setTeamB([]);
                        }}
                        className={`py-1 rounded-lg text-[9px] font-black transition ${
                          matchType === 'singles' 
                            ? 'bg-amber-500 text-slate-950 font-extrabold' 
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        เดี่ยว (1v1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchType('doubles');
                          setTeamA([]);
                          setTeamB([]);
                        }}
                        className={`py-1 rounded-lg text-[9px] font-black transition ${
                          matchType === 'doubles' 
                            ? 'bg-amber-500 text-slate-950 font-extrabold' 
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        คู่ (2v2)
                      </button>
                    </div>

                    {/* Interactive Team Slots */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Team A Slots */}
                      <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                        <p className="text-[8px] text-slate-500 font-bold mb-1 uppercase text-center">ทีม A</p>
                        <div className="space-y-1">
                          {Array.from({ length: matchType === 'doubles' ? 2 : 1 }).map((_, idx) => {
                            const pid = teamA[idx];
                            const player = players.find(p => p.id === pid);
                            return player ? (
                              <div key={idx} className="flex items-center justify-between p-1 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-1 truncate max-w-[80%]">
                                  <img src={player.photoUrl} className="h-4 w-4 rounded-full object-cover" />
                                  <span className="text-[9px] text-white truncate font-black">{player.name}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setTeamA(teamA.filter(id => id !== player.id))}
                                  className="text-[8px] text-slate-500 hover:text-red-400 px-1 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div key={idx} className="py-1 border border-dashed border-slate-800 rounded-lg text-center text-[7.5px] text-slate-600">
                                ว่าง
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Team B Slots */}
                      <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                        <p className="text-[8px] text-slate-500 font-bold mb-1 uppercase text-center">ทีม B</p>
                        <div className="space-y-1">
                          {Array.from({ length: matchType === 'doubles' ? 2 : 1 }).map((_, idx) => {
                            const pid = teamB[idx];
                            const player = players.find(p => p.id === pid);
                            return player ? (
                              <div key={idx} className="flex items-center justify-between p-1 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-1 truncate max-w-[80%]">
                                  <img src={player.photoUrl} className="h-4 w-4 rounded-full object-cover" />
                                  <span className="text-[9px] text-white truncate font-black">{player.name}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setTeamB(teamB.filter(id => id !== player.id))}
                                  className="text-[8px] text-slate-500 hover:text-red-400 px-1 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div key={idx} className="py-1 border border-dashed border-slate-800 rounded-lg text-center text-[7.5px] text-slate-600">
                                ว่าง
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Free available players list */}
                    <div className="flex-1 flex flex-col bg-slate-950/60 rounded-xl border border-slate-850 p-2 h-[150px]">
                      <p className="text-[8.5px] text-slate-400 font-bold mb-1.5 uppercase px-0.5">เลือกคนว่างลงสนาม 🏸</p>
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                        {freePlayers.length === 0 ? (
                          <p className="text-center py-6 text-[9px] text-slate-600">ไม่มีผู้เล่นว่างในคิว</p>
                        ) : (
                          freePlayers.map((player) => {
                            const inA = teamA.includes(player.id);
                            const inB = teamB.includes(player.id);
                            const isSelected = inA || inB;

                            return (
                              <div key={player.id} className={`flex items-center justify-between p-1 bg-slate-900/80 rounded-xl border transition ${
                                isSelected ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-850'
                              }`}>
                                <div className="flex items-center gap-1.5 truncate max-w-[50%]">
                                  <img src={player.photoUrl} className="h-5.5 w-5.5 rounded-full object-cover border border-slate-800" />
                                  <div className="truncate">
                                    <p className="text-[9px] font-black text-slate-200 truncate leading-tight">{player.name}</p>
                                    <p className="text-[7.5px] text-slate-500 font-bold leading-none">{player.level === 'Advanced' ? 'ตบโหด' : player.level === 'Intermediate' ? 'ทั่วไป' : 'มือใหม่'}</p>
                                  </div>
                                </div>

                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    disabled={isSelected && !inA}
                                    onClick={() => {
                                      if (inA) {
                                        setTeamA(teamA.filter(id => id !== player.id));
                                      } else {
                                        const limit = matchType === 'doubles' ? 2 : 1;
                                        if (teamA.length >= limit) return;
                                        setTeamA([...teamA, player.id]);
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 text-[8px] font-black rounded transition ${
                                      inA 
                                        ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                                        : isSelected 
                                          ? 'bg-slate-950 text-slate-600 cursor-not-allowed' 
                                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                    }`}
                                  >
                                    {inA ? 'ออก' : '+ ทีม A'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSelected && !inB}
                                    onClick={() => {
                                      if (inB) {
                                        setTeamB(teamB.filter(id => id !== player.id));
                                      } else {
                                        const limit = matchType === 'doubles' ? 2 : 1;
                                        if (teamB.length >= limit) return;
                                        setTeamB([...teamB, player.id]);
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 text-[8px] font-black rounded transition ${
                                      inB 
                                        ? 'bg-indigo-500 text-white font-extrabold' 
                                        : isSelected 
                                          ? 'bg-slate-950 text-slate-600 cursor-not-allowed' 
                                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                    }`}
                                  >
                                    {inB ? 'ออก' : '+ ทีม B'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Launch or Queue Match Buttons */}
                    <div className="flex flex-col gap-1.5">
                      {!matches.some(m => m.courtId === courtNum && m.status === 'active') ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartInlineMatch(courtNum, 'active')}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Play className="h-3.5 w-3.5" /> เริ่มแข่งทันที 🚀
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartInlineMatch(courtNum, 'waiting')}
                            className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/20 font-black rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Hourglass className="h-3 w-3" /> จัดคู่ใส่คิวรอแข่ง ⏳
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartInlineMatch(courtNum, 'waiting')}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Hourglass className="h-3.5 w-3.5" /> จัดคู่ใส่คิวรอแข่ง ⏳
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Normal View: Busy or Empty Court
                  <>
                    {/* Court Header badge & status indicator */}
                    <div className="relative z-10 flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/20 font-mono">
                        คอร์ท {courtNum}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isBusy 
                          ? 'bg-amber-400 text-slate-950 animate-pulse font-extrabold' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isBusy ? '● กำลังแข่ง' : 'ว่าง'}
                      </span>
                    </div>

                    {/* Court Area */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center my-2">
                      {isBusy ? (
                        // Busy state layout
                        <div className="space-y-3.5">
                          {/* Team A (Top half of the court) */}
                          <div className="text-center p-3 bg-slate-950/85 rounded-2xl border border-slate-800/80 backdrop-blur-xs shadow">
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">ทีม A</p>
                            <p className="text-xs font-black text-slate-100 truncate">
                              {activeMatch.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ')}
                            </p>
                          </div>

                          {/* Net/VS separator */}
                          <div className="relative flex items-center justify-center py-1">
                            <div className="absolute inset-x-4 border-t border-emerald-400/20"></div>
                            <span className="relative bg-emerald-950 px-3 py-1 border border-emerald-400/30 rounded-full text-[9px] font-black text-amber-300 uppercase tracking-widest backdrop-blur-xs">
                              VS
                            </span>
                          </div>

                          {/* Team B (Bottom half of the court) */}
                          <div className="text-center p-3 bg-slate-950/85 rounded-2xl border border-slate-800/80 backdrop-blur-xs shadow">
                            <p className="text-xs font-black text-slate-100 truncate">
                              {activeMatch.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ')}
                            </p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">ทีม B</p>
                          </div>

                          {/* Court specific waiting list */}
                          {(() => {
                            const courtWaiting = matches.filter(m => m.courtId === courtNum && m.status === 'waiting');
                            if (courtWaiting.length === 0) return null;
                            return (
                              <div className="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-850 text-left">
                                <p className="text-[7.5px] text-amber-400 font-bold uppercase mb-1 flex items-center gap-1">
                                  <Hourglass className="h-2.5 w-2.5" /> คิวถัดไปของคอร์ทนี้ ({courtWaiting.length})
                                </p>
                                <div className="space-y-1 max-h-[70px] overflow-y-auto custom-scrollbar">
                                  {courtWaiting.map((m) => {
                                    const tANames = m.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join('+');
                                    const tBNames = m.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join('+');
                                    return (
                                      <div key={m.id} className="text-[8px] text-slate-300 flex justify-between gap-1 items-center">
                                        <span className="truncate flex-1 font-semibold">{tANames} vs {tBNames}</span>
                                        {isAdmin && onCancelMatch && (
                                          <button
                                            type="button"
                                            onClick={() => onCancelMatch(m.id)}
                                            className="text-[7px] text-rose-400 hover:text-rose-300 font-black cursor-pointer bg-slate-900 px-1 py-0.5 rounded border border-slate-800"
                                          >
                                            ลบ
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        // Free court state with giant + button requested by user
                        <div className="flex flex-col items-center justify-center p-4">
                          <button
                            type="button"
                            onClick={() => {
                              setCourtId(courtNum);
                              setArrangingCourtId(courtNum);
                              setTeamA([]);
                              setTeamB([]);
                              
                              // Notify user
                              onAddNotification(
                                `จัดคู่ คอร์ทที่ ${courtNum} 🏸`,
                                `เลือกจัดคู่สำหรับคอร์ทที่ ${courtNum} แล้ว คุณสามารถเลือกสมาชิกผู้เล่นที่ว่างอยู่ได้ทันที`,
                                'info'
                              );
                            }}
                            className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
                            title="จัดคู่ลงสนามนี้"
                          >
                            <Plus className="h-9 w-9 transition-transform group-hover:rotate-90" />
                          </button>
                          <p className="text-xs font-black text-emerald-400/70 mt-3 text-center">สนามว่าง</p>
                          <p className="text-[10px] text-emerald-500/60 mt-1 text-center">กดปุ่ม + เพื่อจัดผู้เล่นลงสนามนี้</p>
                        </div>
                      )}
                    </div>

                    {/* Score panel if busy */}
                    {isBusy && (
                      <div className="relative z-10 bg-slate-950/95 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-xs mt-3 shadow-inner">
                        <div className="grid grid-cols-2 gap-3 mb-2.5">
                          <div className="text-center">
                            <label className="block text-[8px] text-slate-500 font-bold mb-1">คะแนนทีม A</label>
                            <input
                              type="number"
                              disabled={!isAdmin}
                              placeholder="0"
                              value={scoreA[activeMatch.id] ?? ''}
                              onChange={(e) => setScoreA({ ...scoreA, [activeMatch.id]: Number(e.target.value) })}
                              className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-center text-sm font-black text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>

                          <div className="text-center">
                            <label className="block text-[8px] text-slate-500 font-bold mb-1">คะแนนทีม B</label>
                            <input
                              type="number"
                              disabled={!isAdmin}
                              placeholder="0"
                              value={scoreB[activeMatch.id] ?? ''}
                              onChange={(e) => setScoreB({ ...scoreB, [activeMatch.id]: Number(e.target.value) })}
                              className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-center text-sm font-black text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        {isAdmin ? (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => handleCompleteMatchSubmit(activeMatch.id)}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 active:scale-95"
                            >
                              <Check className="h-3.5 w-3.5" /> จบรอบและบันทึกสถิติ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCourtId(courtNum);
                                setArrangingCourtId(courtNum);
                                setTeamA([]);
                                setTeamB([]);
                              }}
                              className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-amber-500/25 text-amber-400 rounded-xl text-[9px] font-bold transition flex items-center justify-center gap-1 active:scale-95"
                            >
                              <Plus className="h-3 w-3" /> จัดคู่รอคิวถัดไป ⏳
                            </button>
                          </div>
                        ) : (
                          <p className="text-[8px] text-slate-500 text-center py-1">เข้าสู่ระบบแอดมินเพื่อจดบันทึกคะแนน</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting Matches Admin Control Panel */}
      {waitingMatches.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
            <Hourglass className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
            คิวที่จัดแล้วรอแข่ง ({waitingMatches.length} คู่)
            <span className="text-[10px] text-slate-500 font-normal">แอดมินสามารถเริ่มลงสนาม หรือลบคิวเพื่อคืนผู้เล่นได้</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingMatches.map((match, idx) => {
              const teamANames = match.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
              const teamBNames = match.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
              const isCourtBusy = activeMatches.some(am => am.courtId === match.courtId);

              return (
                <div key={match.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col justify-between gap-3 relative overflow-hidden shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/10 font-mono">
                      คิวที่ {idx + 1} • คอร์ท {match.courtId}
                    </span>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                      isCourtBusy ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 animate-pulse'
                    }`}>
                      {isCourtBusy ? 'คอร์ทติดแข่งอยู่' : 'คอร์ทว่างแล้ว! 🟢'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 py-1">
                    <p className="font-semibold text-slate-300">
                      <span className="text-emerald-400">ทีม A:</span> {teamANames}
                    </p>
                    <p className="font-semibold text-slate-300">
                      <span className="text-indigo-400">ทีม B:</span> {teamBNames}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-1">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          disabled={isCourtBusy}
                          onClick={() => {
                            if (isCourtBusy) {
                              alert(`คอร์ท ${match.courtId} กำลังมีการแข่งขัน กรุณาบันทึกผลแมตช์เดิมก่อน!`);
                              return;
                            }
                            if (onUpdateMatchStatus) {
                              onUpdateMatchStatus(match.id, 'active');
                              onAddNotification(
                                'เรียกคิวแข่งขันลงสนาม! 🏸',
                                `คอร์ท ${match.courtId} เริ่มการแข่งขันคิวของ ${teamANames} vs ${teamBNames} แล้ว!`,
                                'match'
                              );
                            }
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition flex items-center justify-center gap-1 ${
                            isCourtBusy 
                              ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed' 
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          <Play className="h-3 w-3" /> เริ่มลงสนามแข่ง
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onCancelMatch) {
                              onCancelMatch(match.id);
                              // Return players to waitlist queue for convenience
                              const returned = [...match.teamA, ...match.teamB];
                              const uniqueReturned = returned.filter(rid => !waitingQueue.includes(rid));
                              setWaitingQueue(prev => [...prev, ...uniqueReturned]);
                              onAddNotification(
                                'ยกเลิกคิวจัดคู่แข่งขัน 🛑',
                                `ยกเลิกคิวคอร์ท ${match.courtId} คืนผู้เล่นกลับสู่รายชื่อพร้อมคอย`,
                                'info'
                              );
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 hover:text-rose-400 text-slate-500 border border-slate-800 rounded-lg text-[9px] font-bold transition"
                        >
                          ลบคิว
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matchmaker Panel */}
        <div id="matchmaker-setup-panel" className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">จัดผู้เล่นลงสนาม</h3>
              <p className="text-xs text-slate-500 mt-0.5">เลือกรูปแบบ คอร์ท และสมาชิกเพื่อแมตช์ทีม</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMatchType('singles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  matchType === 'singles' ? 'bg-indigo-500/15 border-indigo-400 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                เดี่ยว
              </button>
              <button
                onClick={() => setMatchType('doubles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  matchType === 'doubles' ? 'bg-indigo-500/15 border-indigo-400 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                คู่
              </button>
            </div>
          </div>

          {/* Form setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เลือกคอร์ทว่าง</label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>คอร์ท 1 (ว่าง)</option>
                <option value={2}>คอร์ท 2 (ว่าง)</option>
                <option value={3}>คอร์ท 3 (ว่าง)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAutoMatch}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500 hover:to-teal-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow"
              >
                <Swords className="h-4.5 w-4.5" />
                จัดทีมสมดุลอัตโนมัติ (Smart Matchmaker)
              </button>
            </div>
          </div>

          {/* Grid to choose players from waiting list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400">เลือกผู้เล่นจากคิว</span>
              <span className="text-[10px] text-slate-500 font-mono">คิวยังว่าง {waitingQueue.length} คน</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {waitingQueue.map((id) => {
                const player = players.find(p => p.id === id);
                if (!player) return null;

                const inA = teamA.includes(id);
                const inB = teamB.includes(id);

                return (
                  <div
                    key={id}
                    className="p-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2 relative group"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-800 bg-slate-950"
                      />
                      <span className="text-[10px] font-bold text-slate-200 truncate">{player.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <button
                        onClick={() => toggleSelectPlayer(id, 'A')}
                        className={`py-1 text-[8px] font-black rounded ${
                          inA ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        +ทีม A
                      </button>
                      <button
                        onClick={() => toggleSelectPlayer(id, 'B')}
                        className={`py-1 text-[8px] font-black rounded ${
                          inB ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        +ทีม B
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <p className="text-xs font-bold text-slate-300">ความพร้อมของการแข่ง</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="text-emerald-400">ทีม A: {teamA.map(id => players.find(p => p.id === id)?.name).join(', ') || 'ยังไม่ได้เลือก'}</span>
                <span className="text-slate-600">|</span>
                <span className="text-indigo-400">ทีม B: {teamB.map(id => players.find(p => p.id === id)?.name).join(', ') || 'ยังไม่ได้เลือก'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleStartMatchSubmit('active')}
                className="w-full sm:w-auto py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition duration-200 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Play className="h-4 w-4" /> เริ่มแข่งทันที 🚀
              </button>
              <button
                onClick={() => handleStartMatchSubmit('waiting')}
                className="w-full sm:w-auto py-2 px-4 bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/20 font-black rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Hourglass className="h-4 w-4" /> จัดใส่คิวรอแข่ง ⏳
              </button>
            </div>
          </div>
        </div>

        {/* Waiting Queue & Add Player */}
        <div className="space-y-6">
          {/* Queue management */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-emerald-400" />
                ลำดับคิวรอสนาม
              </h3>
              <button
                onClick={clearQueue}
                className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
              >
                เคลียร์คิว
              </button>
            </div>

            {/* List players in queue */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {waitingQueue.length === 0 ? (
                <p className="text-center py-6 text-slate-600 text-xs">คิวว่างเปล่าในขณะนี้</p>
              ) : (
                waitingQueue.map((id, index) => {
                  const player = players.find(p => p.id === id);
                  if (!player) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="h-6 w-6 rounded-full object-cover border border-slate-800"
                        />
                        <span className="text-xs text-slate-200 font-semibold">{player.name}</span>
                      </div>
                      <button
                        onClick={() => removeFromQueue(id)}
                        className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <hr className="border-slate-800" />

            {/* Add player to queue option */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">เลือกเพิ่มคนเข้าคิว</label>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                {players
                  .filter(p => !waitingQueue.includes(p.id) && !activeMatches.some(m => m.teamA.includes(p.id) || m.teamB.includes(p.id)))
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToQueue(p.id)}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800/80 hover:border-emerald-500/30 text-[10px] text-slate-300 hover:text-emerald-400 rounded-lg transition"
                    >
                      + {p.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Add member form (Admin restricted) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-1.5">
              <Plus className="h-5 w-5 text-emerald-400" />
              เพิ่มสมาชิกก๊วนแบด
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              สิทธิ์จัดการสมาชิกเฉพาะแอดมินกลุ่ม ศุกร์หรรษา เท่านั้น
            </p>

            {!isAdmin ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3.5 flex flex-col items-center text-center gap-2">
                <ShieldAlert className="h-6.5 w-6.5 text-amber-500" />
                <p className="text-[10px] leading-tight">คุณไม่ได้รับสิทธิ์แอดมิน เพื่อเพิ่มผู้เล่นโปรดล็อกอินด้วย joe.nana.hanza8@gmail.com</p>
              </div>
            ) : (
              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ชื่อผู้เล่นใหม่</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เจ้กอล์ฟ, ดิว..."
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ระดับฝีมือ</label>
                    <select
                      value={newPlayerLevel}
                      onChange={(e) => setNewPlayerLevel(e.target.value as PlayerLevel)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Beginner">มือใหม่</option>
                      <option value="Intermediate">กลางๆ</option>
                      <option value="Advanced">ตบโหด (ตบกระจุย)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-400 rounded-xl transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-4 w-4" />
                      เปิดกล้องถ่ายภาพ
                    </button>
                  </div>
                </div>

                {newPlayerPhoto && (
                  <div className="relative h-16 w-16 mx-auto rounded-full overflow-hidden border border-emerald-500/30">
                    <img src={newPlayerPhoto} alt="Captured preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPlayerPhoto('')}
                      className="absolute inset-0 bg-black/60 text-white font-black text-[9px] flex items-center justify-center hover:opacity-150 transition"
                    >
                      ลบออก
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition duration-200 shadow shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มเข้าระบบและเริ่มเล่น
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(base64) => setNewPlayerPhoto(base64)}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
