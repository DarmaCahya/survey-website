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
          'Lakukan monitoring rutin',
          'Pastikan backup berjalan',
          'Update sistem berkala'
        ],
        ddos: [
          'Monitor traffic server',
          'Siapkan backup server',
          'Review konfigurasi server'
        ],
        phishing: [
          'Edukasi karyawan',
          'Filter email mencurigakan',
          'Aktifkan 2FA'
        ],
        malware: [
          'Update antivirus',
          'Scan sistem berkala',
          'Backup data penting'
        ],
        brute_force: [
          'Gunakan password kuat',
          'Aktifkan 2FA',
          'Monitor akses mencurigakan'
        ],
        data_leakage: [
          'Backup data penting',
          'Enkripsi data sensitif',
          'Pantau akses data'
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
          '⚠️ SEGERA LAKUKAN AUDIT KEAMANAN MENYELURUH!',
          'Implementasikan security monitoring 24/7 dengan alerting real-time',
          'Bentuk tim emergency response yang siap siaga',
          'Lakukan penetration testing profesional secepatnya',
          'Engage dengan cybersecurity consultant untuk assessment mendalam',
          'Document semua security incidents untuk compliance',
          'Latih semua staf tentang incident response procedure'
        ],
        ddos: [
          '🚨 URGENT: Deploy enterprise-grade DDoS protection service (Cloudflare/AWS Shield Pro)',
          'Setup multiple data centers dengan load balancer untuk failover',
          'Implementasikan real-time traffic analysis dan anomaly detection',
          'Siapkan emergency communication plan untuk downtime scenarios',
          'Engage dengan profesional IT untuk hardening infrastructure',
          'Setup backup internet connection dari provider berbeda',
          'Monitor network traffic patterns 24/7 dengan automated alerts'
        ],
        phishing: [
          '🚨 URGENT: Deploy advanced email security solution (Mimecast/Proofpoint)',
          'MANDATORY security training untuk SEMUA karyawan dengan quiz',
          'Implementasikan DMARC policy dengan rejection untuk unverified senders',
          'Setup SEGERA rapid response team dengan runbook untuk phishing incidents',
          'Deploy URL filtering dan web proxy untuk blocking malicious sites',
          'Implementasikan behavior analytics untuk detect email anomalies',
          'Engage managed security services untuk 24/7 monitoring'
        ],
        malware: [
          '🚨 URGENT: Deploy enterprise-grade endpoint protection (EDR/XDR solution)',
          'Setup sandboxing environment untuk testing file mencurigakan',
          'Implementasikan zero-trust network dengan micro-segmentation',
          'Bentuk dedicated malware incident response team',
          'Deploy threat intelligence feeds untuk proactive defense',
          'Implementasikan application control whitelisting',
          'Setup SIEM untuk correlation analysis dan threat hunting'
        ],
        brute_force: [
          '🚨 URGENT: WAJIBKAN multi-factor authentication untuk SEMUA akun',
          'Implementasikan biometric authentication atau hardware security keys',
          'Deploy AI-powered behavioral analytics untuk detect anomaly access',
          'Setup IP whitelisting dan geofencing restrictions',
          'Bentuk dedicated account security monitoring team',
          'Implementasikan Identity and Access Management (IAM) solution',
          'Setup automated account lockout dengan incident response workflow'
        ],
        data_leakage: [
          '🚨 URGENT: Implementasikan Data Loss Prevention (DLP) enterprise-grade solution',
          'Deploy end-to-end encryption untuk SEMUA data sensitif',
          'Implementasikan data classification dan access controls berbasis role',
          'Bentuk data breach response team dengan legal dan PR representatives',
          'Setup data access monitoring dengan audit trails real-time',
          'Engage cybersecurity consultant untuk data security assessment',
          'Implementasikan data masking dan anonymization untuk testing environments',
          'Setup continuous monitoring dengan automated alerts untuk unusual data access patterns'
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
