import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Trash2, Calendar, Award, DollarSign, Volume2, ShieldCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onRead: (id: string) => void;
  onClearAll: () => void;
  onSimulatePush: () => void;
}

export default function NotificationCenter({
  notifications,
  onRead,
  onClearAll,
  onSimulatePush
}: NotificationCenterProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        new Notification('เปิดการแจ้งเตือนพุชสำเร็จ 🎉', {
          body: 'คุณจะได้รับการแจ้งเตือนความคืบหน้าของคอร์ทแบดมินตันศุกร์หรรษา',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-emerald-400" />;
      case 'match':
        return <Award className="h-4 w-4 text-sky-400" />;
      case 'expense':
        return <DollarSign className="h-4 w-4 text-amber-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-emerald-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">ศูนย์แจ้งเตือนก๊วน</h3>
            <p className="text-xs text-slate-500">จำลองการพุชข้อความล่วงหน้าและอัปเดต</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 p-1 rounded-lg hover:bg-rose-500/10 px-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* HTML5 Push Notification Permission Banner */}
      {'Notification' in window && permission !== 'granted' && (
        <div className="mb-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-emerald-300">เปิดระบบพุชแจ้งเตือนผ่านเบราว์เซอร์</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">รับข้อความแจ้งเตือนเตือนความจำล่วงหน้าเมื่อใกล้ถึงเวลาจองสนาม</p>
            </div>
          </div>
          <button
            onClick={requestBrowserPermission}
            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-lg shrink-0 transition"
          >
            อนุญาตแจ้งเตือน
          </button>
        </div>
      )}

      {/* Quick Simulated Actions */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        <button
          onClick={onSimulatePush}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition group"
        >
          <Volume2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
          <span>จำลองการแจ้งเตือนพุช (Push Simulation)</span>
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-600 flex flex-col items-center justify-center">
            <BellOff className="h-10 w-10 text-slate-700 mb-2" />
            <p className="text-xs">ไม่มีแจ้งเตือนในระบบ</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onRead(notif.id)}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-slate-950/20 border-slate-800/40 text-slate-400'
                  : 'bg-slate-950/70 border-slate-800 text-white shadow-sm ring-1 ring-emerald-500/10'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${notif.read ? 'bg-slate-900 text-slate-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-400' : 'text-slate-100'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{notif.body}</p>
                {!notif.read && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="h-2.5 w-2.5" /> ใหม่
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
