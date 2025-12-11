import { RiskCategory, UnderstandLevel } from './risk';

export interface SubmissionHistoryItem {
  submissionId: number;
  month: number;
  year: number;
  submittedAt: string;
  understand: UnderstandLevel;
  user: {
    id: number;
    email: string;
    name?: string | null;
  };
  asset: {
    id: number;
    name: string;
  };
  threat: {
    id: number;
    name: string;
  };
  score?: {
    peluang: number | null;
    impact: number | null;
    total: number | null;
    category: RiskCategory | null;
  };
}

export interface SubmissionHistoryQuery {
  userId?: number;
  userName?: string;
  assetId?: number;
  threatId?: number;
  months?: number; // default 12
  page?: number; // default 1
  pageSize?: number; // default 20, max 100
  sort?: 'asc' | 'desc'; // by submittedAt
  listUsers?: boolean;
}

export interface SubmissionHistoryResponse {
  items: SubmissionHistoryItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SubmissionHistoryUserSummary {
  id: number;
  name: string | null;
  email: string;
  submissions: number;
  latestSubmittedAt: string | null;
}

export interface SubmissionHistoryUsersResponse {
  users: SubmissionHistoryUserSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

