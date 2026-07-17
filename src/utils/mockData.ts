import { Player, Booking, Match, AppNotification } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'พี่เจ้หนา (Admin)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    level: 'Advanced',
    wins: 15,
    losses: 8,
    draws: 2,
    totalMatches: 25,
    totalPoints: 485,
    isActive: true,
    joinedAt: '2026-01-01'
  },
  {
    id: 'p2',
    name: 'พี่เอส',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 'Advanced',
    wins: 18,
    losses: 6,
    draws: 1,
    totalMatches: 25,
    totalPoints: 512,
    isActive: true,
    joinedAt: '2026-01-10'
  },
  {
    id: 'p3',
    name: 'กอล์ฟ',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: 'Intermediate',
    wins: 12,
    losses: 10,
    draws: 3,
    totalMatches: 25,
    totalPoints: 430,
    isActive: true,
    joinedAt: '2026-02-15'
  },
  {
    id: 'p4',
    name: 'แอนดี้',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    level: 'Intermediate',
    wins: 9,
    losses: 14,
    draws: 2,
    totalMatches: 25,
    totalPoints: 395,
    isActive: true,
    joinedAt: '2026-02-20'
  },
  {
    id: 'p5',
    name: 'น้องบิว',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: 'Beginner',
    wins: 6,
    losses: 16,
    draws: 3,
    totalMatches: 25,
    totalPoints: 340,
    isActive: true,
    joinedAt: '2026-03-01'
  },
  {
    id: 'p6',
    name: 'คุณเมย์',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    level: 'Beginner',
    wins: 8,
    losses: 15,
    draws: 2,
    totalMatches: 25,
    totalPoints: 355,
    isActive: true,
    joinedAt: '2026-03-05'
  },
  {
    id: 'p7',
    name: 'ต้อง',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    level: 'Intermediate',
    wins: 11,
    losses: 11,
    draws: 3,
    totalMatches: 25,
    totalPoints: 418,
    isActive: true,
    joinedAt: '2026-03-10'
  },
  {
    id: 'p8',
    name: 'พี่เต๋า',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    level: 'Advanced',
    wins: 14,
    losses: 9,
    draws: 2,
    totalMatches: 25,
    totalPoints: 468,
    isActive: true,
    joinedAt: '2026-03-15'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    courtNumber: 1,
    date: '2026-07-17', // Today (using the context current local time 2026-07-17)
    startHour: 18,
    endHour: 20,
    status: 'confirmed',
    rentedBy: 'พี่เจ้หนา',
    notes: 'สนามประจำก๊วนศุกร์หรรษา คอร์ท 1',
    hourlyRate: 220
  },
  {
    id: 'b2',
    courtNumber: 2,
    date: '2026-07-17',
    startHour: 18,
    endHour: 20,
    status: 'confirmed',
    rentedBy: 'พี่เจ้หนา',
    notes: 'สนามประจำก๊วนศุกร์หรรษา คอร์ท 2',
    hourlyRate: 220
  },
  {
    id: 'b3',
    courtNumber: 1,
    date: '2026-07-24', // Next Friday
    startHour: 18,
    endHour: 21,
    status: 'confirmed',
    rentedBy: 'พี่เจ้หนา',
    notes: 'ก๊วนล่วงหน้า',
    hourlyRate: 220
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    type: 'doubles',
    courtId: 1,
    teamA: ['p1', 'p3'], // เจ้หนา & กอล์ฟ
    teamB: ['p2', 'p4'], // พี่เอส & แอนดี้
    scoreA: 21,
    scoreB: 18,
    status: 'completed',
    startTime: '2026-07-17T18:10:00Z',
    endTime: '2026-07-17T18:35:00Z',
    winner: 'teamA'
  },
  {
    id: 'm2',
    type: 'singles',
    courtId: 2,
    teamA: ['p7'], // ต้อง
    teamB: ['p8'], // พี่เต๋า
    scoreA: 15,
    scoreB: 21,
    status: 'completed',
    startTime: '2026-07-17T18:15:00Z',
    endTime: '2026-07-17T18:35:00Z',
    winner: 'teamB'
  },
  {
    id: 'm3',
    type: 'doubles',
    courtId: 1,
    teamA: ['p1', 'p2'],
    teamB: ['p3', 'p8'],
    status: 'active',
    startTime: new Date(Date.now() - 12 * 60 * 1000).toISOString() // 12 mins ago
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'จองสนามสำเร็จ 🎉',
    body: 'ยืนยันการจองคอร์ท 1 และ คอร์ท 2 เวลา 18:00 - 20:00 น. วันนี้เรียบร้อยแล้ว!',
    timestamp: '2026-07-17T10:00:00.000Z',
    read: false,
    type: 'booking'
  },
  {
    id: 'n2',
    title: 'สรุปยอดค่าใช้จ่ายสัปดาห์ที่แล้ว 💰',
    body: 'แอดมินเจ้หนาได้อัปเดตยอดค่าใช้จ่ายแล้ว โปรดตรวจสอบหน้าสรุปค่าใช้จ่ายและโอนเงินผ่าน QR Code',
    timestamp: '2026-07-16T12:00:00.000Z',
    read: true,
    type: 'expense'
  }
];
