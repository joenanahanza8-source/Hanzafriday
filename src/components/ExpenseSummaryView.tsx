import React, { useState, useEffect } from 'react';
import { Player, Booking, Match } from '../types';
import { DollarSign, Percent, Users, Check, CreditCard, RefreshCw, AlertCircle, Swords, Search } from 'lucide-react';
import PromptPayQR from './PromptPayQR';

interface ExpenseSummaryViewProps {
  players: Player[];
  bookings: Booking[];
  matches: Match[];
  isAdmin: boolean;
  onAddNotification: (title: string, body: string, type: 'info' | 'booking' | 'match' | 'expense') => void;
  isVisitorOnly?: boolean;
}

export default function ExpenseSummaryView({
  players,
  bookings,
  matches,
  isAdmin,
  onAddNotification,
  isVisitorOnly = false
}: ExpenseSummaryViewProps) {
  // New customized rates requested by the user
  const [courtFeeRate, setCourtFeeRate] = useState(30); // Court fee per person (Baht)
  const [shuttlecockMatchRate, setShuttlecockMatchRate] = useState(25); // Shuttlecock fee per person per match (Baht)
  
  // Classic mode configurations
  const [shuttlecockPrice, setShuttlecockPrice] = useState(80); // price per piece / tube
  const [shuttlecocksUsed, setShuttlecocksUsed] = useState(6); // count
  
  // Default to the new custom standard formula requested by user
  const [divisionMethod, setDivisionMethod] = useState<'standard' | 'equal' | 'custom'>('standard');
  
  // Custom hours played per player (default to 2 hours, for classic custom mode)
  const [playerHours, setPlayerHours] = useState<Record<string, number>>({});
  // Paid status local tracking
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

  // Active players in this session (default to all active players)
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>(
    players.filter(p => p.isActive).map(p => p.id)
  );

  // Selected player for PromptPay modal
  const [selectedPayment, setSelectedPayment] = useState<{ playerName: string, playerId: string, amount: number } | null>(null);

  // Search filter for payments list
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize player hours
  useEffect(() => {
    const hours: Record<string, number> = {};
    players.forEach(p => {
      hours[p.id] = 2; // Default 2 hours
    });
    setPlayerHours(hours);
  }, [players]);

  // Calculate total court cost from confirmed bookings for today/selected day (e.g., 2026-07-17)
  const todayBookings = bookings.filter(b => b.date === '2026-07-17' && b.status === 'confirmed');
  const actualCourtCost = todayBookings.reduce((sum, b) => {
    const hours = b.endHour - b.startHour;
    return sum + (hours * b.hourlyRate);
  }, 0);

  // Classic total costs
  const totalShuttlecockCostClassic = shuttlecockPrice * shuttlecocksUsed;
  const totalSessionCostClassic = actualCourtCost + totalShuttlecockCostClassic;

  // Toggle active player for session division
  const togglePlayerActive = (id: string) => {
    if (activePlayerIds.includes(id)) {
      if (activePlayerIds.length <= 1) return; // Must have at least one player
      setActivePlayerIds(activePlayerIds.filter(pid => pid !== id));
    } else {
      setActivePlayerIds([...activePlayerIds, id]);
    }
  };

  const handleHourChange = (id: string, hours: number) => {
    setPlayerHours({
      ...playerHours,
      [id]: Math.max(0, hours)
    });
  };

  // Calculate final individual expense
  const calculateIndividualExpenses = () => {
    const result: { playerId: string; playerName: string; courtAmount: number; shuttleAmount: number; amount: number }[] = [];
    
    if (activePlayerIds.length === 0) return [];

    if (divisionMethod === 'standard') {
      activePlayerIds.forEach(id => {
        const player = players.find(p => p.id === id);
        if (player) {
          // Count matches played by this player in the current session matches list
          const playerMatches = matches.filter(m => m.teamA.includes(id) || m.teamB.includes(id));
          const matchesCount = playerMatches.length;
          
          const courtAmount = courtFeeRate;
          const shuttleAmount = shuttlecockMatchRate * matchesCount;
          const amount = courtAmount + shuttleAmount;

          result.push({
            playerId: id,
            playerName: player.name,
            courtAmount,
            shuttleAmount,
            amount
          });
        }
      });
    } else if (divisionMethod === 'equal') {
      const share = totalSessionCostClassic / activePlayerIds.length;
      const courtShare = actualCourtCost / activePlayerIds.length;
      const shuttleShare = totalShuttlecockCostClassic / activePlayerIds.length;
      
      activePlayerIds.forEach(id => {
        const player = players.find(p => p.id === id);
        if (player) {
          result.push({
            playerId: id,
            playerName: player.name,
            courtAmount: courtShare,
            shuttleAmount: shuttleShare,
            amount: share
          });
        }
      });
    } else {
      // Divide court cost and shuttlecock proportionally to hours played
      const totalHoursPlayed = activePlayerIds.reduce((sum, id) => sum + (playerHours[id] || 0), 0);
      
      activePlayerIds.forEach(id => {
        const player = players.find(p => p.id === id);
        if (player) {
          const hours = playerHours[id] || 0;
          const proportion = totalHoursPlayed > 0 ? (hours / totalHoursPlayed) : 0;
          const share = proportion * totalSessionCostClassic;
          const courtShare = proportion * actualCourtCost;
          const shuttleShare = proportion * totalShuttlecockCostClassic;
            
          result.push({
            playerId: id,
            playerName: player.name,
            courtAmount: courtShare,
            shuttleAmount: shuttleShare,
            amount: share
          });
        }
      });
    }

    return result;
  };

  const expenses = calculateIndividualExpenses();

  // Calculate totals based on calculated expenses
  const totalCourtCollected = expenses.reduce((sum, e) => sum + e.courtAmount, 0);
  const totalShuttleCollected = expenses.reduce((sum, e) => sum + e.shuttleAmount, 0);
  const totalSessionCollected = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleTogglePaid = (id: string) => {
    if (!isAdmin) return;
    setPaidStatus({
      ...paidStatus,
      [id]: !paidStatus[id]
    });
  };

  const handleAnnounceExpenses = () => {
    if (!isAdmin) return;
    const finalCost = divisionMethod === 'standard' ? totalSessionCollected : totalSessionCostClassic;
    onAddNotification(
      'ประกาศเรียกเก็บค่าสนามก๊วน 📢',
      `สรุปยอดค่าใช้จ่ายรวม ฿${finalCost.toFixed(2)} ตามกฎก๊วนศุกร์หรรษา เรียบร้อยแล้ว สมาชิกทุกคนโปรดตรวจสอบหน้าสรุปเพื่อสแกนจ่ายคิวอาร์`,
      'expense'
    );
    alert('ส่งสัญญาณเตือนสรุปค่าใช้จ่ายไปยังสมาชิกสำเร็จ!');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Overview stats (Professional Polish Light Theme styling) */}
      {!isVisitorOnly && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">ค่าสนามคอร์ทรวม</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ฿{(divisionMethod === 'standard' ? totalCourtCollected : actualCourtCost).toFixed(2)}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {divisionMethod === 'standard' 
                  ? `เก็บคงที่คนละ ฿${courtFeeRate} x ${activePlayerIds.length} คน`
                  : `อ้างอิงราคาจองสนามจริง`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ค่าลูกแบดมินตันรวม</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ฿{(divisionMethod === 'standard' ? totalShuttleCollected : totalShuttlecockCostClassic).toFixed(2)}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {divisionMethod === 'standard'
                  ? `คิดจาก ฿${shuttlecockMatchRate}/นัด ตามจำนวนแมตช์ที่เล่น`
                  : `ลูกละ ฿${shuttlecockPrice} x ${shuttlecocksUsed} ลูก`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Percent className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-md ring-1 ring-emerald-500/5">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">ยอดรวมก๊วนที่เรียกเก็บได้</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ฿{(divisionMethod === 'standard' ? totalSessionCollected : totalSessionCostClassic).toFixed(2)}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                แบ่งสรุปรายบุคคลทั้งหมด {activePlayerIds.length} คนที่มาเล่น
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      <div className={isVisitorOnly ? "w-full max-w-4xl mx-auto" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        {/* Cost Variables Setup */}
        {!isVisitorOnly && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 h-fit text-slate-800">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <RefreshCw className="h-4.5 w-4.5 text-emerald-600" />
              ตั้งค่าตัวแปรการคำนวณ
            </h3>

            {/* Division Method Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">วิธีหารค่าใช้จ่าย</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setDivisionMethod('standard')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                    divisionMethod === 'standard'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>ก๊วนศุกร์หรรษา (฿30 + ฿25/นัด)</span>
                  {divisionMethod === 'standard' && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setDivisionMethod('equal')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                    divisionMethod === 'equal'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>หารเฉลี่ยเท่ากันทุกบาท</span>
                  {divisionMethod === 'equal' && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setDivisionMethod('custom')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                    divisionMethod === 'custom'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>หารตาม ชม. เล่นจริง</span>
                  {divisionMethod === 'custom' && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Dynamic Rate Editors depending on selected method */}
            {divisionMethod === 'standard' ? (
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-700">ปรับอัตราค่าใช้จ่ายก๊วน:</p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ค่าสนามคงที่ (บาท/คน)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">฿</span>
                    <input
                      type="number"
                      value={courtFeeRate}
                      onChange={(e) => setCourtFeeRate(Number(e.target.value))}
                      className="w-full pl-7 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ค่าลูกแบด (บาท/คน/นัด)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">฿</span>
                    <input
                      type="number"
                      value={shuttlecockMatchRate}
                      onChange={(e) => setShuttlecockMatchRate(Number(e.target.value))}
                      className="w-full pl-7 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-700">ปรับราคาลูกแบดมินตันส่วนกลาง:</p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ราคาลูกแบด (บาท/ลูก)</label>
                  <input
                    type="number"
                    value={shuttlecockPrice}
                    onChange={(e) => setShuttlecockPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนลูกที่ใช้ (ลูก)</label>
                  <input
                    type="number"
                    value={shuttlecocksUsed}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Toggle Active Players List */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ผู้เล่นที่เข้าก๊วนในรอบนี้</label>
              <p className="text-[10px] text-slate-500 mb-2 leading-tight">เลือกสมาชิกร่วมทริปเพื่อหารเงินค่าสนามรวมกัน</p>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {players.map(player => {
                  const pMatches = matches.filter(m => m.teamA.includes(player.id) || m.teamB.includes(player.id));
                  const matchCount = pMatches.length;
                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerActive(player.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition ${
                        activePlayerIds.includes(player.id)
                          ? 'bg-emerald-50/50 border-emerald-500/20 text-slate-800'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{player.name}</span>
                        <span className="text-[9px] text-slate-400">
                          {matchCount > 0 ? `เล่นแล้ว ${matchCount} แมตช์` : 'ยังไม่มีเกมวันนี้'}
                        </span>
                      </div>
                      <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border ${
                        activePlayerIds.includes(player.id)
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {activePlayerIds.includes(player.id) && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className={`${isVisitorOnly ? 'w-full' : 'lg:col-span-2'} bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-slate-800`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-950 text-sm">ใบสรุปรายรับ-รายจ่าย รายคน</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {divisionMethod === 'standard' 
                    ? `สูตร: ค่าสนาม ฿${courtFeeRate} + (ค่าลูก ฿${shuttlecockMatchRate} x แมตช์)` 
                    : 'หารเฉลี่ยเท่ากัน หรือแบ่งตามชั่วโมงการเล่น'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={handleAnnounceExpenses}
                  className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  ประกาศยอดก๊วน 📢
                </button>
              )}
            </div>

            {/* Search Input for filtering players */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ค้นหาชื่อเล่น..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-center py-12 text-slate-400 text-xs">โปรดเลือกสมาชิกร่วมก๊วนเพื่อสรุปคำนวณเงิน</p>
              ) : (() => {
                const filteredExpenses = expenses.filter(exp => 
                  exp.playerName.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (filteredExpenses.length === 0) {
                  return <p className="text-center py-12 text-slate-400 text-xs">ไม่พบรายชื่อที่ต้องการค้นหา</p>;
                }
                return filteredExpenses.map((expense) => {
                  const isPaid = !!paidStatus[expense.playerId];
                  // Find amount of matches played for this player
                  const playerMatches = matches.filter(m => m.teamA.includes(expense.playerId) || m.teamB.includes(expense.playerId));
                  const playedCount = playerMatches.length;
                  const playerObj = players.find(p => p.id === expense.playerId);

                  return (
                    <div
                      key={expense.playerId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200"
                    >
                      {/* Name & custom info */}
                      <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={playerObj?.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80'}
                            alt={expense.playerName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 bg-white shadow-xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <h4 className="text-xs font-extrabold text-slate-950">{expense.playerName}</h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                              {divisionMethod === 'standard' ? (
                                <>
                                  <span className="bg-slate-200/80 px-1.5 py-0.5 rounded font-medium text-slate-600">ค่าสนาม ฿{expense.courtAmount.toFixed(0)}</span>
                                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">ค่าลูก ฿{expense.shuttleAmount.toFixed(0)} ({playedCount} นัด)</span>
                                </>
                              ) : (
                                <span>
                                  {divisionMethod === 'equal' 
                                    ? 'หารเฉลี่ยเท่า' 
                                    : `เล่นรวม ${playerHours[expense.playerId] || 0} ชม.`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {divisionMethod === 'custom' && (
                          <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-500 font-bold">ชม:</span>
                            <input
                              type="number"
                              min={0.5}
                              step={0.5}
                              value={playerHours[expense.playerId] || 2}
                              onChange={(e) => handleHourChange(expense.playerId, Number(e.target.value))}
                              className="w-10 bg-transparent text-center text-xs font-bold text-emerald-600 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Calculated Amount & Status */}
                      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                        <span className="text-sm font-extrabold text-emerald-600 font-mono">
                          ฿{expense.amount.toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Scan Pay button */}
                          <button
                            onClick={() => setSelectedPayment({
                              playerName: expense.playerName,
                              playerId: expense.playerId,
                              amount: expense.amount
                            })}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all text-xs flex items-center gap-1.5 font-bold animate-pulse"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>สแกนจ่าย</span>
                          </button>

                          {/* Paid/Unpaid admin controls */}
                          <button
                            onClick={() => handleTogglePaid(expense.playerId)}
                            disabled={!isAdmin}
                            className={`px-3 py-2 text-[10px] font-black rounded-xl transition ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-100 hover:border-rose-300'
                            }`}
                          >
                            {isPaid ? 'จ่ายแล้ว ✓' : 'ค้างชำระ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Payment Prompt Notice */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
            <AlertCircle className="h-4.5 w-4.5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-[11px] font-bold text-sky-800">คำชี้แจงการชำระเงินคิวอาร์โค้ด</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                สมาชิกสามารถกดปุ่ม <b className="text-slate-700">"สแกนจ่าย"</b> ท้ายรายชื่อของท่าน ระบบจะสร้าง PromptPay QR Code ที่ฝังยอดรวม (ค่าสนาม + ค่าลูกแบด) ทั้งหมดให้อัตโนมัติ สแกนจ่ายเข้าแอปธนาคารได้สะดวกรวดเร็วทันที!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal Display */}
      {selectedPayment && (
        <PromptPayQR
          playerName={selectedPayment.playerName}
          amount={selectedPayment.amount}
          onClose={() => setSelectedPayment(null)}
          onMarkAsPaid={() => {
            handleTogglePaid(selectedPayment.playerId);
            onAddNotification(
              'ชำระเงินสำเร็จ 💰',
              `${selectedPayment.playerName} ได้ชำระค่าสนาม+ค่าลูกจำนวน ฿${selectedPayment.amount.toFixed(2)} เรียบร้อยแล้ว`,
              'expense'
            );
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
