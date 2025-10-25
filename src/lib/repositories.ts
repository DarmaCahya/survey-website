import { db } from '@/lib/database';
import { 
  AssetResponse, 
  ThreatResponse, 
  UMKMProgressResponse,
  FormStatus,
  UnderstandLevel,
  RiskCategory
} from '@/types/risk';
import { Submission, RiskInput, Score } from '@prisma/client';

// Type for submission with related data
export type SubmissionWithRelations = Submission & {
  riskInput: RiskInput | null;
  score: Score | null;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  asset: {
    id: number;
    name: string;
  };
  threat: {
    id: number;
    name: string;
  };
};

/**
 * Asset repository interface following Dependency Inversion Principle
 */
export interface IAssetRepository {
  findAll(): Promise<AssetResponse[]>;
  findById(id: number): Promise<AssetResponse | null>;
  findThreatsByAssetId(assetId: number): Promise<ThreatResponse[]>;
}

/**
 * Threat repository interface
 */
export interface IThreatRepository {
  findById(id: number): Promise<ThreatResponse | null>;
}

/**
 * Submission repository interface
 */
export interface ISubmissionRepository {
  create(userId: number, assetId: number, threatId: number): Promise<number>;
  findById(id: number): Promise<SubmissionWithRelations | null>;
  findByUserAssetThreat(userId: number, assetId: number, threatId: number): Promise<SubmissionWithRelations | null>;
  updateRiskInput(submissionId: number, f: number, g: number, h: number, i: number): Promise<void>;
  updateScore(submissionId: number, peluang: number, impact: number, total: number, category: RiskCategory, threatDescription?: unknown): Promise<void>;
  updateUnderstand(submissionId: number, understand: UnderstandLevel): Promise<void>;
}

/**
 * Form progress repository interface
 */
export interface IFormProgressRepository {
  updateProgress(userId: number, assetId: number, status: FormStatus): Promise<void>;
  getProgress(userId: number, assetId: number): Promise<FormStatus | null>;
}

/**
 * Admin repository interface
 */
export interface IAdminRepository {
  getUMKMProgress(): Promise<UMKMProgressResponse[]>;
}

/**
 * Asset repository implementation
 */
export class AssetRepository implements IAssetRepository {
  async findAll(): Promise<AssetResponse[]> {
    const assets = await db.asset.findMany({
      include: {
        threats: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      threatCount: asset.threats.length
    }));
  }

  async findById(id: number): Promise<AssetResponse | null> {
    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        threats: true
      }
    });

    if (!asset) return null;

    return {
      id: asset.id,
      name: asset.name,
      threatCount: asset.threats.length
    };
  }

  async findThreatsByAssetId(assetId: number): Promise<ThreatResponse[]> {
    const threats = await db.threat.findMany({
      where: { assetId },
      orderBy: {
        name: 'asc'
      }
    });

    return threats.map(threat => ({
      id: threat.id,
      name: threat.name,
      description: threat.description || undefined
    }));
  }
}

/**
 * Threat repository implementation
 */
export class ThreatRepository implements IThreatRepository {
  async findById(id: number): Promise<ThreatResponse | null> {
    const threat = await db.threat.findUnique({
      where: { id }
    });

    if (!threat) return null;

    return {
      id: threat.id,
      name: threat.name,
      description: threat.description || undefined
    };
  }
}

/**
 * Submission repository implementation
 */
export class SubmissionRepository implements ISubmissionRepository {
  async create(userId: number, assetId: number, threatId: number): Promise<number> {
    const submission = await db.submission.create({
      data: {
        userId,
        assetId,
        threatId,
        understand: UnderstandLevel.MENGERTI // Default value
      }
    });

    return submission.id;
  }

  async findById(id: number): Promise<SubmissionWithRelations | null> {
    return await db.submission.findUnique({
      where: { id },
      include: {
        riskInput: true,
        score: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true
          }
        },
        threat: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async findByUserAssetThreat(userId: number, assetId: number, threatId: number): Promise<SubmissionWithRelations | null> {
    return await db.submission.findFirst({
      where: {
        userId,
        assetId,
        threatId
      },
      include: {
        riskInput: true,
        score: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true
          }
        },
        threat: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async updateRiskInput(submissionId: number, f: number, g: number, h: number, i: number): Promise<void> {
    await db.riskInput.upsert({
      where: { submissionId },
      create: {
        submissionId,
        f,
        g,
        h,
        i
      },
      update: {
        f,
        g,
        h,
        i
      }
    });
  }

  async updateScore(submissionId: number, peluang: number, impact: number, total: number, category: RiskCategory, threatDescription?: unknown): Promise<void> {
    await db.score.upsert({
      where: { submissionId },
      create: {
        submissionId,
        peluang,
        impact,
        total,
        category,
        threatDescription: threatDescription || undefined
      },
      update: {
        peluang,
        impact,
        total,
        category,
        threatDescription: threatDescription || undefined
      }
    });
  }

  async updateUnderstand(submissionId: number, understand: UnderstandLevel): Promise<void> {
    await db.submission.update({
      where: { id: submissionId },
      data: { understand }
    });
  }
}

/**
 * Form progress repository implementation
 */
export class FormProgressRepository implements IFormProgressRepository {
  async updateProgress(userId: number, assetId: number, status: FormStatus): Promise<void> {
    await db.formProgress.upsert({
      where: {
        userId_assetId: {
          userId,
          assetId
        }
      },
      create: {
        userId,
        assetId,
        status
      },
      update: {
        status
      }
    });
  }

  async getProgress(userId: number, assetId: number): Promise<FormStatus | null> {
    const progress = await db.formProgress.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId
        }
      }
    });

    return (progress?.status as FormStatus) || null;
  }
}

/**
 * Admin repository implementation
 */
export class AdminRepository implements IAdminRepository {
  async getUMKMProgress(): Promise<UMKMProgressResponse[]> {
    const users = await db.user.findMany({
      where: {
        isActive: true
      },
      include: {
        formProgress: {
          include: {
            asset: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users.map(user => {
      const totalAssets = user.formProgress.length;
      const completedAssets = user.formProgress.filter(
        progress => progress.status === FormStatus.SUBMITTED
      ).length;
      
      const progressPercentage = totalAssets > 0 
        ? Math.round((completedAssets / totalAssets) * 100) 
        : 0;

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        totalAssets,
        completedAssets,
        progressPercentage
      };
    });
  }
}
