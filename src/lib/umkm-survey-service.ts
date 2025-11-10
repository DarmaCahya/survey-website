import { 
  IAssetRepository, 
  IThreatRepository,
  ISubmissionRepository, 
  IFormProgressRepository,
  IAdminRepository 
} from '@/lib/repositories';
import { 
  IRiskCalculationService 
} from '@/lib/risk-calculation';
import { InvalidRiskInputError } from '@/lib/custom-errors';
import {
  getCurrentQuarter,
  getCurrentYear,
  getNextQuarterStartDate,
  formatDateIndonesian
} from '@/lib/quarter-utils';
import { 
  CreateSubmissionRequest, 
  CreateSubmissionResponse,
  BatchSubmissionRequest,
  BatchSubmissionResponse,
  SubmitInputsRequest,
  SubmitInputsResponse,
  GetScoreResponse,
  AssetResponse,
  ThreatResponse,
  UMKMProgressResponse,
  FormStatus,
  UnderstandLevel,
  RiskCategory,
  SubmissionEligibility
} from '@/types/risk';

/**
 * UMKM Survey service following SOLID principles
 * Single Responsibility: Orchestrates UMKM survey business logic
 * Dependency Inversion: Depends on interfaces, not concrete implementations
 */
export interface IUMKMSurveyService {
  getAssets(): Promise<AssetResponse[]>;
  getAssetThreats(assetId: number): Promise<ThreatResponse[]>;
  createSubmission(userId: number, request: CreateSubmissionRequest): Promise<CreateSubmissionResponse>;
  createBatchSubmission(userId: number, request: BatchSubmissionRequest): Promise<BatchSubmissionResponse>;
  submitInputs(userId: number, submissionId: number, request: SubmitInputsRequest): Promise<SubmitInputsResponse>;
  getScore(userId: number, submissionId: number): Promise<GetScoreResponse>;
  getUMKMProgress(): Promise<UMKMProgressResponse[]>;
  getSubmissionEligibility(userId: number, assetId: number, threatId: number): Promise<SubmissionEligibility>;
}

export class UMKMSurveyService implements IUMKMSurveyService {
  constructor(
    private assetRepository: IAssetRepository,
    private threatRepository: IThreatRepository,
    private submissionRepository: ISubmissionRepository,
    private formProgressRepository: IFormProgressRepository,
    private adminRepository: IAdminRepository,
    private riskCalculationService: IRiskCalculationService
  ) {}

  /**
   * Get all assets with threat counts
   */
  async getAssets(): Promise<AssetResponse[]> {
    return await this.assetRepository.findAll();
  }

