import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for UMKM Cyber Risk Survey
 * Populates database with sample assets and threats
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample assets
    const assets = [
      {
        name: 'Website Perusahaan',
        description: 'Website resmi perusahaan untuk informasi produk dan layanan'
      },
      {
        name: 'Sistem POS (Point of Sale)',
        description: 'Sistem kasir untuk transaksi penjualan'
      },
      {
        name: 'Database Pelanggan',
        description: 'Database yang menyimpan informasi pelanggan'
      },
      {
        name: 'Email Perusahaan',
        description: 'Sistem email untuk komunikasi bisnis'
      },
      {
        name: 'Aplikasi Mobile',
        description: 'Aplikasi mobile untuk layanan pelanggan'
      },
      {
        name: 'Server Lokal',
        description: 'Server fisik di lokasi perusahaan'
      },
      {
        name: 'Cloud Storage',
        description: 'Penyimpanan cloud untuk dokumen dan data'
      },
      {
        name: 'Sistem Inventory',
        description: 'Sistem manajemen stok dan inventori'
      },
      {
        name: 'Social Media Accounts',
        description: 'Akun media sosial untuk pemasaran'
      },
      {
        name: 'Payment Gateway',
        description: 'Gateway pembayaran online'
      },
      {
        name: 'WiFi Network',
        description: 'Jaringan WiFi internal perusahaan'
      },
      {
        name: 'Backup System',
        description: 'Sistem backup data dan recovery'
      },
      {
        name: 'Customer Support System',
        description: 'Sistem layanan pelanggan'
      },
      {
        name: 'Financial Records',
        description: 'Catatan keuangan dan akuntansi'
      }
    ];

    console.log('📦 Creating assets...');
    const createdAssets = [];
    for (const assetData of assets) {
      const asset = await prisma.asset.create({
        data: assetData
      });
      createdAssets.push(asset);
      console.log(`✅ Created asset: ${asset.name}`);
    }

    // Create sample threats for each asset
    const threats = [
      // Website Perusahaan
      { assetIndex: 0, name: 'Defacement Website', description: 'Website diubah oleh pihak tidak bertanggung jawab' },
      { assetIndex: 0, name: 'DDoS Attack', description: 'Serangan denial of service pada website' },
      { assetIndex: 0, name: 'SQL Injection', description: 'Serangan injeksi SQL pada database website' },
      
      // Sistem POS
      { assetIndex: 1, name: 'Malware pada POS', description: 'Malware yang menyerang sistem kasir' },
      { assetIndex: 1, name: 'Card Skimming', description: 'Pencurian data kartu kredit/debit' },
      { assetIndex: 1, name: 'Internal Fraud', description: 'Kecurangan internal pada transaksi' },
      
      // Database Pelanggan
      { assetIndex: 2, name: 'Data Breach', description: 'Kebocoran data pelanggan' },
      { assetIndex: 2, name: 'Ransomware', description: 'Serangan ransomware pada database' },
      { assetIndex: 2, name: 'Unauthorized Access', description: 'Akses tidak sah ke database' },
      
      // Email Perusahaan
      { assetIndex: 3, name: 'Phishing Attack', description: 'Serangan phishing melalui email' },
      { assetIndex: 3, name: 'Email Spoofing', description: 'Pemalsuan identitas email' },
      { assetIndex: 3, name: 'Malware via Email', description: 'Malware yang disebarkan melalui email' },
      
      // Aplikasi Mobile
      { assetIndex: 4, name: 'App Store Compromise', description: 'Kompromi pada aplikasi di store' },
      { assetIndex: 4, name: 'Man-in-the-Middle', description: 'Serangan MITM pada komunikasi mobile' },
      { assetIndex: 4, name: 'Reverse Engineering', description: 'Reverse engineering aplikasi' },
      
      // Server Lokal
      { assetIndex: 5, name: 'Physical Theft', description: 'Pencurian fisik server' },
      { assetIndex: 5, name: 'Hardware Failure', description: 'Kegagalan hardware server' },
      { assetIndex: 5, name: 'Power Outage', description: 'Pemadaman listrik yang berkepanjangan' },
      
      // Cloud Storage
      { assetIndex: 6, name: 'Cloud Provider Breach', description: 'Kebocoran data dari penyedia cloud' },
      { assetIndex: 6, name: 'Misconfigured Access', description: 'Konfigurasi akses yang salah' },
      { assetIndex: 6, name: 'Account Takeover', description: 'Pengambilalihan akun cloud' },
      
      // Sistem Inventory
      { assetIndex: 7, name: 'Data Manipulation', description: 'Manipulasi data inventori' },
      { assetIndex: 7, name: 'System Downtime', description: 'Sistem inventori tidak dapat diakses' },
      { assetIndex: 7, name: 'Inventory Theft', description: 'Pencurian fisik barang inventori' },
      
      // Social Media Accounts
      { assetIndex: 8, name: 'Account Hijacking', description: 'Pembajakan akun media sosial' },
      { assetIndex: 8, name: 'Fake Account', description: 'Akun palsu yang meniru perusahaan' },
      { assetIndex: 8, name: 'Reputation Damage', description: 'Kerusakan reputasi melalui media sosial' },
      
      // Payment Gateway
      { assetIndex: 9, name: 'Payment Fraud', description: 'Penipuan pembayaran online' },
      { assetIndex: 9, name: 'Transaction Interception', description: 'Intersepsi transaksi pembayaran' },
      { assetIndex: 9, name: 'Gateway Compromise', description: 'Kompromi pada gateway pembayaran' },
      
      // WiFi Network
      { assetIndex: 10, name: 'Network Intrusion', description: 'Intrusi ke jaringan WiFi' },
      { assetIndex: 10, name: 'Eavesdropping', description: 'Penyadapan komunikasi WiFi' },
      { assetIndex: 10, name: 'Rogue Access Point', description: 'Access point palsu' },
      
      // Backup System
      { assetIndex: 11, name: 'Backup Corruption', description: 'Korupsi data backup' },
      { assetIndex: 11, name: 'Backup Theft', description: 'Pencurian media backup' },
      { assetIndex: 11, name: 'Recovery Failure', description: 'Kegagalan proses recovery' },
      
      // Customer Support System
      { assetIndex: 12, name: 'Support System Downtime', description: 'Sistem support tidak dapat diakses' },
      { assetIndex: 12, name: 'Customer Data Leak', description: 'Kebocoran data pelanggan dari support' },
      { assetIndex: 12, name: 'Social Engineering', description: 'Social engineering pada tim support' },
      
      // Financial Records
      { assetIndex: 13, name: 'Financial Fraud', description: 'Penipuan keuangan' },
      { assetIndex: 13, name: 'Accounting Manipulation', description: 'Manipulasi catatan akuntansi' },
      { assetIndex: 13, name: 'Tax Evasion', description: 'Penggelapan pajak' }
    ];

    console.log('⚠️ Creating threats...');
    for (const threatData of threats) {
      const asset = createdAssets[threatData.assetIndex];
      const threat = await prisma.threat.create({
        data: {
          assetId: asset.id,
          name: threatData.name,
          description: threatData.description
        }
      });
      console.log(`✅ Created threat: ${threat.name} for ${asset.name}`);
    }

    // Create sample business processes
    const businessProcesses = [
      { name: 'Penjualan', description: 'Proses penjualan produk dan layanan' },
      { name: 'Pemasaran', description: 'Proses pemasaran dan promosi' },
      { name: 'Customer Service', description: 'Proses layanan pelanggan' },
      { name: 'Keuangan', description: 'Proses keuangan dan akuntansi' },
      { name: 'Operasional', description: 'Proses operasional harian' },
      { name: 'IT Support', description: 'Proses dukungan teknologi informasi' }
    ];

    console.log('🔄 Creating business processes...');
    const createdProcesses = [];
    for (const processData of businessProcesses) {
      const process = await prisma.businessProcess.create({
        data: processData
      });
      createdProcesses.push(process);
      console.log(`✅ Created business process: ${process.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdAssets.length} assets`);
    console.log(`⚠️ Created ${threats.length} threats`);
    console.log(`🔄 Created ${createdProcesses.length} business processes`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
