import { RiskCategory } from '@prisma/client';

export interface ThreatSpecificDescription {
  category: RiskCategory;
  threatName: string;
  description: string;
  recommendations: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionRequired: boolean;
}

export class ThreatDescriptionService {
  /**
   * Generate threat-specific description based on threat name and risk category
   */
  generateThreatDescription(threatName: string, category: RiskCategory): ThreatSpecificDescription {
    const threatKey = this.normalizeThreatName(threatName);
    
    // Get base description for the threat
    const baseDescription = this.getThreatBaseDescription(threatKey);
    
    // Generate category-specific description
    const categoryDescription = this.getCategoryDescription(category, threatKey);
    
    // Generate recommendations based on threat and category
    const recommendations = this.getRecommendations(category, threatKey);
    
    // Determine priority and action required
    const priority = this.getPriority(category);
    const actionRequired = this.getActionRequired(category);

    return {
      category,
      threatName,
      description: `${baseDescription} ${categoryDescription}`,
      recommendations,
      priority,
      actionRequired
    };
  }

  /**
   * Normalize threat name for consistent lookup
   */
  private normalizeThreatName(threatName: string): string {
    return threatName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  /**
   * Get base description for specific threat
   */
  private getThreatBaseDescription(threatKey: string): string {
    const threatDescriptions: Record<string, string> = {
      'ddos': 'Distributed Denial of Service (DDoS) adalah serangan yang mengganggu ketersediaan layanan dengan membanjiri server dengan traffic berlebihan.',
      'distributed_denial_of_service': 'Distributed Denial of Service (DDoS) adalah serangan yang mengganggu ketersediaan layanan dengan membanjiri server dengan traffic berlebihan.',
      'phishing': 'Phishing adalah teknik penipuan yang menggunakan komunikasi elektronik untuk mencuri informasi sensitif seperti kata sandi dan data pribadi.',
      'malware': 'Malware adalah perangkat lunak berbahaya yang dirancang untuk merusak, mengganggu, atau mendapatkan akses tidak sah ke sistem komputer.',
      'ransomware': 'Ransomware adalah jenis malware yang mengenkripsi data korban dan meminta tebusan untuk mengembalikan akses ke data tersebut.',
      'brute_force': 'Brute Force adalah metode serangan yang mencoba menebak kata sandi dengan mencoba berbagai kombinasi karakter secara sistematis.',
      'account_takeover': 'Account Takeover (ATO) adalah serangan dimana penyerang mendapatkan kontrol penuh atas akun korban.',
      'data_leakage': 'Data Leakage adalah kebocoran informasi sensitif yang tidak disengaja atau disengaja dari sistem internal ke pihak luar.',
      'unauthorized_access': 'Unauthorized Access adalah akses tidak sah ke sistem, data, atau sumber daya yang seharusnya dibatasi.',
      'social_engineering': 'Social Engineering adalah teknik manipulasi psikologis untuk menipu orang agar memberikan informasi sensitif atau melakukan tindakan yang merugikan.',
      'supply_chain_compromise': 'Supply Chain Compromise adalah serangan yang menargetkan vendor atau pihak ketiga untuk mengakses sistem utama.',
      'supplychain_compromise': 'Supply Chain Compromise adalah serangan yang menargetkan vendor atau pihak ketiga untuk mengakses sistem utama.',
      'third_party_compromise': 'Third Party Compromise adalah kompromi keamanan yang terjadi melalui vendor atau mitra bisnis.',
      'credential_stuffing': 'Credential Stuffing adalah serangan yang menggunakan kombinasi username/password yang bocor untuk mencoba masuk ke berbagai akun.',
      'business_email_compromise': 'Business Email Compromise (BEC) adalah serangan yang menargetkan email bisnis untuk melakukan penipuan finansial.',
      'payment_fraud': 'Payment Fraud adalah penipuan yang melibatkan transaksi pembayaran palsu atau manipulasi sistem pembayaran.',
      'web_injection': 'Web Injection adalah serangan yang menyisipkan kode berbahaya ke dalam aplikasi web.',
      'defacement': 'Defacement adalah serangan yang mengubah tampilan website tanpa izin untuk tujuan propaganda atau vandalisme.',
      'privilege_escalation': 'Privilege Escalation adalah teknik untuk mendapatkan akses yang lebih tinggi dari yang seharusnya dimiliki.',
      'man_in_the_middle': 'Man-in-the-Middle Attack adalah serangan yang menyadap komunikasi antara dua pihak tanpa sepengetahuan mereka.',
      'backup_tampering': 'Backup Tampering adalah manipulasi atau kerusakan pada sistem backup yang dapat mengancam pemulihan data.',
      'incomplete_backup': 'Incomplete Backup adalah kondisi dimana backup data tidak lengkap atau tidak dapat diandalkan untuk pemulihan.'
    };

    return threatDescriptions[threatKey] || `Ancaman "${threatKey}" adalah risiko keamanan siber yang perlu diperhatikan.`;
  }

  /**
   * Get category-specific description
   */
  private getCategoryDescription(category: RiskCategory, threatKey: string): string {
    const categoryDescriptions: Record<RiskCategory, Record<string, string>> = {
      LOW: {
        default: 'Berdasarkan penilaian risiko, ancaman ini memiliki tingkat risiko RENDAH.',
        ddos: 'Untuk ancaman DDoS dengan risiko rendah, kemungkinan serangan kecil dan dampaknya terbatas.',
        phishing: 'Untuk ancaman Phishing dengan risiko rendah, tingkat keberhasilan serangan rendah dan dampak minimal.',
        malware: 'Untuk ancaman Malware dengan risiko rendah, kemungkinan infeksi kecil dan dampak terbatas.',
        brute_force: 'Untuk ancaman Brute Force dengan risiko rendah, sistem memiliki perlindungan yang memadai.',
        data_leakage: 'Untuk ancaman Data Leakage dengan risiko rendah, data yang terpapar memiliki sensitivitas rendah.',
        supply_chain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko rendah, vendor memiliki keamanan yang memadai dan dampak terbatas.',
        supplychain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko rendah, vendor memiliki keamanan yang memadai dan dampak terbatas.'
      },
      MEDIUM: {
        default: 'Berdasarkan penilaian risiko, ancaman ini memiliki tingkat risiko SEDANG.',
        ddos: 'Untuk ancaman DDoS dengan risiko sedang, kemungkinan serangan moderat dan dapat menyebabkan gangguan layanan.',
        phishing: 'Untuk ancaman Phishing dengan risiko sedang, tingkat keberhasilan serangan moderat dan dapat menyebabkan kerugian.',
        malware: 'Untuk ancaman Malware dengan risiko sedang, kemungkinan infeksi moderat dan dapat menyebabkan gangguan operasional.',
        brute_force: 'Untuk ancaman Brute Force dengan risiko sedang, sistem memiliki perlindungan dasar namun masih rentan.',
        data_leakage: 'Untuk ancaman Data Leakage dengan risiko sedang, data yang terpapar memiliki sensitivitas sedang.',
        supply_chain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko sedang, vendor memiliki keamanan dasar namun masih rentan terhadap kompromi.',
        supplychain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko sedang, vendor memiliki keamanan dasar namun masih rentan terhadap kompromi.'
      },
      HIGH: {
        default: 'Berdasarkan penilaian risiko, ancaman ini memiliki tingkat risiko TINGGI.',
        ddos: 'Untuk ancaman DDoS dengan risiko tinggi, kemungkinan serangan besar dan dapat menyebabkan gangguan layanan yang signifikan.',
        phishing: 'Untuk ancaman Phishing dengan risiko tinggi, tingkat keberhasilan serangan tinggi dan dapat menyebabkan kerugian besar.',
        malware: 'Untuk ancaman Malware dengan risiko tinggi, kemungkinan infeksi besar dan dapat menyebabkan kerusakan sistem.',
        brute_force: 'Untuk ancaman Brute Force dengan risiko tinggi, sistem memiliki perlindungan yang lemah dan sangat rentan.',
        data_leakage: 'Untuk ancaman Data Leakage dengan risiko tinggi, data yang terpapar memiliki sensitivitas tinggi.',
        supply_chain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko tinggi, vendor memiliki keamanan yang lemah dan sangat rentan terhadap kompromi yang dapat mengancam sistem utama.',
        supplychain_compromise: 'Untuk ancaman Supply Chain Compromise dengan risiko tinggi, vendor memiliki keamanan yang lemah dan sangat rentan terhadap kompromi yang dapat mengancam sistem utama.'
      }
    };

    return categoryDescriptions[category]?.[threatKey] || categoryDescriptions[category]?.default || '';
  }

  /**
   * Get recommendations based on threat and category
   */
  private getRecommendations(category: RiskCategory, threatKey: string): string[] {
    const recommendations: Record<RiskCategory, Record<string, string[]>> = {
      LOW: {
        default: [
          'Teruskan monitoring rutin terhadap ancaman ini',
          'Pastikan sistem backup berjalan dengan baik',
          'Lakukan update keamanan secara berkala'
        ],
        ddos: [
          'Implementasikan rate limiting pada server',
          'Gunakan CDN untuk distribusi traffic',
          'Siapkan backup server untuk failover'
        ],
        phishing: [
          'Lakukan pelatihan awareness keamanan untuk karyawan',
          'Implementasikan email filtering yang ketat',
          'Gunakan two-factor authentication'
        ],
        malware: [
          'Pastikan antivirus selalu terupdate',
          'Implementasikan application whitelisting',
          'Lakukan scanning berkala pada sistem'
        ],
        brute_force: [
          'Implementasikan account lockout policy',
          'Gunakan password yang kuat dan unik',
          'Aktifkan two-factor authentication'
        ],
        data_leakage: [
          'Implementasikan data classification',
          'Gunakan encryption untuk data sensitif',
          'Lakukan audit akses data secara berkala'
        ]
      },
      MEDIUM: {
        default: [
          'Tingkatkan monitoring dan alerting',
          'Implementasikan additional security controls',
          'Lakukan penetration testing berkala',
          'Siapkan incident response plan'
        ],
        ddos: [
          'Implementasikan DDoS protection service',
          'Siapkan multiple server untuk load balancing',
          'Implementasikan traffic analysis dan filtering',
          'Siapkan emergency response plan'
        ],
        phishing: [
          'Implementasikan advanced email security',
          'Lakukan simulated phishing testing',
          'Implementasikan URL filtering',
          'Siapkan incident response untuk phishing'
        ],
        malware: [
          'Implementasikan endpoint detection and response (EDR)',
          'Gunakan sandboxing untuk file mencurigakan',
          'Implementasikan network segmentation',
          'Siapkan malware removal procedures'
        ],
        brute_force: [
          'Implementasikan advanced authentication methods',
          'Gunakan behavioral analysis untuk deteksi anomali',
          'Implementasikan IP whitelisting',
          'Siapkan account recovery procedures'
        ],
        data_leakage: [
          'Implementasikan data loss prevention (DLP)',
          'Gunakan data masking untuk testing',
          'Implementasikan access controls yang ketat',
          'Siapkan data breach response plan'
        ]
      },
      HIGH: {
        default: [
          'SEGERA implementasikan security controls yang ketat',
          'Lakukan security assessment menyeluruh',
          'Implementasikan continuous monitoring',
          'Siapkan emergency response team',
          'Pertimbangkan untuk menggunakan external security services'
        ],
        ddos: [
          'SEGERA implementasikan enterprise-grade DDoS protection',
          'Siapkan multiple data centers untuk redundancy',
          'Implementasikan real-time traffic analysis',
          'Siapkan emergency communication plan',
          'Pertimbangkan untuk menggunakan cloud-based protection'
        ],
        phishing: [
          'SEGERA implementasikan advanced threat protection',
          'Lakukan mandatory security training untuk semua karyawan',
          'Implementasikan email authentication (SPF, DKIM, DMARC)',
          'Siapkan rapid response team untuk phishing incidents',
          'Pertimbangkan untuk menggunakan managed security services'
        ],
        malware: [
          'SEGERA implementasikan comprehensive endpoint protection',
          'Gunakan advanced threat intelligence',
          'Implementasikan zero-trust network architecture',
          'Siapkan malware incident response team',
          'Pertimbangkan untuk menggunakan managed detection and response'
        ],
        brute_force: [
          'SEGERA implementasikan multi-factor authentication wajib',
          'Gunakan advanced authentication methods (biometric, hardware tokens)',
          'Implementasikan real-time threat detection',
          'Siapkan account security monitoring team',
          'Pertimbangkan untuk menggunakan identity and access management solution'
        ],
        data_leakage: [
          'SEGERA implementasikan comprehensive data protection',
          'Gunakan advanced data loss prevention tools',
          'Implementasikan data encryption end-to-end',
          'Siapkan data breach response team',
          'Pertimbangkan untuk menggunakan data security consulting services'
        ]
      }
    };

    return recommendations[category]?.[threatKey] || recommendations[category]?.default || [];
  }

  /**
   * Get priority level based on category
   */
  private getPriority(category: RiskCategory): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (category) {
      case 'LOW':
        return 'LOW';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HIGH':
        return 'HIGH';
      default:
        return 'LOW';
    }
  }

  /**
   * Determine if immediate action is required
   */
  private getActionRequired(category: RiskCategory): boolean {
    return category === 'HIGH';
  }
}
