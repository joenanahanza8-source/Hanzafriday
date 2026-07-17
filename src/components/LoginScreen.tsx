import React, { useState } from 'react';
import { Mail, ShieldCheck, HelpCircle, Activity, Lock, Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, name: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('กรุณากรอกอีเมลของคุณ');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    const displayName = name.trim() || email.split('@')[0];
    onLogin(email.trim().toLowerCase(), displayName);
  };

  const loginAsAdmin = () => {
    onLogin('joe.nana.hanza8@gmail.com', 'แอดมินเจ้หนา');
  };

  const loginAsGuest = () => {
    onLogin('member.suk@gmail.com', 'สมาชิกก๊วนศุกร์หรรษา');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 font-black text-2xl shadow-lg shadow-slate-900/10 mb-4">
            ศห
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">ก๊วนแบดมินตัน "ศุกร์หรรษา"</h1>
          <p className="text-sm text-slate-500 mt-2">ระบบจัดทีม บันทึกคะแนน และจองสนามเรียลไทม์</p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">อีเมล (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ชื่อของคุณ (ใส่หรือไม่ใส่ก็ได้)</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ชื่อเรียกในก๊วน (เว้นว่างได้)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-xs text-center font-medium bg-rose-50 py-2.5 px-3 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition duration-200 text-sm"
          >
            เข้าสู่ระบบด้วยโซเชียล / อีเมล
          </button>
        </form>

        {/* Fast Action Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-150"></div>
          </div>
          <span className="relative bg-white px-3 text-xs font-medium text-slate-400">ทางเลือกเข้าใช้งานแบบรวดเร็ว</span>
        </div>

         {/* Quick Logins */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={loginAsAdmin}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-slate-800 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-700">เข้าใช้งานด้วยสิทธิ์แอดมินสูงสุด</p>
                <p className="text-[10px] text-slate-500">สำหรับผู้ดูแลระบบจัดการก๊วน</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </button>

          <button
            type="button"
            onClick={loginAsGuest}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-200 text-slate-600 group-hover:scale-110 transition">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700 font-semibold">เข้าใช้ในฐานะสมาชิกปกติ</p>
                <p className="text-[10px] text-slate-500">สำหรับนักกีฬาและสมาชิกก๊วน</p>
              </div>
            </div>
            <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition" />
          </button>
        </div>

        {/* Bottom Notice */}
        <div className="text-center mt-6 text-[11px] text-slate-400 leading-relaxed">
          หมายเหตุ: การแก้ไข ลบ บันทึกประวัติ หรือจัดการการจอง จะสงวนสิทธิ์สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
        </div>
      </div>
    </div>
  );
}
