import { RiskInput, RiskScore, RiskCategory } from '@/types/risk';
import { InvalidRiskInputError } from '@/lib/custom-errors';
import { ThreatDescriptionService, ThreatSpecificDescription } from './threat-description-service';

/**
 * Core risk calculation service following SOLID principles
 * Single Responsibility: Only handles risk calculations
 * Open/Closed: Can be extended without modification
 */
export interface IRiskCalculationService {
  calculate(input: RiskInput): RiskScore;
  calculateWithThreatContext(input: RiskInput, threatName: string): RiskScore & { threatDescription: ThreatSpecificDescription };
  validateInput(input: RiskInput): void;
}

export class RiskCalculationService implements IRiskCalculationService {
  private threatDescriptionService: ThreatDescriptionService;

  constructor() {
    this.threatDescriptionService = new ThreatDescriptionService();
  }

  /**
   * Calculate risk score based on UMKM Cyber Risk Survey formula
   * 
   * Formula:
   * J (Peluang Serangan) = ((F*2)+(G*2)+H+I)/6
   * K (Impact)           = (H+I)/2
   * L (Total Resiko)     = ROUND(J*K, 0)   // skala 1..36
   * M (Kategori)         = IF(L<=15,"Low Risk", IF(L<=25,"Medium Risk","High Risk"))
   * 
   * Input meanings:
   * F = Peluang Serangan (1-6)
   * G = Impact (1-6)
   * H = Total Resiko (1-6)
   * I = Kategori Risiko (2/4/6)
   * 
   * @param input Risk assessment inputs
   * @returns Calculated risk score
   */
  calculate(input: RiskInput): RiskScore {
    // Validate inputs first
    this.validateInput(input);

    // J (Peluang Serangan) = ((F*2)+(G*2)+H+I)/6
    const peluang = ((input.f * 2) + (input.g * 2) + input.h + input.i) / 6;

    // K (Impact) = (H+I)/2
    const impact = (input.h + input.i) / 2;

    // L (Total Resiko) = ROUND(J*K, 0)
    const total = Math.round(peluang * impact);

    // M (Kategori) = IF(L<=15,"Low Risk", IF(L<=25,"Medium Risk","High Risk"))
    const category = this.determineCategory(total);

    return {
      peluang: Math.round(peluang * 10000) / 10000, // Round to 4 decimal places
      impact: Math.round(impact * 10000) / 10000,   // Round to 4 decimal places
      total,
      category
    };
  }

  /**
   * Calculate risk score with threat-specific description
   * @param input Risk assessment inputs
   * @param threatName Name of the threat being assessed
   * @returns Calculated risk score with threat-specific description
   */
  calculateWithThreatContext(input: RiskInput, threatName: string): RiskScore & { threatDescription: ThreatSpecificDescription } {
    const riskScore = this.calculate(input);
    const threatDescription = this.threatDescriptionService.generateThreatDescription(threatName, riskScore.category);
    
    return {
      ...riskScore,
      threatDescription
    };
  }

  /**
   * Validate risk input parameters
   * @param input Risk assessment inputs
   * @throws RiskValidationError if validation fails
   */
  validateInput(input: RiskInput): void {
    // Field mapping for better error messages
    const fieldMapping = {
      f: { name: 'biaya_pengetahuan', description: 'Biaya Pengetahuan' },
      g: { name: 'pengaruh_kerugian', description: 'Pengaruh Kerugian' },
      h: { name: 'Frekuensi_serangan', description: 'Frekuensi Serangan' },
      i: { name: 'Pemulihan', description: 'Pemulihan' }
    };

    // Validate F (Biaya Pengetahuan): 1-6
    if (!Number.isInteger(input.f) || input.f < 1 || input.f > 6) {
      throw new InvalidRiskInputError(
        fieldMapping.f.name, 
        input.f, 
        '1-6',
        fieldMapping.f.description
      );
    }

    // Validate G (Pengaruh Kerugian): 1-6
    if (!Number.isInteger(input.g) || input.g < 1 || input.g > 6) {
      throw new InvalidRiskInputError(
        fieldMapping.g.name, 
        input.g, 
        '1-6',
        fieldMapping.g.description
      );
    }

    // Validate H (Frekuensi Serangan): 1-6
    if (!Number.isInteger(input.h) || input.h < 1 || input.h > 6) {
      throw new InvalidRiskInputError(
        fieldMapping.h.name, 
        input.h, 
        '1-6',
        fieldMapping.h.description
      );
    }

    // Validate I (Pemulihan): 2, 4, or 6
    if (!Number.isInteger(input.i) || ![2, 4, 6].includes(input.i)) {
      throw new InvalidRiskInputError(
        fieldMapping.i.name, 
        input.i, 
        '2, 4, or 6',
        fieldMapping.i.description
      );
    }
  }

  /**
   * Determine risk category based on total score
   * @param total Total risk score
   * @returns Risk category
   */
  private determineCategory(total: number): RiskCategory {
    if (total <= 15) {
      return RiskCategory.LOW;
    } else if (total <= 25) {
      return RiskCategory.MEDIUM;
    } else {
      return RiskCategory.HIGH;
    }
  }
}

// Singleton instance
export const riskCalculationService = new RiskCalculationService();
