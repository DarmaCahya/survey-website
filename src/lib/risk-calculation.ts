import { RiskInput, RiskScore, RiskCategory, RiskValidationError, InvalidRiskInputError } from '@/types/risk';

/**
 * Core risk calculation service following SOLID principles
 * Single Responsibility: Only handles risk calculations
 * Open/Closed: Can be extended without modification
 */
export interface IRiskCalculationService {
  calculate(input: RiskInput): RiskScore;
  validateInput(input: RiskInput): void;
}

export class RiskCalculationService implements IRiskCalculationService {
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
   * Validate risk input parameters
   * @param input Risk assessment inputs
   * @throws RiskValidationError if validation fails
   */
  validateInput(input: RiskInput): void {
    // Validate F (Peluang Serangan): 1-6
    if (!Number.isInteger(input.f) || input.f < 1 || input.f > 6) {
      throw new InvalidRiskInputError('f', input.f, '1-6');
    }

    // Validate G (Impact): 1-6
    if (!Number.isInteger(input.g) || input.g < 1 || input.g > 6) {
      throw new InvalidRiskInputError('g', input.g, '1-6');
    }

    // Validate H (Total Resiko): 1-6
    if (!Number.isInteger(input.h) || input.h < 1 || input.h > 6) {
      throw new InvalidRiskInputError('h', input.h, '1-6');
    }

    // Validate I (Kategori Risiko): 2, 4, or 6
    if (!Number.isInteger(input.i) || ![2, 4, 6].includes(input.i)) {
      throw new InvalidRiskInputError('i', input.i, '2, 4, or 6');
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
