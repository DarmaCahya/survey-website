import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updated seed script for UMKM Cyber Risk Survey
 * Based on real UMKM data from Excel glossary
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding with real UMKM data...');

  try {
    // Create business processes first (based on Excel data)
    const businessProcesses = [
      { name: 'Penjualan Barang', description: 'Proses penjualan produk dan layanan' },
      { name: 'Inventory Management', description: 'Manajemen stok dan inventori' },
      { name: 'Customer Service', description: 'Layanan pelanggan dan dukungan' },
      { name: 'Finance', description: 'Proses keuangan dan akuntansi' },
      { name: 'Promosi', description: 'Kegiatan pemasaran dan promosi' },
      { name: 'Pembelian Barang', description: 'Proses pembelian dari supplier' },
      { name: 'Produksi/Operasional', description: 'Operasional harian dan produksi' },
      { name: 'Contract Pembelian dengan vendor', description: 'Kontrak dengan vendor' },
      { name: 'Contract dengan karyawan', description: 'Kontrak dengan karyawan' },
      { name: 'Legalitas PT', description: 'Dokumen legalitas perusahaan' },
      { name: 'Backup data keuangan', description: 'Backup data keuangan' },
      { name: 'Backup customer', description: 'Backup data pelanggan' },
      { name: 'Backup vendor', description: 'Backup data vendor' },
      { name: 'Backup report', description: 'Backup laporan' }
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

    // Create assets based on Excel data
    const assets = [
      {
        name: 'API / Integrasi Pihak Ketiga',
        description: 'Kredensial dan koneksi ke layanan pihak ketiga (payment gateway, kurir, marketplace API)'
      },
      {
        name: 'Akun Marketplace / Seller Account',
        description: 'Akun di platform marketplace (Tokopedia, Shopee, dll.) termasuk data toko, saldo, dan pengaturan logistik'
      },
      {
        name: 'Akun Media Sosial',
        description: 'Akun di media sosial seperti: Instagram, Tiktok, Facebook, Youtube, termasuk dengan data interact with followers'
      },
      {
        name: 'Backup / Cadangan Data',
        description: 'Salinan cadangan data bisnis yang disimpan di luar sistem utama (offline/cloud backup)'
      },
      {
        name: 'Data Keuangan',
        description: 'Catatan transaksi, invoice, bukti transfer, saldo rekening, dan laporan keuangan'
      },
      {
        name: 'Data Pelanggan',
        description: 'Informasi identitas pelanggan seperti nama, nomor telepon, alamat, histori pembelian, dan preferensi'
      },
      {
        name: 'Data Supplier / Vendor',
        description: 'Informasi pemasok seperti kontak, harga, jadwal pengiriman, dan persyaratan'
      },
      {
        name: 'Dokumen Legal / Kontrak (scan)',
        description: 'Scan kontrak, dokumen legal, atau sertifikat yang disimpan secara digital'
      },
      {
        name: 'Konfigurasi Jaringan / Wi‑Fi Toko',
        description: 'Setelan jaringan lokal yang menghubungkan perangkat kasir, printer, dan perangkat staf'
      },
      {
        name: 'Akun Bank',
        description: 'Username, password, token, untuk akses ke data bank'
      },
      {
        name: 'Akun Komunikasi',
        description: 'Sarana komunikasi digital dengan pelanggan seperti WhatsApp Business, Instagram DM, Tokopedia Chat, Shopee Chat'
      },
      {
        name: 'Perangkat Kerja (HP / Laptop / POS)',
        description: 'Perangkat yang digunakan staf untuk operasional: kasir, komunikasi, pencatatan, atau akses akun bisnis'
      },
      {
        name: 'Sistem / Cloud (Drive/Server/ERP)',
        description: 'Platform dan layanan cloud yang menyimpan file bisnis, laporan, atau dashboard penjualan'
      },
      {
        name: 'Website / E‑commerce / Landing Page',
        description: 'Situs web toko atau halaman produk yang menerima pesanan atau menampilkan informasi bisnis'
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

    // Create threats based on Excel data with proper asset relationships
    const threats = [
      // API / Integrasi Pihak Ketiga
      { assetName: 'API / Integrasi Pihak Ketiga', name: 'Supply-chain compromise', description: 'Kompromi pada rantai pasokan/ vendor yang menyebabkan gangguan atau kebocoran data' },
      { assetName: 'API / Integrasi Pihak Ketiga', name: 'Third-Party Compromise', description: 'Serangan yang terjadi karena layanan pihak ketiga disusupi hacker' },

      // Akun Marketplace / Seller Account
      { assetName: 'Akun Marketplace / Seller Account', name: 'Brute Force', description: 'Upaya otomatis menebak kata sandi berkali-kali sampai berhasil masuk ke akun' },
      { assetName: 'Akun Marketplace / Seller Account', name: 'Account Takeover (ATO)', description: 'Pengambilalihan akun sehingga penyerang dapat bertindak memakai akun tersebut' },
      { assetName: 'Akun Marketplace / Seller Account', name: 'Credential Stuffing', description: 'Penggunaan kombinasi username/password bocor untuk mencoba masuk ke banyak layanan' },
      { assetName: 'Akun Marketplace / Seller Account', name: 'Phishing / Social Engineering', description: 'Pesan atau panggilan palsu yang menipu orang agar memberikan kata sandi, OTP, atau data sensitif' },

      // Akun Media Sosial
      { assetName: 'Akun Media Sosial', name: 'Malware / Ransomware', description: 'Program berbahaya yang bisa mencuri atau mengenkripsi data, biasanya di susup lewat link' },
      { assetName: 'Akun Media Sosial', name: 'Brute Force', description: 'Upaya otomatis menebak kata sandi berkali-kali sampai berhasil masuk ke akun' },

      // Backup / Cadangan Data
      { assetName: 'Backup / Cadangan Data', name: 'Backup Tampering / Incomplete Backup', description: 'Cadangan data hilang, rusak, atau sengaja diubah oleh pihak tak berwenang' },

      // Data Keuangan
      { assetName: 'Data Keuangan', name: 'Malware / Ransomware', description: 'Program berbahaya yang bisa mencuri atau mengenkripsi data, membuat sistem tidak bisa dipakai tanpa tebusan' },
      { assetName: 'Data Keuangan', name: 'Payment Fraud', description: 'Upaya menipu atau memanipulasi pembayaran yang merugikan bisnis' },

      // Data Pelanggan
      { assetName: 'Data Pelanggan', name: 'Data Leakage', description: 'Kebocoran data sensitif karena kesalahan konfigurasi, akses tidak sah, atau pencurian data' },
      { assetName: 'Data Pelanggan', name: 'Phishing / Penipuan WA', description: 'Modus penipuan lewat pesan WhatsApp atau media sosial' },

      // Data Supplier / Vendor
      { assetName: 'Data Supplier / Vendor', name: 'Business Email Compromise (BEC)', description: 'Penipuan lewat email yang berpura-pura dari pihak tepercaya untuk mengubah rekening atau meminta transfer' },

      // Dokumen Legal / Kontrak
      { assetName: 'Dokumen Legal / Kontrak (scan)', name: 'Data Leakage', description: 'Kebocoran data sensitif karena kesalahan konfigurasi, akses tidak sah, atau pencurian data' },

      // Konfigurasi Jaringan / Wi‑Fi Toko
      { assetName: 'Konfigurasi Jaringan / Wi‑Fi Toko', name: 'Unauthorized Access', description: 'Akses ke sistem, akun, atau file dilakukan oleh pihak yang tidak berhak' },
      { assetName: 'Konfigurasi Jaringan / Wi‑Fi Toko', name: 'Man-in-the-Middle Attack', description: 'Serangan di mana pelaku menyadap komunikasi antara pengguna dan sistem' },

      // Akun Bank
      { assetName: 'Akun Bank', name: 'Phishing', description: 'Upaya menipu korban melalui email, website palsu, atau chat agar korban memberikan data sensitif' },

      // Akun Komunikasi
      { assetName: 'Akun Komunikasi', name: 'Account Takeover', description: 'Penyerang berhasil mengambil alih akun untuk melakukan transaksi atau mengubah data tanpa izin' },
      { assetName: 'Akun Komunikasi', name: 'Social Engineering', description: 'Manipulasi psikologis terhadap korban agar melakukan tindakan tertentu' },
      { assetName: 'Akun Komunikasi', name: 'Data Leakage', description: 'Kebocoran data sensitif karena salah konfigurasi, kelalaian karyawan, atau sistem yang tidak aman' },
      { assetName: 'Akun Komunikasi', name: 'Phishing', description: 'Upaya menipu korban melalui email, website palsu, atau chat agar korban memberikan data sensitif' },

      // Perangkat Kerja
      { assetName: 'Perangkat Kerja (HP / Laptop / POS)', name: 'Malware / Ransomware', description: 'Program berbahaya yang bisa mencuri atau mengenkripsi data, membuat sistem tidak bisa dipakai tanpa tebusan' },

      // Sistem / Cloud
      { assetName: 'Sistem / Cloud (Drive/Server/ERP)', name: 'Data Leakage', description: 'Kebocoran data sensitif karena kesalahan konfigurasi, akses tidak sah, atau pencurian data' },
      { assetName: 'Sistem / Cloud (Drive/Server/ERP)', name: 'Distributed Denial of Service (DDoS)', description: 'Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses' },
      { assetName: 'Sistem / Cloud (Drive/Server/ERP)', name: 'Privilege Escalation', description: 'Eksploitasi untuk mendapatkan hak akses lebih tinggi dalam sistem daripada yang semestinya' },
      { assetName: 'Sistem / Cloud (Drive/Server/ERP)', name: 'Unauthorized Access', description: 'Akses ke sistem atau data oleh pihak yang tidak berwenang karena kontrol keamanan lemah' },

      // Website / E‑commerce
      { assetName: 'Website / E‑commerce / Landing Page', name: 'Web Injection / Defacement', description: 'Perubahan atau injeksi kode di website yang bisa mengarahkan pelanggan ke tautan berbahaya' },
      { assetName: 'Website / E‑commerce / Landing Page', name: 'Distributed Denial of Service (DDoS)', description: 'Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses' },
      { assetName: 'Website / E‑commerce / Landing Page', name: 'Payment Fraud (checkout manipulation)', description: 'Modifikasi proses pembayaran oleh pihak jahat untuk mengubah nominal atau mengirim bukti transfer palsu' }
    ];

    console.log('⚠️ Creating threats...');
    for (const threatData of threats) {
      const asset = createdAssets.find(a => a.name === threatData.assetName);
      if (asset) {
        const threat = await prisma.threat.create({
          data: {
            assetId: asset.id,
            name: threatData.name,
            description: threatData.description
          }
        });
        console.log(`✅ Created threat: ${threat.name} for ${asset.name}`);
      }
    }

    // Create threat-business process relationships based on Excel data
    console.log('🔗 Creating threat-business process relationships...');
    
    const threatProcessRelations = [
      // API / Integrasi Pihak Ketiga
      { threatName: 'Supply-chain compromise', processes: ['Penjualan Barang', 'Finance'] },
      { threatName: 'Third-Party Compromise', processes: ['Penjualan Barang', 'Finance'] },

      // Akun Marketplace
      { threatName: 'Brute Force', processes: ['Inventory Management', 'Customer Service', 'Penjualan Barang'] },
      { threatName: 'Account Takeover (ATO)', processes: ['Penjualan Barang'] },
      { threatName: 'Credential Stuffing', processes: ['Penjualan Barang'] },
      { threatName: 'Phishing / Social Engineering', processes: ['Penjualan Barang dan Promosi'] },

      // Akun Media Sosial
      { threatName: 'Malware / Ransomware', processes: ['Customer Service'] },
      { threatName: 'Brute Force', processes: ['Upload data content', 'Promosi'] },

      // Backup
      { threatName: 'Backup Tampering / Incomplete Backup', processes: ['Backup data keuangan', 'Backup customer', 'Backup vendor', 'Backup report'] },

      // Data Keuangan
      { threatName: 'Malware / Ransomware', processes: ['Finance'] },
      { threatName: 'Payment Fraud', processes: ['Finance'] },

      // Data Pelanggan
      { threatName: 'Data Leakage', processes: ['Penjualan barang dan Customer Service'] },
      { threatName: 'Phishing / Penipuan WA', processes: ['Penjualan barang dan Customer Service'] },

      // Data Supplier
      { threatName: 'Business Email Compromise (BEC)', processes: ['Pembelian Barang'] },

      // Dokumen Legal
      { threatName: 'Data Leakage', processes: ['Contract Pembelian dengan vendor', 'Contract dengan karyawan', 'Legalitas PT'] },

      // Konfigurasi Jaringan
      { threatName: 'Unauthorized Access', processes: ['Produksi/Operasional'] },
      { threatName: 'Man-in-the-Middle Attack', processes: ['Produksi/Operasional'] },

      // Akun Bank
      { threatName: 'Phishing', processes: ['Finance'] },

      // Akun Komunikasi
      { threatName: 'Account Takeover', processes: ['Customer Service', 'Promosi', 'Penjualan Barang'] },
      { threatName: 'Social Engineering', processes: ['Customer Service', 'Promosi', 'Penjualan Barang'] },
      { threatName: 'Data Leakage', processes: ['Customer Service', 'Promosi', 'Penjualan Barang'] },
      { threatName: 'Phishing', processes: ['Customer Service', 'Promosi', 'Penjualan Barang'] },

      // Perangkat Kerja
      { threatName: 'Malware / Ransomware', processes: ['Penjualan', 'Pembelian', 'Produksi', 'Finance'] },

      // Sistem / Cloud
      { threatName: 'Data Leakage', processes: ['Penjualan', 'Pembelian', 'Produksi', 'Finance'] },
      { threatName: 'Distributed Denial of Service (DDoS)', processes: ['Penjualan', 'Pembelian', 'Produksi', 'Finance'] },
      { threatName: 'Privilege Escalation', processes: ['Penjualan', 'Pembelian', 'Produksi', 'Finance'] },
      { threatName: 'Unauthorized Access', processes: ['Penjualan', 'Pembelian', 'Produksi', 'Finance'] },

      // Website / E‑commerce
      { threatName: 'Web Injection / Defacement', processes: ['Inventory Management', 'Customer Service', 'Penjualan barang', 'Promosi'] },
      { threatName: 'Distributed Denial of Service (DDoS)', processes: ['Inventory Management', 'Customer Service', 'Penjualan barang', 'Promosi'] },
      { threatName: 'Payment Fraud (checkout manipulation)', processes: ['Inventory Management', 'Customer Service', 'Penjualan barang', 'Promosi'] }
    ];

    for (const relation of threatProcessRelations) {
      const threat = await prisma.threat.findFirst({
        where: { name: relation.threatName }
      });

      if (threat) {
        for (const processName of relation.processes) {
          const process = createdProcesses.find(p => p.name === processName);
          if (process) {
            // Check if relationship already exists to avoid duplicates
            const existingRelation = await prisma.threatBusinessProcess.findUnique({
              where: {
                threatId_businessProcessId: {
                  threatId: threat.id,
                  businessProcessId: process.id
                }
              }
            });

            if (!existingRelation) {
              await prisma.threatBusinessProcess.create({
                data: {
                  threatId: threat.id,
                  businessProcessId: process.id
                }
              });
            }
          }
        }
        console.log(`✅ Created relationships for threat: ${threat.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdAssets.length} assets`);
    console.log(`⚠️ Created ${threats.length} threats`);
    console.log(`🔄 Created ${createdProcesses.length} business processes`);
    console.log(`🔗 Created threat-business process relationships`);

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
