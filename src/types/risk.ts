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

// New batch submission interfaces
export interface ThreatAnswer {
  threatId: number;
  biaya_pengetahuan: number;
  pengaruh_kerugian: number;
  Frekuensi_serangan: number;
  Pemulihan: number;
  mengerti_poin: boolean;
    Tidak_mengerti_poin?: string;
  description_tidak_mengerti?: string;
}

export interface BatchSubmissionRequest {
  assetId: number;
  threats: ThreatAnswer[];
}

export interface BatchSubmissionResponse {
  submissions: Array<{
    threatId: number;
    submissionId: number;
    success: boolean;
    error?: string;
    result?: {
      peluang: number;
      impact: number;
      total: number;
      category: RiskCategory;
      threatDescription?: {
        category: RiskCategory;
        threatName: string;
        description: string;
        recommendations: string[];
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        actionRequired: boolean;
      };
    };
  }>;
}

export interface SubmitInputsRequest {
  biaya_pengetahuan: number;           
  pengaruh_kerugian: number;           
  Frekuensi_serangan: number;          
  Pemulihan: number;                   
  mengerti_poin: boolean;              
  Tidak_mengerti_poin?: string;       
  description_tidak_mengerti?: string; 
}

export interface SubmitInputsResponse {
  peluang: number;
  impact: number;
  total: number;
  category: RiskCategory;
  threatDescription?: {
    category: RiskCategory;
    threatName: string;
    description: string;
    recommendations: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    actionRequired: boolean;
  };
}

export interface GetScoreResponse {
  peluang: number;
  impact: number;
  total: number;
  category: RiskCategory;
  threatDescription?: {
    category: RiskCategory;
    threatName: string;
    description: string;
    recommendations: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    actionRequired: boolean;
  };
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
