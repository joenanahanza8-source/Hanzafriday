import React, { useState } from 'react';
import { getPromptPayQRImageUrl } from '../utils/promptpay';
import { CreditCard, Check, Copy, Share2, Download, Landmark } from 'lucide-react';

interface PromptPayQRProps {
  playerName: string;
  amount: number;
  onClose: () => void;
  onMarkAsPaid?: () => void;
  isAdmin?: boolean;
}

export default function PromptPayQR({ playerName, amount, onClose, onMarkAsPaid, isAdmin }: PromptPayQRProps) {
  const [copied, setCopied] = useState(false);
  const promptPayNumber = '081-234-5678'; // Simulated admin promptpay mobile number
  const qrUrl = getPromptPayQRImageUrl(promptPayNumber, amount);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(promptPayNumber.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 hover:bg-black/40 transition"
          >
            ✕
          </button>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-3 animate-bounce">
            <CreditCard className="h-6 w-6 text-emerald-100" />
          </div>
          <h3 className="text-lg font-bold">สแกนจ่ายค่าสนามก๊วน</h3>
          <p className="text-xs text-emerald-100 mt-1">ก๊วนแบดมินตัน ศุกร์หรรษา</p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Player info & Amount */}
          <div className="text-center mb-4">
            <span className="text-xs text-slate-500 font-medium">ยอดโอนของ</span>
            <h4 className="text-base font-bold text-slate-200 mt-0.5">{playerName}</h4>
            <div className="mt-2 text-3xl font-black text-emerald-400">
              ฿{amount.toFixed(2)}
            </div>
          </div>

          {/* Real QR Code Image */}
          <div className="relative bg-white p-3 rounded-2xl shadow-inner border border-slate-700/50 mb-4 transition hover:scale-[1.02] duration-300">
            <img
              src={qrUrl}
              alt="PromptPay QR Code"
              className="w-48 h-48 rounded-lg"
              crossOrigin="anonymous"
            />
            {/* PromptPay Overlay Brand Mark */}
            <div className="absolute inset-x-0 -bottom-2 flex justify-center">
              <span className="px-3 py-0.5 bg-sky-950 border border-sky-800 text-[9px] font-black tracking-widest text-white rounded-full uppercase shadow">
                PROMPTPAY
              </span>
            </div>
          </div>

          {/* PromptPay Account Details */}
          <div className="w-full bg-slate-950 border border-slate-800/60 rounded-xl p-3 text-center mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Landmark className="h-3.5 w-3.5 text-sky-400" />
                โอนผ่านเบอร์พร้อมเพย์
              </span>
              <button
                onClick={handleCopyNumber}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอกเบอร์'}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-200 tracking-wider font-mono">{promptPayNumber}</p>
            <p className="text-[10px] text-slate-500 mt-1 leading-none">ชื่อบัญชี: แอดมินเจ้หนา (ศุกร์หรรษา)</p>
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-2.5">
            {onMarkAsPaid && (
              <button
                onClick={() => {
                  onMarkAsPaid();
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                ยืนยันการชำระเงินเรียบร้อย
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
