/**
 * Types for ก๊วนศุกร์หรรษา - Badminton Management App
 */

export type PlayerLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Player {
  id: string;
  name: string;
  photoUrl: string; // Base64 image from camera or standard placeholder
  level: PlayerLevel;
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  totalPoints: number;
  isActive: boolean;
  joinedAt: string;
}

export type MatchType = 'singles' | 'doubles';
export type MatchStatus = 'active' | 'completed' | 'waiting';

export interface Match {
  id: string;
  type: MatchType;
  courtId: number;
  teamA: string[]; // Player IDs
  teamB: string[]; // Player IDs
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  startTime: string;
  endTime?: string;
  winner?: 'teamA' | 'teamB' | 'draw';
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  courtNumber: number;
  date: string; // YYYY-MM-DD
  startHour: number; // e.g., 17 (for 17:00)
  endHour: number; // e.g., 18 (for 18:00)
  status: BookingStatus;
  rentedBy: string;
  notes?: string;
  hourlyRate: number;
}

export interface ExpenseSummary {
  playerId: string;
  playerName: string;
  courtFee: number;
  shuttlecockFee: number;
  totalAmount: number;
  paid: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'booking' | 'match' | 'expense';
}
