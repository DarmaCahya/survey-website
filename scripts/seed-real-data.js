#!/usr/bin/env node

/**
 * Script to seed the database with real UMKM survey data
 * Run this script to populate the database with actual assets and threats
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed script for UMKM Cyber Risk Survey with real data
 * Populates database with actual assets and threats based on provided data
 */
async function seedRealData() {
  console.log('🌱 Starting real data seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.feedback.deleteMany();
    await prisma.score.deleteMany();
    await prisma.riskInput.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.formProgress.deleteMany();
    await prisma.threatBusinessProcess.deleteMany();
    await prisma.threat.deleteMany();
    await prisma.businessProcess.deleteMany();
    await prisma.asset.deleteMany();

    // Create assets and threats based on provided data
    const assetsData = [
      {
        id: 1,
        "title-data": "API & Integrasi Pihak Ketiga",
        description: "Banyak bisnis modern bergantung pada berbagai layanan pihak ketiga — mulai dari sistem pembayaran, logistik, hingga marketplace. Melalui integrasi API, data pelanggan, transaksi, dan status pengiriman dapat terhubung secara otomatis. Namun di balik kemudahan itu, terdapat risiko siber yang bisa berdampak besar jika tidak diantisipasi.",
        threats: [
          {
            id: 1,
            title: "Supply-Chain Compromise",
            description: "Serangan ini menargetkan vendor atau penyedia layanan yang terhubung dengan sistem bisnis Anda. Bila salah satu penyedia layanan mengalami kebocoran, maka penyerang bisa saja masuk ke sistem utama melalui celah tersebut. Risiko ini sering kali muncul tanpa disadari, karena kepercayaannya terhadap pihak ketiga."
          },
          {
            id: 2,
            title: "Third-Party Compromise",
            description: "Ancaman ini muncul ketika sistem pihak ketiga seperti platform logistik, penyedia jasa, atau integrasi API mengalami kebocoran data. Melalui koneksi tersebut, penyerang dapat mengakses informasi pelanggan, transaksi, hingga mengambil kendali sebagian fungsi sistem bisnis Anda."
          }
        ]
      },
      {
        id: 2,
        "title-data": "Akun Marketplace / Seller Account",
        description: "Akun di platform marketplace seperti Tokopedia, Shopee, dan sejenisnya digunakan untuk mengelola toko online, data produk, transaksi, serta interaksi dengan pelanggan. Akun ini biasanya mencakup data toko, saldo penjualan, pengaturan logistik, serta kredensial akses (username, password, dan sistem admin). Karena berhubungan langsung dengan transaksi keuangan dan reputasi bisnis, akun seller menjadi target utama berbagai serangan siber. Jika akun ini dikompromikan, pelaku dapat mengambil alih toko, mengubah data produk, menarik saldo, hingga mencuri data pelanggan.",
        threats: [
          {
            id: 1,
            title: "Brute Force",
            description: "Upaya otomatis untuk menebak kata sandi berkali-kali hingga berhasil masuk ke akun marketplace. Serangan ini biasanya dilakukan oleh bot yang mencoba berbagai kombinasi password umum atau lemah. Bila berhasil, penyerang dapat mengakses akun seller secara penuh."
          },
          {
            id: 2,
            title: "Account Takeover (ATO)",
            description: "Serangan di mana penyerang berhasil mengambil alih akun marketplace melalui pencurian kredensial, phishing, atau brute force. Setelah berhasil, pelaku dapat mengganti informasi akun, menarik dana, mengubah harga produk, atau menipu pelanggan."
          },
          {
            id: 3,
            title: "Credential Stuffing",
            description: "Penggunaan kombinasi username dan password yang bocor dari layanan lain untuk mencoba login ke akun marketplace. Karena banyak pengguna memakai kredensial yang sama di beberapa platform, serangan ini sangat efektif untuk mengambil alih banyak akun sekaligus."
          },
          {
            id: 4,
            title: "Phishing / Social Engineering",
            description: "Penyerang mengirim pesan palsu melalui email, WhatsApp, atau DM yang meniru pihak resmi (misalnya marketplace atau bank) untuk menipu pemilik akun agar memberikan kata sandi, OTP, atau klik tautan berbahaya. Cara ini sering digunakan untuk mencuri akses akun seller."
          }
        ]
      },
      {
        id: 3,
        "title-data": "Akun Media Sosial",
        description: "Akun di platform media sosial seperti Instagram, TikTok, Facebook, dan YouTube digunakan untuk berinteraksi dengan followers, mengunggah konten, menjalankan kampanye promosi, serta mengelola komentar dan pesan. Akun ini biasanya memuat kredensial (username/password), akses admin/manager (termasuk pihak ketiga seperti social management tools), serta data interaksi pengguna (komentar, DM, analytics). Karena akun media sosial terkait reputasi merek dan komunikasi dengan pelanggan, kompromi akun dapat menyebabkan penyebaran konten palsu, hilangnya follower, kerugian reputasi, atau pencurian data interaksi pelanggan.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang disisipkan melalui link, lampiran, atau aplikasi pihak ketiga dan dijalankan pada perangkat admin media sosial atau tim customer service. Malware dapat mencuri kredensial (misalnya melalui keylogger), mengambil data percakapan dengan pelanggan, atau mengenkripsi file penting. Dampaknya meliputi kehilangan akses akun, kebocoran data, dan gangguan operasional."
          },
          {
            id: 2,
            title: "Brute Force",
            description: "Upaya otomatis untuk menebak kata sandi berkali-kali hingga berhasil masuk ke akun media sosial. Serangan ini dapat menargetkan akun yang digunakan untuk mengunggah konten maupun akun yang mengelola promosi atau iklan berbayar. Jika berhasil, penyerang dapat memposting konten palsu, menghapus unggahan, mengubah tautan promosi, atau mengalihkan anggaran iklan untuk kepentingan pribadi."
          }
        ]
      },
      {
        id: 4,
        "title-data": "Backup / Cadangan Data",
        description: "Cadangan data merupakan salinan dari data bisnis penting yang disimpan di luar sistem utama, baik secara offline (hard drive, tape) maupun di cloud (cloud backup). Data yang dicadangkan biasanya mencakup informasi keuangan, data pelanggan, data vendor, laporan operasional, hingga konfigurasi sistem. Fungsi utama backup adalah memastikan data tetap tersedia dan dapat dipulihkan saat terjadi insiden seperti kegagalan sistem, serangan ransomware, atau kehilangan perangkat. Namun, bila proses backup tidak dikelola dengan benar, cadangan data itu sendiri bisa menjadi titik lemah keamanan.",
        threats: [
          {
            id: 1,
            title: "Backup Tampering / Incomplete Backup",
            description: "Ancaman yang terjadi ketika cadangan data bisnis seperti data keuangan, pelanggan, vendor, atau laporan mengalami kerusakan, kehilangan, atau bahkan dimodifikasi oleh pihak yang tidak berwenang. Hal ini dapat disebabkan oleh kesalahan sistem, serangan malware, atau manipulasi internal. Dampaknya: saat terjadi insiden utama, data tidak dapat dipulihkan dengan benar, proses bisnis terganggu, dan potensi kehilangan data permanen meningkat."
          }
        ]
      },
      {
        id: 5,
        "title-data": "Data Keuangan",
        description: "Data keuangan mencakup seluruh informasi terkait transaksi bisnis, seperti catatan pembayaran, invoice, bukti transfer, saldo rekening, hingga laporan keuangan bulanan. Data ini menjadi fondasi utama dalam pengelolaan arus kas, pelaporan pajak, dan pengambilan keputusan strategis perusahaan. Karena bernilai tinggi dan berhubungan langsung dengan aset finansial, data keuangan menjadi salah satu target utama serangan siber. Kebocoran, manipulasi, atau kerusakan pada data ini dapat menyebabkan kerugian finansial, gangguan operasional, serta hilangnya kepercayaan mitra bisnis.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang dapat mencuri, mengunci, atau mengenkripsi file keuangan seperti laporan, invoice, dan bukti transfer. Serangan ini sering terjadi melalui lampiran email, link berbahaya, atau perangkat yang tidak terlindungi. Dampaknya: sistem keuangan tidak dapat diakses, data penting hilang atau disandera, serta potensi gangguan besar pada operasional bisnis."
          },
          {
            id: 2,
            title: "Payment Fraud",
            description: "Upaya penipuan atau manipulasi dalam proses pembayaran, misalnya dengan mengirim bukti transfer palsu, melakukan refund/chargeback tidak sah, atau mengganti informasi rekening tujuan pembayaran. Serangan ini dapat merugikan bisnis secara langsung dan sulit dideteksi tanpa verifikasi berlapis."
          }
        ]
      },
      {
        id: 6,
        "title-data": "Data Pelanggan",
        description: "Data pelanggan mencakup informasi pribadi seperti nama, nomor telepon, alamat, riwayat pembelian, serta preferensi produk. Data ini digunakan untuk keperluan layanan pelanggan, pengiriman barang, serta kegiatan pemasaran yang lebih terarah. Karena berisi data identitas dan kontak langsung pelanggan, aset ini termasuk kategori data sensitif. Kebocoran atau penyalahgunaan data pelanggan dapat berdampak besar terhadap reputasi bisnis, kepercayaan publik, dan kepatuhan terhadap regulasi perlindungan data (seperti PDP).",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran data pelanggan yang disebabkan oleh kesalahan konfigurasi sistem, akses tidak sah, atau pencurian data. Insiden ini dapat terjadi akibat server yang tidak diamankan dengan baik, kredensial bocor, atau akses API yang terlalu terbuka. Dampaknya meliputi penyebaran data pribadi pelanggan, penyalahgunaan identitas, dan rusaknya kepercayaan terhadap bisnis."
          },
          {
            id: 2,
            title: "Phishing / Penipuan WhatsApp",
            description: "Serangan rekayasa sosial di mana pelaku menyamar sebagai pihak resmi seperti admin toko, kurir, atau bank melalui pesan WhatsApp atau media sosial. Tujuannya untuk menipu pelanggan agar memberikan OTP, password, atau mengklik tautan berbahaya. Dampaknya: akses akun pelanggan diambil alih, data pribadi dicuri, dan potensi kerugian finansial meningkat."
          }
        ]
      },
      {
        id: 7,
        "title-data": "Data Supplier / Vendor",
        description: "Data supplier atau vendor mencakup informasi penting terkait pemasok, seperti kontak, harga, jadwal pengiriman, dan persyaratan kerja sama. Data ini digunakan untuk mengelola pembelian barang, koordinasi logistik, serta negosiasi harga dan kontrak. Karena memuat informasi finansial dan operasional bisnis pihak ketiga, aset ini termasuk kategori data sensitif. Kebocoran atau penyalahgunaan data supplier dapat menimbulkan kerugian finansial, terganggunya rantai pasok, dan rusaknya hubungan bisnis jangka panjang.",
        threats: [
          {
            id: 1,
            title: "Business Email Compromise (BEC)",
            description: "Penipuan yang terjadi melalui email di mana pelaku menyamar sebagai pihak tepercaya, seperti supplier atau manajer pembelian. Tujuannya bisa berupa pengubahan rekening pembayaran, meminta transfer uang, atau mengakses informasi kontrak sensitif. Dampaknya meliputi kerugian finansial langsung, terganggunya rantai pasok, dan rusaknya kepercayaan antara bisnis dan pemasok."
          }
        ]
      },
      {
        id: 8,
        "title-data": "Dokumen Legal / Kontrak (scan)",
        description: "Dokumen legal atau kontrak yang disimpan secara digital mencakup scan kontrak kerja sama dengan vendor, kontrak karyawan, sertifikat, dan dokumen legalitas perusahaan (seperti akta atau izin usaha). Data ini digunakan untuk keperluan administrasi, kepatuhan hukum, dan pengelolaan hak serta kewajiban pihak terkait. Karena berisi informasi sensitif terkait hak hukum, kewajiban finansial, dan identitas pihak-pihak terkait, aset ini termasuk kategori data sensitif. Kebocoran atau penyalahgunaan dokumen legal dapat menimbulkan risiko hukum, kerugian finansial, dan rusaknya reputasi perusahaan.",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran dokumen legal atau kontrak yang disebabkan oleh kesalahan konfigurasi sistem, akses tidak sah, atau pencurian data. Insiden ini bisa terjadi akibat server yang tidak diamankan, akun dengan kredensial lemah, atau berbagi dokumen tanpa kontrol. Dampaknya meliputi pengungkapan informasi sensitif, kerugian hukum dan finansial, serta rusaknya reputasi bisnis."
          }
        ]
      },
      {
        id: 9,
        "title-data": "Konfigurasi Jaringan / Wi-Fi Toko",
        description: "Konfigurasi jaringan toko mencakup setelan Wi-Fi dan jaringan lokal yang menghubungkan perangkat kasir, printer, komputer staf, serta perangkat IoT lainnya. Data ini digunakan untuk memastikan operasional harian berjalan lancar, termasuk transaksi penjualan, cetak struk, dan akses sistem internal. Karena menyangkut akses ke sistem operasional dan data transaksi, aset ini termasuk kategori data sensitif. Akses tidak sah atau gangguan jaringan dapat menyebabkan gangguan operasional, pencurian data transaksi, dan potensi kerugian finansial.",
        threats: [
          {
            id: 1,
            title: "Unauthorized Access",
            description: "Akses ke jaringan atau perangkat dilakukan oleh pihak yang tidak berhak, misalnya akibat password lemah, kredensial dibagikan sembarangan, atau akun diretas. Dampaknya meliputi penyalahgunaan sistem, pencurian data transaksi, dan gangguan operasional."
          },
          {
            id: 2,
            title: "Man-in-the-Middle Attack",
            description: "Serangan di mana pelaku menyadap komunikasi antara perangkat pengguna dan sistem, misalnya saat transaksi online. Pelaku dapat mencuri data login, informasi pembayaran, atau mengubah data yang dikirim. Dampaknya: pencurian data sensitif dan potensi kerugian finansial."
          }
        ]
      },
      {
        id: 10,
        "title-data": "Akun Bank",
        description: "Akun bank mencakup username, password, token, dan kredensial lain yang digunakan untuk mengakses data rekening perusahaan. Data ini digunakan untuk keperluan transaksi keuangan, pembayaran vendor, dan pengelolaan kas perusahaan. Karena memuat informasi finansial sensitif, aset ini termasuk kategori data kritikal. Kebocoran atau penyalahgunaan akun bank dapat menimbulkan kerugian finansial langsung, gangguan operasional, dan risiko hukum.",
        threats: [
          {
            id: 1,
            title: "Phishing",
            description: "Upaya penipuan melalui email, website palsu, atau chat untuk memperoleh data sensitif seperti username, password, atau OTP. Dampaknya meliputi akses tidak sah ke rekening bank, pencurian dana, dan potensi kerugian finansial bagi perusahaan."
          }
        ]
      },
      {
        id: 11,
        "title-data": "Akun Komunikasi",
        description: "Akun komunikasi mencakup sarana komunikasi digital dengan pelanggan, seperti WhatsApp Business, Instagram DM, Tokopedia Chat, Shopee Chat, dan live chat di website. Data ini berisi percakapan, permintaan pesanan, hingga bukti pembayaran, yang digunakan untuk layanan pelanggan, promosi, dan penjualan barang. Karena menyimpan informasi sensitif pelanggan dan transaksi, aset ini termasuk kategori data sensitif. Akses atau kebocoran yang tidak sah dapat menimbulkan kerugian finansial, gangguan layanan, dan rusaknya kepercayaan pelanggan.",
        threats: [
          {
            id: 1,
            title: "Account Takeover",
            description: "Penyerang berhasil mengambil alih akun komunikasi untuk melakukan transaksi, mengubah data, atau menyamar sebagai perusahaan tanpa izin. Dampaknya termasuk penyalahgunaan akun dan gangguan layanan pelanggan."
          },
          {
            id: 2,
            title: "Social Engineering",
            description: "Manipulasi psikologis terhadap pengguna akun untuk melakukan tindakan tertentu, misalnya mengklik tautan berbahaya di WhatsApp atau platform komunikasi lain. Dampaknya: akses akun atau data bisa dicuri."
          },
          {
            id: 3,
            title: "Data Leakage",
            description: "Kebocoran data percakapan atau informasi pelanggan akibat salah konfigurasi sistem, kelalaian karyawan, atau keamanan yang lemah. Dampaknya meliputi penyebaran data sensitif dan rusaknya reputasi bisnis."
          },
          {
            id: 4,
            title: "Phishing",
            description: "Upaya menipu pengguna akun melalui email, website palsu, atau chat agar memberikan data sensitif seperti username, password, atau OTP. Dampaknya termasuk akses tidak sah dan kerugian finansial."
          }
        ]
      },
      {
        id: 12,
        "title-data": "Perangkat Kerja (HP / Laptop / POS)",
        description: "Perangkat kerja mencakup HP, laptop, dan perangkat POS yang digunakan staf untuk operasional harian, seperti kasir, komunikasi, pencatatan transaksi, atau akses akun bisnis. Data yang tersimpan di perangkat ini dapat berupa informasi pelanggan, transaksi, dokumen internal, dan kredensial akun. Karena menyimpan berbagai data sensitif dan akses ke sistem bisnis, aset ini termasuk kategori data kritikal. Kehilangan atau kompromi perangkat dapat mengakibatkan pencurian data, gangguan operasional, dan kerugian finansial.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang dapat mencuri, mengenkripsi, atau merusak data pada perangkat. Serangan ini bisa membuat sistem tidak dapat digunakan tanpa membayar tebusan dan menyebabkan gangguan operasional serta kerugian finansial."
          }
        ]
      },
      {
        id: 13,
        "title-data": "Sistem / Cloud (Drive/Server/ERP)",
        description: "Sistem dan layanan cloud mencakup platform seperti cloud storage, server internal, atau ERP yang digunakan untuk menyimpan file bisnis, laporan, dashboard penjualan, dan data operasional lainnya. Data ini digunakan untuk memonitor bisnis, membuat keputusan, serta mendukung kegiatan penjualan, pembelian, produksi, dan keuangan. Karena menyimpan informasi sensitif dan strategis perusahaan, aset ini termasuk kategori data kritikal. Gangguan atau kebocoran data pada sistem cloud dapat menimbulkan kerugian finansial, gangguan operasional, dan risiko reputasi.",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran data sensitif akibat kesalahan konfigurasi sistem, akses tidak sah, atau pencurian data. Dampaknya meliputi pengungkapan informasi strategis perusahaan dan potensi kerugian finansial."
          },
          {
            id: 2,
            title: "Distributed Denial of Service (DDoS)",
            description: "Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses. Dampaknya termasuk terganggunya operasional dan hilangnya kepercayaan pelanggan."
          },
          {
            id: 3,
            title: "Privilege Escalation",
            description: "Eksploitasi yang memungkinkan pihak tidak berwenang memperoleh hak akses lebih tinggi dalam sistem daripada seharusnya. Dampaknya: data sensitif bisa diakses atau diubah tanpa izin."
          },
          {
            id: 4,
            title: "Supply-chain Compromise",
            description: "Kompromi pada rantai pasokan atau vendor yang dapat menyebabkan gangguan layanan atau kebocoran data perusahaan. Dampaknya: operasional terganggu dan risiko reputasi meningkat."
          },
          {
            id: 5,
            title: "Unauthorized Access",
            description: "Akses ke sistem atau data oleh pihak yang tidak berwenang akibat kontrol keamanan yang lemah. Dampaknya termasuk pencurian data, gangguan operasional, dan potensi kerugian finansial."
          }
        ]
      },
      {
        id: 14,
        "title-data": "Website / E-commerce / Landing Page",
        description: "Website atau e-commerce mencakup situs toko online, landing page produk, dan platform digital lainnya yang menampilkan informasi bisnis serta menerima pesanan dari pelanggan. Data yang tersimpan dapat berupa detail produk, inventaris, pesanan, dan interaksi pelanggan. Karena menjadi titik utama transaksi dan interaksi pelanggan, aset ini termasuk kategori data kritikal. Gangguan, manipulasi, atau kebocoran data pada website dapat menyebabkan kerugian finansial, rusaknya reputasi, dan hilangnya kepercayaan pelanggan.",
        threats: [
          {
            id: 1,
            title: "Web Injection / Defacement",
            description: "Perubahan atau injeksi kode di website yang dapat mengarahkan pelanggan ke tautan berbahaya atau merusak reputasi bisnis. Dampaknya termasuk hilangnya kepercayaan pelanggan dan potensi kerugian finansial."
          },
          {
            id: 2,
            title: "Distributed Denial of Service (DDoS)",
            description: "Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses. Dampaknya meliputi terganggunya transaksi, penurunan pendapatan, dan reputasi bisnis terdampak."
          },
          {
            id: 3,
            title: "Payment Fraud (Checkout Manipulation)",
            description: "Modifikasi proses pembayaran oleh pihak jahat, misalnya mengubah nominal, menonaktifkan verifikasi pembayaran, atau mengirim bukti transfer palsu agar barang dikirim tanpa pembayaran sah. Dampaknya: kerugian finansial langsung dan gangguan operasional."
          }
        ]
      }
    ];

    console.log('📦 Creating assets and threats...');
    const createdAssets = [];
    
    for (const assetData of assetsData) {
      // Create asset
      const asset = await prisma.asset.create({
        data: {
          name: assetData["title-data"],
          description: assetData.description
        }
      });
      createdAssets.push(asset);
      console.log(`✅ Created asset: ${asset.name}`);

      // Create threats for this asset
      for (const threatData of assetData.threats) {
        const threat = await prisma.threat.create({
          data: {
            assetId: asset.id,
            name: threatData.title,
            description: threatData.description
          }
        });
        console.log(`  ⚠️ Created threat: ${threat.name}`);
      }
    }

    // Create business processes
    const businessProcesses = [
      { name: 'Penjualan', description: 'Proses penjualan produk dan layanan' },
      { name: 'Pemasaran', description: 'Proses pemasaran dan promosi' },
      { name: 'Customer Service', description: 'Proses layanan pelanggan' },
      { name: 'Keuangan', description: 'Proses keuangan dan akuntansi' },
      { name: 'Operasional', description: 'Proses operasional harian' },
      { name: 'IT Support', description: 'Proses dukungan teknologi informasi' },
      { name: 'Logistik', description: 'Proses pengiriman dan distribusi' },
      { name: 'Produksi', description: 'Proses produksi barang dan jasa' }
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

    console.log('🎉 Real data seeding completed successfully!');
    console.log(`📊 Created ${createdAssets.length} assets`);
    console.log(`⚠️ Created threats for all assets`);
    console.log(`🔄 Created ${createdProcesses.length} business processes`);

  } catch (error) {
    console.error('❌ Error seeding real data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Starting UMKM Survey Database Seeding...');
  console.log('=====================================');
  
  try {
    await seedRealData();
    console.log('=====================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('🎯 You can now run the survey application with real data');
  } catch (error) {
    console.log('=====================================');
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();
