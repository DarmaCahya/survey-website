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
import { 
  CreateSubmissionRequest, 
  CreateSubmissionResponse,
  SubmitInputsRequest,
  SubmitInputsResponse,
  GetScoreResponse,
  AssetResponse,
  ThreatResponse,
  UMKMProgressResponse,
  RiskValidationError,
  FormStatus,
  UnderstandLevel
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
  submitInputs(userId: number, submissionId: number, request: SubmitInputsRequest): Promise<SubmitInputsResponse>;
  getScore(userId: number, submissionId: number): Promise<GetScoreResponse>;
  getUMKMProgress(): Promise<UMKMProgressResponse[]>;
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
   * Create a new submission for a user
   * Prevents duplicate submissions: 1 user can only submit once per asset-threat combination
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

    // Check if submission already exists for this user-asset-threat combination
    const existingSubmission = await this.submissionRepository.findByUserAssetThreat(
      userId, 
      request.assetId, 
      request.threatId
    );
    
    if (existingSubmission) {
      throw new Error('Submission already exists for this asset-threat combination. Each user can only submit once per asset-threat.');
    }

    // Create submission
    const submissionId = await this.submissionRepository.create(
      userId, 
      request.assetId, 
      request.threatId
    );

    // Update form progress to in_progress
    await this.formProgressRepository.updateProgress(
      userId, 
      request.assetId, 
      FormStatus.IN_PROGRESS
    );

    return { submissionId };
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

    // Check if inputs have already been submitted for this submission
    if (submission.riskInput) {
      throw new Error('Inputs have already been submitted for this submission. Each submission can only be completed once.');
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
        scoreWithContext.category
      );

      // Update understanding level
      await this.submissionRepository.updateUnderstand(
        submissionId,
        understandLevel
      );

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
        threatDescription: scoreWithContext.threatDescription
      };

    } catch (error) {
      if (error instanceof RiskValidationError) {
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
      category: submission.score.category
    };
  }

  /**
   * Get UMKM progress for admin dashboard
   */
  async getUMKMProgress(): Promise<UMKMProgressResponse[]> {
    return await this.adminRepository.getUMKMProgress();
  }
}
