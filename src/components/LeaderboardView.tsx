import React, { useState } from 'react';
import { Player, Match } from '../types';
import { Trophy, Award, Search, Users, ShieldAlert, History, Activity, Swords, Hourglass, Play } from 'lucide-react';

interface LeaderboardViewProps {
  players: Player[];
  matches: Match[];
}

export default function LeaderboardView({ players, matches }: LeaderboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort players by totalPoints desc, then wins desc
  const sortedPlayers = [...players]
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.wins - a.wins;
    });

  const filteredPlayers = sortedPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedMatches = matches.filter(m => m.status === 'completed');

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-sm shadow shadow-amber-500/50">
            🥇
          </span>
        );
      case 1:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-black text-sm shadow shadow-slate-300/50">
            🥈
          </span>
        );
      case 2:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white font-black text-xs shadow shadow-amber-700/50">
            🥉
          </span>
        );
      default:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-700">
            {index + 1}
          </span>
        );
    }
  };

  const getLevelBadgeColor = (level: Player['level']) => {
    switch (level) {
      case 'Advanced':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'Intermediate':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live & Queued Matches Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* Live Matches Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-xs tracking-wider uppercase text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            กำลังแข่งขันสด (Live Matches)
          </h3>
          
          {(() => {
            const activeMatches = matches.filter(m => m.status === 'active');
            if (activeMatches.length === 0) {
              return (
                <div className="py-8 text-center text-slate-500 text-xs">
                  ยังไม่มีการแข่งขันในสนามขณะนี้ 🏸
                </div>
              );
            }
            return (
              <div className="space-y-3.5">
                {activeMatches.map(match => {
                  const namesA = match.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
                  const namesB = match.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
                  return (
                    <div key={match.id} className="p-3 bg-slate-950/70 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                          คอร์ท {match.courtId}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 text-center text-xs">
                        <span className="font-bold text-white truncate max-w-[120px]">{namesA}</span>
                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">VS</span>
                        <span className="font-bold text-white truncate max-w-[120px]">{namesB}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-400/5 border border-rose-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        LIVE
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Queued Matches Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
          <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-xs tracking-wider uppercase text-slate-400">
            <Hourglass className="h-4 w-4 text-amber-400" />
            คิวคอยสนามถัดไป (Waiting Matches)
          </h3>

          {(() => {
            const waitingMatches = matches.filter(m => m.status === 'waiting');
            if (waitingMatches.length === 0) {
              return (
                <div className="py-8 text-center text-slate-500 text-xs">
                  ยังไม่มีจัดคิวคอยแข่งขันขณะนี้ ⏳
                </div>
              );
            }
            return (
              <div className="space-y-3.5">
                {waitingMatches.map((match, idx) => {
                  const namesA = match.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
                  const namesB = match.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่น').join(' + ');
                  return (
                    <div key={match.id} className="p-3 bg-slate-950/70 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                          คิวที่ {idx + 1}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">คอร์ท {match.courtId}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 text-center text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[120px]">{namesA}</span>
                        <span className="text-[9px] text-slate-500 font-mono font-bold">vs</span>
                        <span className="font-semibold text-slate-200 truncate max-w-[120px]">{namesB}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono">
                        QUEUED
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Search and Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Matches Played */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">จำนวนการแข่งขันทั้งหมด</p>
            <h3 className="text-2xl font-black text-white mt-1">{completedMatches.length} แมตช์</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">รวมประเภทเดี่ยวและประเภทคู่</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Lead Player */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">ผู้เล่นคะแนนสูงสุด 👑</p>
            <h3 className="text-xl font-black text-emerald-400 mt-1 truncate max-w-[150px]">
              {sortedPlayers[0]?.name || 'ไม่มี'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{sortedPlayers[0]?.totalPoints || 0} คะแนนรวม</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-center">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 pl-1">ค้นหาผู้เล่น</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="พิมพ์ชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-xs"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-emerald-400" />
            อันดับคะแนนผู้เล่นประจำก๊วน
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
            เรียงตามคะแนนรวมสะสม
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-6 text-center w-16">อันดับ</th>
                <th className="py-3 px-4">ผู้เล่น</th>
                <th className="py-3 px-4 text-center">ระดับ</th>
                <th className="py-3 px-4 text-center">แมตช์</th>
                <th className="py-3 px-4 text-center text-emerald-400">ชนะ</th>
                <th className="py-3 px-4 text-center text-slate-400">เสมอ</th>
                <th className="py-3 px-4 text-center text-rose-400">แพ้</th>
                <th className="py-3 px-4 text-center">อัตราชนะ</th>
                <th className="py-3 px-6 text-right text-emerald-300">คะแนนรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                    ไม่พบข้อมูลผู้เล่นที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const winRate = player.totalMatches > 0 
                    ? ((player.wins / player.totalMatches) * 100).toFixed(0) 
                    : '0';

                  return (
                    <tr key={player.id} className="hover:bg-slate-800/35 transition-colors group">
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex justify-center">{getRankBadge(idx)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80'}
                            alt={player.name}
                            className="h-9 w-9 rounded-full object-cover border border-slate-800 bg-slate-950"
                          />
                          <div>
                            <p className="text-xs group-hover:text-emerald-400 transition-colors">{player.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono">เข้าร่วม: {new Date(player.joinedAt).toLocaleDateString('th-TH')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getLevelBadgeColor(player.level)}`}>
                          {player.level === 'Advanced' ? 'ตบโหด' : player.level === 'Intermediate' ? 'กลางๆ' : 'มือใหม่'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-300 font-mono">
                        {player.totalMatches}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-emerald-400 font-mono">
                        {player.wins}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-slate-400 font-mono">
                        {player.draws}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-rose-400 font-mono">
                        {player.losses}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-300 font-mono">{winRate}%</span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${winRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right text-xs font-extrabold text-emerald-300 font-mono">
                        {player.totalPoints}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
          <History className="h-4.5 w-4.5 text-sky-400" />
          ประวัติการแข่งย้อนหลัง
        </h3>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {completedMatches.length === 0 ? (
            <p className="text-center py-8 text-slate-600 text-xs">ยังไม่มีการบันทึกประวัติการแข่งขัน</p>
          ) : (
            completedMatches.map((match) => {
              const namesA = match.teamA.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่นนิรนาม').join(' + ');
              const namesB = match.teamB.map(id => players.find(p => p.id === id)?.name || 'ผู้เล่นนิรนาม').join(' + ');
              const scoreA = match.scoreA ?? 0;
              const scoreB = match.scoreB ?? 0;

              return (
                <div
                  key={match.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800"
                >
                  {/* Match Type Details */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shrink-0 ${
                      match.type === 'doubles' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    }`}>
                      {match.type === 'doubles' ? 'คู่' : 'เดี่ยว'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">คอร์ท {match.courtId}</span>
                  </div>

                  {/* Battle Display */}
                  <div className="flex-1 flex items-center justify-center gap-4 text-center">
                    <div className="flex-1 text-right truncate">
                      <span className={`text-xs ${match.winner === 'teamA' ? 'font-black text-emerald-400' : 'text-slate-400'}`}>
                        {namesA}
                      </span>
                    </div>

                    <div className="px-3.5 py-1 bg-slate-900 rounded-lg border border-slate-800 font-black text-sm tracking-widest font-mono text-white flex items-center gap-1.5 shrink-0">
                      <span className={match.winner === 'teamA' ? 'text-emerald-400' : 'text-slate-400'}>{scoreA}</span>
                      <span className="text-slate-600">-</span>
                      <span className={match.winner === 'teamB' ? 'text-emerald-400' : 'text-slate-400'}>{scoreB}</span>
                    </div>

                    <div className="flex-1 text-left truncate">
                      <span className={`text-xs ${match.winner === 'teamB' ? 'font-black text-emerald-400' : 'text-slate-400'}`}>
                        {namesB}
                      </span>
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div className="text-[10px] text-slate-500 font-mono text-right shrink-0">
                    {new Date(match.endTime || match.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
