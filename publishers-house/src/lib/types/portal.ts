// Shared TypeScript interfaces for Portal features

export interface AttendanceDetail {
  attended: boolean;
  mode?: "in_person" | "online" | string;
  location?: string;
  time?: string;
  codeUsed?: string;
}

export interface ComparedAttendee {
  key: string;
  name: string;
  phone: string;
  email: string;
  isMember: boolean;
  memberUserId?: string;
  memberRole?: string;
  memberUnit?: string;
  statusTag: "Member" | "Walk-in";
  campus: string;
  date1Detail: AttendanceDetail;
  date2Detail: AttendanceDetail;
  date3Detail: AttendanceDetail;
  totalAttendedOutOf3: number;
  consistencyRate?: number;
  isCandidateForMembership?: boolean;
  recommendationNote?: string;
}

export interface PortalNotification {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  message: string;
  type: "duty_assigned" | "prayer_prayed" | "testimony_approved" | "announcement" | "general";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PlaybackRecord {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scripture?: string;
  videoUrl?: string;
  audioUrl?: string;
  spotifyEpisodeId?: string;
  thumbnailUrl?: string;
  progressSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
  updatedAt: string;
  type: "sermon" | "resource";
  resourceSlug?: string;
}

export interface AttendanceRecordItem {
  id: string;
  date: string;
  mode: "in_person" | "online" | string;
  location: string;
  streamChannel?: string;
  serviceCode?: string;
  timestamp?: string;
}

export interface AtRiskMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalAttended: number;
  lastAttendedDate: string;
  consecutiveMissed: number;
  riskLevel: "high" | "moderate";
  primaryCampus: "Jos Headquarters" | "Abuja Campus" | "Online Community" | "Unknown";
  primaryMode: "in_person" | "online";
  attendanceHistory: AttendanceRecordItem[];
  recentServiceDates: { date: string; attended: boolean }[];
  inPipeline: boolean;
  visitorId?: string;
  pipelineStatus?: "new" | "followup" | "established";
  assignedTo?: string;
  notes?: string;
}
