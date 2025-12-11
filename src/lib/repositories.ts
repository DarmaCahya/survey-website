import { db } from '@/lib/database';
import { 
  AssetResponse, 
  ThreatResponse, 
  UMKMProgressResponse,
  FormStatus,
  UnderstandLevel,
  RiskCategory
} from '@/types/risk';
import { SubmissionHistoryQuery, SubmissionHistoryResponse, SubmissionHistoryUsersResponse } from '@/types/history';
import { Submission, RiskInput, Score, Prisma } from '@prisma/client';

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
  create(userId: number, assetId: number, threatId: number, month: number, year: number): Promise<number>;
  findById(id: number): Promise<SubmissionWithRelations | null>;
  findByUserAssetThreat(userId: number, assetId: number, threatId: number): Promise<SubmissionWithRelations | null>;
  findByUserAssetThreatInMonth(userId: number, assetId: number, threatId: number, month: number, year: number): Promise<SubmissionWithRelations | null>;
  findByUserAndAsset(userId: number, assetId: number): Promise<SubmissionWithRelations[]>;
  findByUserAndAssetInMonth(userId: number, assetId: number, month: number, year: number): Promise<SubmissionWithRelations[]>;
  findHistory(query: SubmissionHistoryQuery): Promise<SubmissionHistoryResponse>;
  findHistoryUsers(query: SubmissionHistoryQuery): Promise<SubmissionHistoryUsersResponse>;
  updateRiskInput(submissionId: number, f: number, g: number, h: number, i: number): Promise<void>;
  updateScore(submissionId: number, peluang: number, impact: number, total: number, category: RiskCategory, threatDescription?: unknown): Promise<void>;
  updateUnderstand(submissionId: number, understand: UnderstandLevel): Promise<void>;
  createFeedback(submissionId: number, field: string, message: string): Promise<void>;
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
  async create(userId: number, assetId: number, threatId: number, month: number, year: number): Promise<number> {
    const submission = await db.submission.create({
      data: {
        userId,
        assetId,
        threatId,
        month,
        year,
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
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });
  }

  async findByUserAssetThreatInMonth(userId: number, assetId: number, threatId: number, month: number, year: number): Promise<SubmissionWithRelations | null> {
    return await db.submission.findFirst({
      where: {
        userId,
        assetId,
        threatId,
        month,
        year
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

  async findByUserAndAsset(userId: number, assetId: number): Promise<SubmissionWithRelations[]> {
    return await db.submission.findMany({
      where: {
        userId,
        assetId
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
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });
  }

  async findByUserAndAssetInMonth(userId: number, assetId: number, month: number, year: number): Promise<SubmissionWithRelations[]> {
    return await db.submission.findMany({
      where: {
        userId,
        assetId,
        month,
        year
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
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });
  }

  async findHistory(query: SubmissionHistoryQuery): Promise<SubmissionHistoryResponse> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const sort = query.sort === 'asc' ? 'asc' : 'desc';
    const months = Math.max(1, query.months ?? 12);

    // Hitung batas awal 12 bulan terakhir (awal bulan)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - (months - 1));

    const where: Prisma.SubmissionWhereInput = {
      submittedAt: { gte: startDate }
    };

    if (query.userId) where.userId = query.userId;
    if (query.userName) {
      where.user = {
        name: {
          contains: query.userName,
          mode: 'insensitive'
        }
      };
    }
    if (query.assetId) where.assetId = query.assetId;
    if (query.threatId) where.threatId = query.threatId;

    const [items, total] = await Promise.all([
      db.submission.findMany({
        where,
        include: {
          score: true,
          user: { select: { id: true, email: true, name: true } },
          asset: { select: { id: true, name: true } },
          threat: { select: { id: true, name: true } }
        },
        orderBy: { submittedAt: sort },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.submission.count({ where })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: items.map(item => ({
        submissionId: item.id,
        month: item.month,
        year: item.year,
        submittedAt: item.submittedAt.toISOString(),
        understand: item.understand as UnderstandLevel,
        user: {
          id: item.user.id,
          email: item.user.email,
          name: item.user.name
        },
        asset: {
          id: item.asset.id,
          name: item.asset.name
        },
        threat: {
          id: item.threat.id,
          name: item.threat.name
        },
        score: item.score
          ? {
              peluang: item.score.peluang,
              impact: item.score.impact,
              total: item.score.total,
              category: item.score.category as RiskCategory | null
            }
          : {
              peluang: null,
              impact: null,
              total: null,
              category: null
            }
      })),
      page,
      pageSize,
      total,
      totalPages
    };
  }

  async findHistoryUsers(query: SubmissionHistoryQuery): Promise<SubmissionHistoryUsersResponse> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
    const months = Math.max(1, query.months ?? 12);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - (months - 1));

    const where: Prisma.SubmissionWhereInput = {
      submittedAt: { gte: startDate }
    };
    if (query.userName) {
      where.user = {
        name: {
          contains: query.userName,
          mode: 'insensitive'
        }
      };
    }

    // Total unique users (groupBy tanpa pagination)
    const totalGroups = await db.submission.groupBy({
      by: ['userId'],
      where,
    });
    const total = totalGroups.length;

    const users = await db.submission.groupBy({
      by: ['userId'],
      where,
      _count: { _all: true },
      _max: { submittedAt: true },
      orderBy: {
        _max: { submittedAt: 'desc' }
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // fetch user details
    const userIds = users.map(u => u.userId);
    const userDetails = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true }
    });
    const userMap = new Map(userDetails.map(u => [u.id, u]));

    const items = users.map(u => {
      const info = userMap.get(u.userId);
      return {
        id: u.userId,
        name: info?.name ?? null,
        email: info?.email ?? '',
        submissions: u._count._all,
        latestSubmittedAt: u._max.submittedAt ? u._max.submittedAt.toISOString() : null
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      users: items,
      page,
      pageSize,
      total,
      totalPages
    };
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

  async createFeedback(submissionId: number, field: string, message: string): Promise<void> {
    await db.feedback.create({
      data: {
        submissionId,
        field,
        message
      }
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
