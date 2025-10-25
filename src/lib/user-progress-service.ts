import { db } from '@/lib/database';

export interface UserProgress {
  totalAssets: number;
  completedAssets: number;
  inProgressAssets: number;
  notStartedAssets: number;
  progressPercentage: number;
  assetProgress: Array<{
    assetId: number;
    assetName: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
    completedThreats: number;
    totalThreats: number;
    threats: Array<{
      threatId: number;
      threatName: string;
      status: 'COMPLETED' | 'NOT_STARTED';
      submissionId?: number;
    }>;
  }>;
}

export interface UserProgressSummary {
  totalAssets: number;
  completedAssets: number;
  inProgressAssets: number;
  notStartedAssets: number;
  progressPercentage: number;
}

export class UserProgressService {
  /**
   * Get detailed progress for a specific user
   */
  async getUserProgress(userId: number): Promise<UserProgress> {
    // Get all assets with their threats
    const assets = await db.asset.findMany({
      include: {
        threats: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Get user's form progress
    const formProgress = await db.formProgress.findMany({
      where: { userId },
      include: {
        asset: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get user's submissions
    const submissions = await db.submission.findMany({
      where: { userId },
      select: {
        id: true,
        assetId: true,
        threatId: true,
        score: true
      }
    });

    // Create progress map for quick lookup
    const progressMap = new Map<number, string>();
    formProgress.forEach(fp => {
      progressMap.set(fp.assetId, fp.status);
    });

    // Create submissions map for quick lookup
    const submissionsMap = new Map<string, { id: number; completed: boolean }>();
    submissions.forEach(sub => {
      const key = `${sub.assetId}-${sub.threatId}`;
      submissionsMap.set(key, { id: sub.id, completed: !!sub.score });
    });

    // Calculate progress for each asset
    const assetProgress = assets.map(asset => {
      // const assetSubmissions = submissions.filter(sub => sub.assetId === asset.id);
      
      const threats = asset.threats.map(threat => {
        const submissionKey = `${asset.id}-${threat.id}`;
        const submission = submissionsMap.get(submissionKey);
        
        return {
          threatId: threat.id,
          threatName: threat.name,
          status: submission?.completed ? 'COMPLETED' as const : 'NOT_STARTED' as const,
          submissionId: submission?.id
        };
      });

      const completedThreats = threats.filter(t => t.status === 'COMPLETED').length;
      const totalThreats = threats.length;
      
      // Determine asset status based on threat completion
      let assetStatus: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
      if (completedThreats === 0) {
        assetStatus = 'NOT_STARTED' as const;
      } else if (completedThreats === totalThreats) {
        assetStatus = 'COMPLETED' as const;
      } else {
        assetStatus = 'IN_PROGRESS' as const;
      }

      return {
        assetId: asset.id,
        assetName: asset.name,
        status: assetStatus,
        completedThreats,
        totalThreats,
        threats
      };
    });

    // Calculate summary statistics
    const totalAssets = assets.length;
    const completedAssets = assetProgress.filter(a => a.status === 'COMPLETED').length;
    const inProgressAssets = assetProgress.filter(a => a.status === 'IN_PROGRESS').length;
    const notStartedAssets = assetProgress.filter(a => a.status === 'NOT_STARTED').length;
    const progressPercentage = totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0;

    return {
      totalAssets,
      completedAssets,
      inProgressAssets,
      notStartedAssets,
      progressPercentage,
      assetProgress
    };
  }

  /**
   * Get summary progress for a specific user
   */
  async getUserProgressSummary(userId: number): Promise<UserProgressSummary> {
    const detailedProgress = await this.getUserProgress(userId);
    
    return {
      totalAssets: detailedProgress.totalAssets,
      completedAssets: detailedProgress.completedAssets,
      inProgressAssets: detailedProgress.inProgressAssets,
      notStartedAssets: detailedProgress.notStartedAssets,
      progressPercentage: detailedProgress.progressPercentage
    };
  }

  /**
   * Get progress for all users (admin view)
   */
  async getAllUsersProgress(): Promise<Array<{
    userId: number;
    userEmail: string;
    userName: string;
    progress: UserProgressSummary;
  }>> {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      },
      orderBy: { id: 'asc' }
    });

    const usersProgress = await Promise.all(
      users.map(async (user) => {
        const progress = await this.getUserProgressSummary(user.id);
        return {
          userId: user.id,
          userEmail: user.email,
          userName: user.name || 'Unknown',
          progress
        };
      })
    );

    return usersProgress;
  }
}
