// Risk calculation types and interfaces

export interface RiskInput {
  f: number; // Biaya & Pengetahuan (1-6)
  g: number; // Pengaruh & Kerugian (1-6)
  h: number; // Frekuensi (1-6)
  i: number; // Pemulihan (2/4/6)
}

export interface RiskScore {
  peluang: number;  // J (Peluang Serangan)
  impact: number;   // K (Impact)
  total: number;    // L (Total Resiko)
  category: RiskCategory; // M (Kategori)
}

export enum RiskCategory {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum FormStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED'
}

export enum UnderstandLevel {
  MENGERTI = 'MENGERTI',
  TIDAK_MENGERTI = 'TIDAK_MENGERTI'
}

// API Request/Response types
export interface CreateSubmissionRequest {
  assetId: number;
  threatId: number;
}

export interface CreateSubmissionResponse {
  submissionId: number;
}

export interface SubmitInputsRequest {
  f: number;
  g: number;
  h: number;
  i: number;
  understand: UnderstandLevel;
}

export interface SubmitInputsResponse {
  peluang: number;
  impact: number;
  total: number;
  category: RiskCategory;
}

export interface GetScoreResponse {
  peluang: number;
  impact: number;
  total: number;
  category: RiskCategory;
}

export interface AssetResponse {
  id: number;
  name: string;
  threatCount: number;
}

export interface ThreatResponse {
  id: number;
  name: string;
  description?: string;
}

export interface UMKMProgressResponse {
  id: number;
  email: string;
  name?: string;
  totalAssets: number;
  completedAssets: number;
  progressPercentage: number;
}

// Error types
export class RiskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RiskValidationError';
  }
}

export class InvalidRiskInputError extends RiskValidationError {
  constructor(field: string, value: number, validRange: string) {
    super(`Invalid ${field}: ${value}. Must be ${validRange}`);
    this.name = 'InvalidRiskInputError';
  }
}
