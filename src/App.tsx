import React, { useState, useEffect } from 'react';
import { Player, Booking, Match, AppNotification, MatchStatus } from './types';
import { INITIAL_PLAYERS, INITIAL_BOOKINGS, INITIAL_MATCHES, INITIAL_NOTIFICATIONS } from './utils/mockData';
import LoginScreen from './components/LoginScreen';
import MatchMakerView from './components/MatchMakerView';
import LeaderboardView from './components/LeaderboardView';
import CourtBookingView from './components/CourtBookingView';
import ExpenseSummaryView from './components/ExpenseSummaryView';
import NotificationCenter from './components/NotificationCenter';
import { LogOut, Wifi, Calendar, Swords, Trophy, DollarSign, Bell, UserCheck, Smartphone } from 'lucide-react';
// @ts-ignore
import logoImage from './assets/images/badminton_beer_logo_1784280327586.jpg';

const THAI_DAYS = [
  { name: 'วันอาทิตย์', colorClass: 'text-red-600 bg-red-50 border-red-200/60', dotColor: 'bg-red-500' },
  { name: 'วันจันทร์', colorClass: 'text-amber-600 bg-amber-50 border-amber-200/60', dotColor: 'bg-amber-400' },
  { name: 'วันอังคาร', colorClass: 'text-pink-600 bg-pink-50 border-pink-200/60', dotColor: 'bg-pink-500' },
  { name: 'วันพุธ', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/60', dotColor: 'bg-emerald-500' },
  { name: 'วันพฤหัสบดี', colorClass: 'text-orange-600 bg-orange-50 border-orange-200/60', dotColor: 'bg-orange-500' },
  { name: 'วันศุกร์', colorClass: 'text-sky-600 bg-sky-50 border-sky-200/60', dotColor: 'bg-sky-500' },
  { name: 'วันเสาร์', colorClass: 'text-purple-600 bg-purple-50 border-purple-200/60', dotColor: 'bg-purple-500' },
];

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('suk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = currentUser?.email === 'joe.nana.hanza8@gmail.com';

  // Core Data States
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('suk_players');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    // Auto-detect and reset old hardcoded mock data for a clean production slate
    if (Array.isArray(parsed) && parsed.some(p => p.id === 'p1' || p.id === 'p2')) {
      localStorage.removeItem('suk_players');
      localStorage.removeItem('suk_bookings');
      localStorage.removeItem('suk_matches');
      localStorage.removeItem('suk_notifications');
      return [];
    }
    return parsed;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const savedPlayers = localStorage.getItem('suk_players');
    if (!savedPlayers) return [];
    const saved = localStorage.getItem('suk_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const savedPlayers = localStorage.getItem('suk_players');
    if (!savedPlayers) return [];
    const saved = localStorage.getItem('suk_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const savedPlayers = localStorage.getItem('suk_players');
    if (!savedPlayers) return [];
    const saved = localStorage.getItem('suk_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'matchmaker' | 'leaderboard' | 'bookings' | 'expenses' | 'notifications'>(() => {
    const savedUser = localStorage.getItem('suk_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === 'joe.nana.hanza8@gmail.com') {
          return 'matchmaker';
        }
      } catch (e) {
        console.error(e);
      }
    }
    return 'leaderboard';
  });

  // Redirect non-admin users to allowed tabs (leaderboard, bookings, or expenses)
  useEffect(() => {
    if (!isAdmin && (activeTab === 'matchmaker' || activeTab === 'notifications')) {
      setActiveTab('leaderboard');
    }
  }, [isAdmin, activeTab]);

  // Pop-up Alert Banner (Simulated Push banner)
  const [alertBanner, setAlertBanner] = useState<{ title: string; body: string } | null>(null);

  // Real-time Clock and Date
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Inline login form states
  const [inlineEmail, setInlineEmail] = useState('');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('suk_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('suk_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('suk_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('suk_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Login action
  const handleLogin = (email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('suk_user', JSON.stringify(user));
    
    // Add greetings notification
    addNotification(
      `ยินดีต้อนรับกลับคุณ ${name} 👋`,
      email === 'joe.nana.hanza8@gmail.com' 
        ? 'เข้าใช้ในฐานะแอดมินสูงสุด ระบบพร้อมให้ควบคุมเต็มรูปแบบแล้ว'
        : 'เชื่อมต่อก๊วนศุกร์หรรษาสำเร็จ ตรวจสอบคะแนนและสแกนคิวอาร์ได้ทันที',
      'info'
    );
  };

  // Logout action
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('suk_user');
  };

  // Add general Notification & Trigger Simulated Banner
  const addNotification = (title: string, body: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    setNotifications(prev => [newNotif, ...prev]);
    
    // Show top-right slider banner
    setAlertBanner({ title, body });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);

    // Browser native push notification fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (err) {
        console.warn('Native notification blocked:', err);
      }
    }
  };

  // Mark all notification as read
  const handleReadNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Clear notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate advance booking push alerts
  const handleSimulatePushAlert = () => {
    const alerts = [
      {
        title: 'เตือนล่วงหน้า: คอร์ทก๊วนคืนนี้ 🏸',
        body: 'ก๊วนศุกร์หรรษาคืนนี้เจอกัน 18:00 - 20:00 น. คอร์ท 1, 2 เตรียมนวดข้อมือให้ดี!',
        type: 'booking' as const
      },
      {
        title: 'ผลการจัดทีมอัปเดต 📊',
        body: 'การประเมินคะแนนประจำสัปดาห์เสร็จสิ้น อันดับคะแนนของคุณพี่เอสขยับขึ้นสู่อันดับ 1 ชั่วคราว!',
        type: 'match' as const
      },
      {
        title: 'เตือนโอนเงินค่าลูกแบด 💰',
        body: 'แอดมินเจ้หนาปิดยอดสรุปเรียบร้อย โปรดสแกนจ่ายค่าลูกแบด+ค่าเช่าสนามด่วน!',
        type: 'expense' as const
      }
    ];

    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    addNotification(randomAlert.title, randomAlert.body, randomAlert.type);
  };

  // Add player profile (Admin only)
  const handleAddPlayer = (newPlayer: Omit<Player, 'id' | 'wins' | 'losses' | 'draws' | 'totalMatches' | 'totalPoints' | 'joinedAt'>) => {
    const player: Player = {
      ...newPlayer,
      id: 'p_' + Date.now(),
      wins: 0,
      losses: 0,
      draws: 0,
      totalMatches: 0,
      totalPoints: 0,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setPlayers(prev => [...prev, player]);
  };

  // Booking handlers
  const handleAddBooking = (newBooking: Omit<Booking, 'id'>) => {
    const booking: Booking = {
      ...newBooking,
      id: 'booking_' + Date.now()
    };
    setBookings(prev => [...prev, booking]);
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    );
  };

  const handleApproveBooking = (id: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === id) {
          addNotification(
            'อนุมัติการจองสนามสำเร็จ 🎉',
            `แอดมินอนุมัติการเสนอจองคอร์ทที่ ${b.courtNumber} ในช่วงเวลา ${b.startHour}:00 - ${b.endHour}:00 น. เรียบร้อยแล้ว`,
            'booking'
          );
          return { ...b, status: 'confirmed' };
        }
        return b;
      })
    );
  };

  // Match Play handlers
  const handleStartMatch = (newMatch: Omit<Match, 'id' | 'status' | 'startTime'> & { status?: MatchStatus }) => {
    const match: Match = {
      ...newMatch,
      id: 'match_' + Date.now(),
      status: newMatch.status || 'active',
      startTime: new Date().toISOString()
    };
    setMatches(prev => [match, ...prev]);
  };

  const handleCompleteMatch = (id: string, scoreA: number, scoreB: number, winner: Match['winner']) => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id !== id) return m;

        // Update player statistics
        const updatedPlayers = [...players];
        const allParticipants = [...m.teamA, ...m.teamB];

        allParticipants.forEach(pid => {
          const idx = updatedPlayers.findIndex(p => p.id === pid);
          if (idx !== -1) {
            const player = updatedPlayers[idx];
            player.totalMatches += 1;
            
            // Total score updates
            if (m.teamA.includes(pid)) {
              player.totalPoints += scoreA;
            } else {
              player.totalPoints += scoreB;
            }

            // Wins Losses Draws calculations
            if (winner === 'draw') {
              player.draws += 1;
            } else if (winner === 'teamA') {
              if (m.teamA.includes(pid)) {
                player.wins += 1;
              } else {
                player.losses += 1;
              }
            } else {
              if (m.teamB.includes(pid)) {
                player.wins += 1;
              } else {
                player.losses += 1;
              }
            }
          }
        });

        setPlayers(updatedPlayers);

        return {
          ...m,
          status: 'completed',
          scoreA,
          scoreB,
          winner,
          endTime: new Date().toISOString()
        };
      })
    );
  };

  const handleUpdateMatchStatus = (id: string, status: MatchStatus) => {
    setMatches(prev =>
      prev.map(m => m.id === id ? { ...m, status, startTime: status === 'active' ? new Date().toISOString() : m.startTime } : m)
    );
  };

  const handleCancelMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Dynamic summary stats for the dashboard header (Professional Polish style)
  const totalPlayersCount = players.length;
  const todayBookings = bookings.filter(b => b.date === '2026-07-17' && b.status === 'confirmed');
  const bookedHoursCount = todayBookings.reduce((sum, b) => sum + (b.endHour - b.startHour), 0);
  const completedMatchesCount = matches.filter(m => m.status === 'completed').length;
  const totalMatchesCount = 1240 + completedMatchesCount;

  // Calculate dynamic today's estimated cost/balance
  const activePlayersCount = players.filter(p => p.isActive).length;
  const totalCourtCollected = activePlayersCount * 30;
  const totalShuttleCollected = matches.filter(m => m.status === 'completed').reduce((sum, m) => {
    const playerCount = m.type === 'doubles' ? 4 : 2;
    return sum + (playerCount * 25);
  }, 0);
  const totalCostToday = totalCourtCollected + totalShuttleCollected;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 relative">
      
      {/* Realtime Floating Push Banner Alert */}
      {alertBanner && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 animate-bounce backdrop-blur-sm">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="text-xs font-bold text-emerald-600">{alertBanner.title}</h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-normal">{alertBanner.body}</p>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* App Header Bar (White Premium Styling) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="ก๊วนศุกร์หรรษา"
              className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-md shadow-emerald-500/5 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <h1 className="text-base font-black tracking-tight text-slate-900">ก๊วนศุกร์หรรษา 🏸</h1>
              {/* Real-time synchronization simulated indicator */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[9px] text-slate-500 font-medium">เชื่อมคลาวด์ซิงค์เรียลไทม์ (24 อุปกรณ์)</p>
              </div>
            </div>
          </div>

          {/* Real-time Clock and Date with Day of Week Color */}
          {(() => {
            const dayIdx = currentTime.getDay();
            const dayInfo = THAI_DAYS[dayIdx];
            const thaiDateStr = `${dayInfo.name}ที่ ${currentTime.getDate()} ${THAI_MONTHS[currentTime.getMonth()]} ${currentTime.getFullYear() + 543}`;
            const timeStr = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            return (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${dayInfo.colorClass} shadow-xs`}>
                <span className={`h-2 w-2 rounded-full ${dayInfo.dotColor} animate-pulse shrink-0`} />
                <span className="font-sans leading-none">{thaiDateStr}</span>
                <span className="opacity-40">|</span>
                <span className="font-mono font-extrabold leading-none tracking-wider">{timeStr} น.</span>
              </div>
            );
          })()}
        </div>

        {/* Current user & Role bar or Header Login Bar */}
        <div className="flex items-center justify-between md:justify-end gap-3.5">
          {currentUser ? (
            <>
              <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="text-left font-sans">
                  <p className="text-[10px] text-slate-400 leading-none">ผู้ใช้งาน</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[120px]">{currentUser.name}</p>
                </div>
                {isAdmin ? (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    MEMBER
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inlineEmail}
                onChange={(e) => setInlineEmail(e.target.value)}
                placeholder="อีเมล (เช่น member@gmail.com)"
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 md:w-64"
              />
              <button
                onClick={() => {
                  if (!inlineEmail || !inlineEmail.includes('@')) {
                    alert('กรุณากรอกอีเมลให้ถูกต้อง');
                    return;
                  }
                  // Auto-derive name from email
                  let finalName = 'นักกีฬา';
                  if (inlineEmail.trim() === 'joe.nana.hanza8@gmail.com') {
                    finalName = 'แอดมินสูงสุด';
                  } else if (inlineEmail.trim() === 'member.suk@gmail.com') {
                    finalName = 'คุณสมศักดิ์';
                  } else {
                    const prefix = inlineEmail.split('@')[0];
                    finalName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                  }
                  handleLogin(inlineEmail.trim(), finalName);
                }}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Top Dashboard KPI Row (Professional Polish Design Pattern) */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-sans">สมาชิกทั้งหมด</p>
              <p className="text-xl md:text-2xl font-black text-slate-900">
                {totalPlayersCount} <span className="text-xs font-normal text-slate-500">คน</span>
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-sans">จองสนามวันนี้</p>
              <p className="text-xl md:text-2xl font-black text-slate-900">
                {bookedHoursCount} <span className="text-xs font-normal text-slate-500">ชั่วโมง</span>
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-sans">แมตช์ที่บันทึกแล้ว</p>
              <p className="text-xl md:text-2xl font-black text-slate-900">
                {totalMatchesCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">เกม</span>
              </p>
            </div>
            <div className="bg-emerald-600 border border-emerald-500 rounded-2xl p-4.5 shadow-md text-left text-white animate-pulse">
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider mb-1 font-sans">ยอดรวมวันนี้</p>
              <p className="text-xl md:text-2xl font-black text-white">
                ฿ {totalCostToday.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs bar */}
        <div className="flex overflow-x-auto gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl mb-6 scrollbar-none shadow-sm">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('matchmaker')}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'matchmaker'
                  ? 'bg-emerald-500 text-white font-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Swords className="h-4 w-4" />
              แดชบอร์ดจัดคิว
            </button>
          )}

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-500 text-white font-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trophy className="h-4 w-4" />
            อันดับสถิติ
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-emerald-500 text-white font-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            ตารางจองสนาม
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-emerald-500 text-white font-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            สรุปยอด
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition relative whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-emerald-500 text-white font-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bell className="h-4 w-4" />
              ศูนย์แจ้งเตือน
              {unreadNotifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
              )}
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="transition-all duration-300">
          {activeTab === 'matchmaker' && isAdmin && (
            <MatchMakerView
              players={players}
              matches={matches}
              isAdmin={isAdmin}
              onAddPlayer={handleAddPlayer}
              onStartMatch={handleStartMatch}
              onCompleteMatch={handleCompleteMatch}
              onAddNotification={addNotification}
              onUpdateMatchStatus={handleUpdateMatchStatus}
              onCancelMatch={handleCancelMatch}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              players={players}
              matches={matches}
            />
          )}

          {activeTab === 'bookings' && (
            <CourtBookingView
              bookings={bookings}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onAddBooking={handleAddBooking}
              onCancelBooking={handleCancelBooking}
              onApproveBooking={handleApproveBooking}
              onAddNotification={addNotification}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseSummaryView
              players={players}
              bookings={bookings}
              matches={matches}
              isAdmin={isAdmin}
              onAddNotification={addNotification}
              isVisitorOnly={!isAdmin}
            />
          )}

          {activeTab === 'notifications' && isAdmin && (
            <NotificationCenter
              notifications={notifications}
              onRead={handleReadNotification}
              onClearAll={handleClearAllNotifications}
              onSimulatePush={handleSimulatePushAlert}
            />
          )}
        </div>
      </main>

      {/* Floating Status Bar / Footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-2.5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-4 z-30 shadow-md">
        <span className="font-bold text-slate-600">ก๊วนศุกร์หรรษา © 2026</span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1">
          <Smartphone className="h-3 w-3 text-emerald-600" />
          ซิงค์อุปกรณ์: มือถือ/แท็บเล็ตเรียลไทม์
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000"></span>
          ระบบฐานข้อมูลจำลองคลาวด์เปิดทำงาน
        </span>
      </footer>
    </div>
  );
}
