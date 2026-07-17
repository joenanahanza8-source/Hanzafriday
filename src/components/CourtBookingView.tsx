import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { Calendar, Clock, DollarSign, User, ShieldAlert, Plus, Check, Trash, Hourglass } from 'lucide-react';

interface CourtBookingViewProps {
  bookings: Booking[];
  isAdmin: boolean;
  currentUser: { email: string; name: string } | null;
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  onCancelBooking: (id: string) => void;
  onApproveBooking?: (id: string) => void;
  onAddNotification: (title: string, body: string, type: 'info' | 'booking' | 'match' | 'expense') => void;
}

export default function CourtBookingView({
  bookings,
  isAdmin,
  currentUser,
  onAddBooking,
  onCancelBooking,
  onApproveBooking,
  onAddNotification
}: CourtBookingViewProps) {
  // Calendar dates: today + next 6 days
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-17'); // Default matching context
  const [rentedBy, setRentedBy] = useState('สมาชิกก๊วน');
  const [notes, setNotes] = useState('');
  const [hourlyRate, setHourlyRate] = useState(220);
  const [courtNumber, setCourtNumber] = useState(1);
  const [startHour, setStartHour] = useState(18);
  const [endHour, setEndHour] = useState(20);

  // Sync rentedBy with currentUser or isAdmin status
  useEffect(() => {
    if (currentUser) {
      setRentedBy(currentUser.name);
    } else {
      setRentedBy(isAdmin ? 'พี่เจ้หนา' : 'สมาชิกก๊วน');
    }
  }, [currentUser, isAdmin]);

  const hoursRange = Array.from({ length: 6 }, (_, i) => 17 + i); // 17:00 to 22:00
  const courts = [1, 2, 3];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const datesList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date('2026-07-17');
    d.setDate(d.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    return {
      dateString,
      dayName: daysOfWeek[d.getDay()],
      dayOfMonth: d.getDate(),
      monthName: d.toLocaleDateString('th-TH', { month: 'short' }),
    };
  });

  const getBookingForTime = (courtNum: number, hour: number) => {
    return bookings.find(b => 
      b.courtNumber === courtNum && 
      b.date === selectedDateStr && 
      hour >= b.startHour && 
      hour < b.endHour &&
      b.status !== 'cancelled'
    );
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (startHour >= endHour) {
      alert('เวลาเริ่มเล่น ต้องน้อยกว่า เวลาสิ้นสุด');
      return;
    }

    // Check overlaps
    const overlap = bookings.some(b => 
      b.courtNumber === courtNumber && 
      b.date === selectedDateStr && 
      b.status !== 'cancelled' &&
      ((startHour >= b.startHour && startHour < b.endHour) ||
       (endHour > b.startHour && endHour <= b.endHour) ||
       (startHour <= b.startHour && endHour >= b.endHour))
    );

    if (overlap) {
      alert('ช่วงเวลาดังกล่าวมีผู้จองแล้ว!');
      return;
    }

    const bookingStatus: BookingStatus = isAdmin ? 'confirmed' : 'pending';

    onAddBooking({
      courtNumber,
      date: selectedDateStr,
      startHour,
      endHour,
      status: bookingStatus,
      rentedBy: rentedBy || (currentUser ? currentUser.name : 'สมาชิกทั่วไป'),
      notes: notes || (isAdmin ? '' : 'เสนอแนะนำเปิดรอบสนาม'),
      hourlyRate
    });

    if (isAdmin) {
      onAddNotification(
        'จองสนามสำเร็จ 🏸',
        `คอร์ท ${courtNumber} เวลา ${startHour}:00 - ${endHour}:00 น. ในวันที่ ${selectedDateStr} จองแล้วโดย ${rentedBy}`,
        'booking'
      );
    } else {
      onAddNotification(
        'เสนอขอเปิดจองสนามใหม่ ⏳',
        `เสนอจองคอร์ท ${courtNumber} เวลา ${startHour}:00 - ${endHour}:00 น. ในวันที่ ${selectedDateStr} โดยคุณ ${rentedBy} โปรดรอแอดมินพิจารณาอนุมัติ`,
        'booking'
      );
      alert('ส่งข้อเสนอจองสนามไปยังผู้ดูแลระบบเรียบร้อยแล้ว! โปรดรอตรวจสอบและอนุมัติ');
    }

    setNotes('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Date Picker Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
          <Calendar className="h-4.5 w-4.5 text-emerald-400" />
          เลือกวันที่ดูตารางจองสนาม
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {datesList.map((d) => {
            const isSelected = d.dateString === selectedDateStr;
            return (
              <button
                key={d.dateString}
                onClick={() => setSelectedDateStr(d.dateString)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] opacity-75">{d.dayName}</span>
                <span className="text-base tracking-tight font-black mt-0.5">{d.dayOfMonth}</span>
                <span className="text-[9px] opacity-75">{d.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Court Grid Schedule */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">ตารางการจองสนามแบดมินตัน</h3>
              <p className="text-xs text-slate-500 mt-0.5">ประจำวันที่ {selectedDateStr}</p>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 bg-slate-950 border border-slate-800 rounded"></span> ว่าง
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> จองแล้ว
              </span>
            </div>
          </div>

          <div className="space-y-4 overflow-x-auto">
            {courts.map((courtNum) => (
              <div key={courtNum} className="min-w-[450px] bg-slate-950 rounded-2xl border border-slate-800 p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 pl-1">
                  คอร์ทที่ {courtNum}
                </h4>

                <div className="grid grid-cols-6 gap-2">
                  {hoursRange.map((hour) => {
                    const booking = getBookingForTime(courtNum, hour);
                    const isBooked = !!booking;
                    const isPending = isBooked && booking.status === 'pending';

                    return (
                      <div
                        key={hour}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between ${
                          isBooked
                            ? isPending
                              ? 'bg-amber-500/5 border-amber-500/30 text-amber-300 ring-1 ring-amber-500/10'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold">
                          {hour}:00 - {hour + 1}:00
                        </span>
                        
                        {isBooked ? (
                          <div className="mt-2.5 text-[9px] font-bold space-y-1.5">
                            <p className={`${isPending ? 'text-amber-400' : 'text-emerald-400'} truncate`}>
                              {booking.rentedBy} {isPending && '⏳'}
                            </p>
                            <p className={`text-[8px] ${isPending ? 'text-amber-500' : 'text-emerald-500'} font-mono mt-0.5`}>
                              ฿{booking.hourlyRate}/ชม.
                            </p>
                            
                            <div className="flex flex-col gap-1 mt-1">
                              {isAdmin && isPending && onApproveBooking && (
                                <button
                                  onClick={() => onApproveBooking(booking.id)}
                                  className="w-full py-1 bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold rounded text-[8px] transition"
                                >
                                  อนุมัติจอง
                                </button>
                              )}
                              {(isAdmin || (currentUser && booking.rentedBy === currentUser.name)) && (
                                <button
                                  onClick={() => onCancelBooking(booking.id)}
                                  className="w-full py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 font-bold rounded text-[8px] transition"
                                >
                                  {isAdmin ? 'ยกเลิก' : 'ดึงคำคืน'}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2.5 text-[9px] opacity-60">ว่าง</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Control Panel for Admin & Members */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          <h3 className="font-bold text-white flex items-center gap-2 mb-1.5 text-sm">
            <Plus className="h-5 w-5 text-emerald-400" />
            {isAdmin ? 'แผงควบคุมการจองสนาม (Admin)' : 'เสนอขอเปิดจองคอร์ท (Member)'}
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            {isAdmin 
              ? 'ผู้ดูแลก๊วนสามารถล็อกคอร์ทล่วงหน้าเพื่อจัดรอบแข่งขันก๊วนศุกร์หรรษาได้ทันที' 
              : 'สมาชิกและนักกีฬาในก๊วนสามารถยื่นความต้องการขอเปิดคอร์ทหรือช่วงเวลาเล่นเพื่อให้แอดมินอนุมัติ'}
          </p>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">เลือกหมายเลขคอร์ท</label>
              <select
                value={courtNumber}
                onChange={(e) => setCourtNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>คอร์ทที่ 1</option>
                <option value={2}>คอร์ทที่ 2</option>
                <option value={3}>คอร์ทที่ 3</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">เวลาเริ่ม (น.)</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {hoursRange.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">เวลาสิ้นสุด (น.)</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {hoursRange.map(h => <option key={h + 1} value={h + 1}>{h + 1}:00</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                ค่าสนามต่อชั่วโมง (บาท) { !isAdmin && <span className="text-slate-500 text-[8px] font-normal">(ผู้ดูแลระบบกำหนด)</span> }
              </label>
              <input
                type="number"
                required
                disabled={!isAdmin}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-55 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ผู้เสนอจอง / ผู้รับผิดชอบคอร์ท</label>
              <input
                type="text"
                required
                value={rentedBy}
                onChange={(e) => setRentedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">หมายเหตุ หรือ เหตุผลขอเปิดรอบ</label>
              <textarea
                placeholder={isAdmin ? "เช่น ก๊วนศุกร์หรรษารอบดึก" : "เช่น ขอจองเพิ่มเพื่อแข่งขันรอบกระชับมิตรเพื่อนๆ"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16 resize-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-slate-950 font-extrabold rounded-xl text-xs transition duration-200 shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                isAdmin 
                  ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/10' 
                  : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/10'
              }`}
            >
              <Check className="h-4 w-4" />
              {isAdmin ? 'ยืนยันการบันทึกการจองสนาม' : 'ส่งคำเสนอขอจองสนาม (รออนุมัติ)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