  /**
   * Get threats for a specific asset
   */
  async getAssetThreats(assetId: number): Promise<ThreatResponse[]> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    return await this.assetRepository.findThreatsByAssetId(assetId);
  }

  /**
   * Get submission eligibility for a user-asset-threat combination
   * Checks if user can submit in the current quarter
   * User can submit again only in the next quarter (no same-quarter resubmit)
   */
  async getSubmissionEligibility(userId: number, assetId: number, threatId: number): Promise<SubmissionEligibility> {
    const currentQuarter = getCurrentQuarter();
    const currentYear = getCurrentYear();

    // Check if submission already exists for this user-asset-threat combination in current quarter
    const existingSubmission = await this.submissionRepository.findByUserAssetThreatInQuarter(
      userId,
      assetId,
      threatId,
      currentQuarter,
      currentYear
    );

    // Check if all assets are completed in current quarter
    const allAssets = await this.assetRepository.findAll();
    const allAssetsCompleted = await this.checkAllAssetsCompleted(userId, currentQuarter, currentYear, allAssets);

    // Always calculate next submission date for information purposes
    const nextSubmissionDate = getNextQuarterStartDate();

    // If there is an existing submission in the current quarter, user cannot submit again
    // Show information about next submission window and last submission
    if (existingSubmission) {
      return {
        canSubmit: false,
        currentQuarter,
        currentYear,
        nextSubmissionDate: nextSubmissionDate.toISOString(),
        allAssetsCompleted,
        lastSubmission: {
          quarter: existingSubmission.quarter,
          year: existingSubmission.year,
          submittedAt: existingSubmission.submittedAt.toISOString()
        }
      };
    }

    // User can submit if no existing submission in current quarter
    return {
      canSubmit: true,
      currentQuarter,
      currentYear,
      nextSubmissionDate: nextSubmissionDate.toISOString(), // Always include next date for information
      allAssetsCompleted
    };
  }

  /**
   * Check if user has completed all assets in current quarter
   */
  private async checkAllAssetsCompleted(
    userId: number,
    quarter: number,
    year: number,
    allAssets: AssetResponse[]
  ): Promise<boolean> {
    if (allAssets.length === 0) return true;

    // Check each asset
    for (const asset of allAssets) {
      const assetThreats = await this.assetRepository.findThreatsByAssetId(asset.id);
      
      // Check each threat for this asset
      for (const threat of assetThreats) {
        const submission = await this.submissionRepository.findByUserAssetThreatInQuarter(
          userId,
          asset.id,
          threat.id,
          quarter,
          year
        );
        
        // If no submission or submission has no score, asset is not completed
        if (!submission || !submission.score) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Create a new submission for a user
   * Prevents duplicate submissions: 1 user can only submit once per asset-threat combination per quarter
   * No same-quarter resubmission (prevents overwriting historical data)
   */
  async createSubmission(userId: number, request: CreateSubmissionRequest): Promise<CreateSubmissionResponse> {
    // Validate asset exists
    const asset = await this.assetRepository.findById(request.assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Validate threat exists for this asset
    const threats = await this.assetRepository.findThreatsByAssetId(request.assetId);
    const threat = threats.find(t => t.id === request.threatId);
    if (!threat) {
      throw new Error('Threat not found for this asset');
    }

    // Get current quarter and year
    const currentQuarter = getCurrentQuarter();
    const currentYear = getCurrentYear();

    // Check if submission already exists for this user-asset-threat combination in current quarter
    const existingSubmission = await this.submissionRepository.findByUserAssetThreatInQuarter(
      userId, 
      request.assetId, 
      request.threatId,
      currentQuarter,
      currentYear
    );
    
    // Prevent same-quarter resubmission regardless of completion status
    if (existingSubmission) {
      const nextSubmissionDate = getNextQuarterStartDate();
      const formattedDate = formatDateIndonesian(nextSubmissionDate);
      throw new Error(`Anda sudah submit di Q${currentQuarter} ${currentYear}. Anda dapat mengisi form kembali mulai ${formattedDate}.`);
    }

    // Create new submission with quarter and year
    const submissionId = await this.submissionRepository.create(
      userId, 
      request.assetId, 
      request.threatId,
      currentQuarter,
      currentYear
    );

    // Update form progress to in_progress
    await this.formProgressRepository.updateProgress(
      userId, 
      request.assetId, 
      FormStatus.IN_PROGRESS
    );

    return { 
      submissionId,
      quarter: currentQuarter,
      year: currentYear
    };
  }

  /**
   * Helper function to get feedback field value with multiple name variations
   */
  private getFeedbackFieldValue(
    obj: Record<string, unknown>,
    fieldNames: string[]
  ): string | undefined {
    for (const fieldName of fieldNames) {
      const value = obj[fieldName];
      if (typeof value === 'string' && value) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Create batch submissions for multiple threats in an asset
   */
  async createBatchSubmission(
    userId: number, 
    request: BatchSubmissionRequest
  ): Promise<BatchSubmissionResponse> {
    // Validate asset exists
    const asset = await this.assetRepository.findById(request.assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Get all threats for this asset to validate threat IDs
    const assetThreats = await this.assetRepository.findThreatsByAssetId(request.assetId);
    const validThreatIds = assetThreats.map(t => t.id);

    // Validate that submitted threat IDs are valid for this asset
    const submittedThreatIds = request.threats.map(t => t.threatId);
    const invalidThreatIds = submittedThreatIds.filter(id => !validThreatIds.includes(id));

    if (invalidThreatIds.length > 0) {
      throw new Error(`Invalid threat IDs for asset ${request.assetId}: ${invalidThreatIds.join(', ')}. Valid threat IDs are: ${validThreatIds.join(', ')}`);
    }

    // Get current quarter and year
    const currentQuarter = getCurrentQuarter();
    const currentYear = getCurrentYear();

    // Check if all assets are completed
    const allAssets = await this.assetRepository.findAll();
    const allAssetsCompleted = await this.checkAllAssetsCompleted(userId, currentQuarter, currentYear, allAssets);

    const results = [];

    // Process each threat submission
    for (const threatAnswer of request.threats) {
      try {
        // Check if submission already exists for this user-asset-threat combination in current quarter
        const existingSubmission = await this.submissionRepository.findByUserAssetThreatInQuarter(
          userId, 
          request.assetId, 
          threatAnswer.threatId,
          currentQuarter,
          currentYear
        );
        
        if (existingSubmission) {
          if (!existingSubmission.score) {
            const submissionId = existingSubmission.id;
            
            // Handle field name variations for backward compatibility
            // Convert answers to SubmitInputsRequest format
            // Handle field name variations for backward compatibility
            const inputsRequest: SubmitInputsRequest = {
              biaya_pengetahuan: threatAnswer.biaya_pengetahuan,
              pengaruh_kerugian: threatAnswer.pengaruh_kerugian,
              Frekuensi_serangan: threatAnswer.Frekuensi_serangan,
              Pemulihan: threatAnswer.Pemulihan,
              mengerti_poin: threatAnswer.mengerti_poin,
              // Handle different field name variations
              Tidak_mengerti_poin: this.getFeedbackFieldValue(threatAnswer as unknown as Record<string, unknown>, [
                'Tidak_mengerti_poin',
                'tidak_mengerti_poin',
                'tidak_mengerti'
              ]),
              // Handle description field name variations
              description_tidak_mengerti: this.getFeedbackFieldValue(threatAnswer as unknown as Record<string, unknown>, [
                'description_tidak_mengerti',
                'tidak_mengerti_description',
                'description'
              ])
            };

            const result = await this.submitInputs(userId, submissionId, inputsRequest);

            results.push({
              threatId: threatAnswer.threatId,
              submissionId: submissionId,
              success: true,
              result: result
            });
            continue;
          }

          // Block same-quarter resubmission after completion
          const nextSubmissionDate = getNextQuarterStartDate();
          const formattedDate = formatDateIndonesian(nextSubmissionDate);
          results.push({
            threatId: threatAnswer.threatId,
            submissionId: existingSubmission.id,
            success: false,
            error: `Anda sudah submit di Q${currentQuarter} ${currentYear}. Anda dapat mengisi form kembali mulai ${formattedDate}.`
          });
          continue;
        }

        // Create submission with quarter and year
        const submissionId = await this.submissionRepository.create(
          userId, 
          request.assetId, 
          threatAnswer.threatId,
          currentQuarter,
          currentYear
        );

        // Convert answers to SubmitInputsRequest format
        // Handle field name variations for backward compatibility
        const inputsRequest: SubmitInputsRequest = {
          biaya_pengetahuan: threatAnswer.biaya_pengetahuan,
          pengaruh_kerugian: threatAnswer.pengaruh_kerugian,
          Frekuensi_serangan: threatAnswer.Frekuensi_serangan,
          Pemulihan: threatAnswer.Pemulihan,
          mengerti_poin: threatAnswer.mengerti_poin,
          // Handle different field name variations
          Tidak_mengerti_poin: this.getFeedbackFieldValue(threatAnswer as unknown as Record<string, unknown>, [
            'Tidak_mengerti_poin',
            'tidak_mengerti_poin',
            'tidak_mengerti'
          ]),
          // Handle description field name variations
          description_tidak_mengerti: this.getFeedbackFieldValue(threatAnswer as unknown as Record<string, unknown>, [
            'description_tidak_mengerti',
            'tidak_mengerti_description',
            'description'
          ])
        };

        // Submit inputs and calculate scores
        const result = await this.submitInputs(userId, submissionId, inputsRequest);

        results.push({
          threatId: threatAnswer.threatId,
          submissionId: submissionId,
          success: true,
          result: result
        });

      } catch (error) {
        results.push({
          threatId: threatAnswer.threatId,
          submissionId: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    // Update form progress to completed if all submissions were successful
    const allSuccessful = results.every(r => r.success);
    if (allSuccessful) {
      await this.formProgressRepository.updateProgress(
        userId, 
        request.assetId, 
        FormStatus.SUBMITTED
      );
    } else {
      // Update to in_progress if some submissions were successful
      const someSuccessful = results.some(r => r.success);
      if (someSuccessful) {
        await this.formProgressRepository.updateProgress(
          userId, 
          request.assetId, 
          FormStatus.IN_PROGRESS
        );
      }
    }

    return { submissions: results };
  }

  /**
   * Submit risk assessment inputs and calculate scores
   */
  async submitInputs(
    userId: number, 
    submissionId: number, 
    request: SubmitInputsRequest
  ): Promise<SubmitInputsResponse> {
    // Get submission and validate ownership
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new Error('Unauthorized access to submission');
    }

    // Check if all assets are completed - if yes, allow resubmission
    const allAssets = await this.assetRepository.findAll();
    const allAssetsCompleted = await this.checkAllAssetsCompleted(
      userId, 
      submission.quarter, 
      submission.year, 
      allAssets
    );

    // If submission already has score and not all assets completed, prevent resubmission
    if (submission.score && !allAssetsCompleted) {
      throw new Error('This submission has already been completed with a score. Selesaikan semua asset form terlebih dahulu untuk dapat resubmit.');
    }

    try {
      // Convert boolean mengerti_poin to UnderstandLevel enum
      const understandLevel = request.mengerti_poin ? 'MENGERTI' : 'TIDAK_MENGERTI';

      // Get threat name for context-aware calculation
      const threat = await this.threatRepository.findById(submission.threatId);
      if (!threat) {
        throw new Error('Threat not found');
      }

      // Calculate risk score with threat context
      const scoreWithContext = this.riskCalculationService.calculateWithThreatContext({
        f: request.biaya_pengetahuan,
        g: request.pengaruh_kerugian,
        h: request.Frekuensi_serangan,
        i: request.Pemulihan
      }, threat.name);

      // Update risk inputs using new field names
      await this.submissionRepository.updateRiskInput(
        submissionId,
        request.biaya_pengetahuan,
        request.pengaruh_kerugian,
        request.Frekuensi_serangan,
        request.Pemulihan
      );

      // Update score
      await this.submissionRepository.updateScore(
        submissionId,
        scoreWithContext.peluang,
        scoreWithContext.impact,
        scoreWithContext.total,
        scoreWithContext.category,
        scoreWithContext.threatDescription
      );

      // Update understanding level
      await this.submissionRepository.updateUnderstand(
        submissionId,
        understandLevel as UnderstandLevel
      );

      // Save feedback if user doesn't understand
      if (!request.mengerti_poin) {
        // Save feedback for "mengerti_poin" field
        await this.submissionRepository.createFeedback(
          submissionId,
          'mengerti_poin',
          request.mengerti_poin ? 'Mengerti' : 'Tidak Mengerti'
        );

        // Save feedback for "Tidak_mengerti_poin" if provided
        if (request.Tidak_mengerti_poin) {
          await this.submissionRepository.createFeedback(
            submissionId,
            'Tidak_mengerti_poin',
            request.Tidak_mengerti_poin
          );
        }

        // Save feedback for "description_tidak_mengerti" if provided
        if (request.description_tidak_mengerti) {
          await this.submissionRepository.createFeedback(
            submissionId,
            'description_tidak_mengerti',
            request.description_tidak_mengerti
          );
        }
      } else {
        // Save feedback for "mengerti_poin" field when user understands
        await this.submissionRepository.createFeedback(
          submissionId,
          'mengerti_poin',
          'Mengerti'
        );
      }

      // Update form progress to submitted
      await this.formProgressRepository.updateProgress(
        userId,
        submission.assetId,
        FormStatus.SUBMITTED
      );

      return {
        peluang: scoreWithContext.peluang,
        impact: scoreWithContext.impact,
        total: scoreWithContext.total,
        category: scoreWithContext.category,
        threatDescription: {
          ...scoreWithContext.threatDescription,
          category: scoreWithContext.category as RiskCategory
        }
      };

    } catch (error) {
      // Re-throw validation errors as-is
      if (error instanceof InvalidRiskInputError) {
        throw error;
      }
      throw new Error(`Failed to submit inputs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get score for a submission
   */
  async getScore(userId: number, submissionId: number): Promise<GetScoreResponse> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new Error('Unauthorized access to submission');
    }

    if (!submission.score) {
      throw new Error('Score not calculated yet');
    }

    return {
      peluang: submission.score.peluang,
      impact: submission.score.impact,
      total: submission.score.total,
      category: submission.score.category as RiskCategory,
      threatDescription: submission.score.threatDescription as {
        category: RiskCategory;
        threatName: string;
        description: string;
        recommendations: string[];
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        actionRequired: boolean;
      } | undefined
    };
  }

  /**
   * Get UMKM progress for admin dashboard
   */
  async getUMKMProgress(): Promise<UMKMProgressResponse[]> {
    return await this.adminRepository.getUMKMProgress();
  }
}
