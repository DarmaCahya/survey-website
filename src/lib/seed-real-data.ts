import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Strong typing for inlined seed data
type BusinessProcessInput = { name: string; explanation?: string };
type ThreatInput = {
  id: number;
  title: string;
  description?: string;
  business_processes?: BusinessProcessInput[];
};
type AssetInput = {
  id: number;
  "title-data": string;
  description?: string;
  threats: ThreatInput[];
};

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

    // Create assets and threats based on latest provided data (inlined)
    const assetsData: AssetInput[] = [
      {
        id: 1,
        "title-data": "API / Integrasi Pihak Ketiga",
        description: "Kredensial dan koneksi ke layanan pihak ketiga (payment gateway, kurir, marketplace API).",
        threats: [
          {
            id: 1,
            title: "Supply-Chain Compromise",
            description: "Serangan yang menargetkan vendor atau penyedia layanan yang terhubung dengan sistem bisnis Anda. Bila salah satu penyedia layanan mengalami kebocoran, penyerang bisa masuk ke sistem utama melalui celah tersebut. Ancaman ini berdampak pada proses bisnis: Penjualan Barang, Finance.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Gangguan integrasi API ke marketplace atau kurir sehingga pesanan tidak diproses, tertunda, atau status pengiriman tidak akurat." },
              { name: "Finance", explanation: "Kebocoran atau manipulasi data transaksi dari payment gateway yang dapat menyebabkan kesalahan pencatatan atau kehilangan dana." }
            ]
          },
          {
            id: 2,
            title: "Third-Party Compromise",
            description: "Kompromi sistem penyedia layanan eksternal (mis. logistik, penyedia pembayaran, marketplace integration) yang menyebabkan bocornya data atau gangguan layanan. Ancaman ini berdampak pada proses bisnis: Penjualan Barang, Finance.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Kegagalan sinkronisasi data produk, stok, atau pesanan karena layanan pihak ketiga terganggu." },
              { name: "Finance", explanation: "Transaksi otomatis yang menggunakan layanan pihak ketiga bisa termanipulasi atau tidak tercatat dengan benar." }
            ]
          }
        ]
      },
      {
        id: 2,
        "title-data": "Akun Marketplace / Seller Account",
        description: "Akun di platform marketplace (Tokopedia, Shopee, dll.) termasuk data toko, saldo, dan pengaturan logistik, username dan password dan sistem admin.",
        threats: [
          {
            id: 1,
            title: "Brute Force",
            description: "Upaya otomatis menebak kata sandi berkali-kali hingga berhasil masuk ke akun marketplace. Ancaman ini berdampak pada proses bisnis: Inventory Management, Customer Service, Penjualan Barang.",
            business_processes: [
              { name: "Inventory Management", explanation: "Akses tidak sah dapat mengubah atau mengosongkan stok produk sehingga data inventaris tidak akurat." },
              { name: "Customer Service", explanation: "Pelaku bisa membalas pesan pelanggan dengan informasi palsu atau menipu pelanggan melalui chat toko." },
              { name: "Penjualan Barang", explanation: "Perubahan harga, penghapusan produk, atau penarikan saldo yang merugikan pemilik toko." }
            ]
          },
          {
            id: 2,
            title: "Account Takeover (ATO)",
            description: "Penyerang berhasil mengambil alih akun marketplace melalui pencurian kredensial atau metode lain. Ancaman ini berdampak pada proses bisnis: Penjualan Barang.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Akun toko diambil alih, pelaku dapat melakukan penipuan, mengganti informasi pengiriman, atau menarik dana." }
            ]
          },
          {
            id: 3,
            title: "Credential Stuffing",
            description: "Penggunaan kredensial bocor dari layanan lain untuk login ke akun marketplace. Ancaman ini berdampak pada proses bisnis: Penjualan Barang.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Serangan massal dapat menyebabkan banyak toko diretas jika pengguna menggunakan kredensial sama di berbagai platform." }
            ]
          },
          {
            id: 4,
            title: "Phishing / Social Engineering",
            description: "Penyerang mengirim pesan palsu untuk menipu pemilik akun agar memberikan kata sandi atau OTP. Ancaman ini berdampak pada proses bisnis: Penjualan Barang, Promosi.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Pemilik akun tertipu menyerahkan akses, mengakibatkan kehilangan kontrol toko dan potensi kerugian finansial." },
              { name: "Promosi", explanation: "Penipuan yang menargetkan pemilik akun bisa menonaktifkan atau menyalahgunakan kampanye promosi berbayar." }
            ]
          }
        ]
      },
      {
        id: 3,
        "title-data": "Akun Media Sosial",
        description: "Akun di media sosial seperti Instagram, TikTok, Facebook, YouTube, termasuk interaksi followers, kredensial, dan akses admin.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang disisipkan melalui link atau aplikasi pihak ketiga yang dijalankan pada perangkat admin media sosial. Ancaman ini berdampak pada proses bisnis: Customer Service, Upload data content, Promosi.",
            business_processes: [
              { name: "Customer Service", explanation: "Malware dapat mencuri percakapan, mengganggu respon ke pelanggan, atau mengambil alih akun komunikasi." },
              { name: "Upload data content", explanation: "Perangkat yang terinfeksi dapat kehilangan konten asli atau menyebabkan pengunggahan konten palsu.\n" },
              { name: "Promosi", explanation: "Akses akun promosi dapat disalahgunakan untuk memposting iklan palsu atau mengalihkan anggaran iklan." }
            ]
          },
          {
            id: 2,
            title: "Brute Force",
            description: "Upaya otomatis untuk menebak kata sandi akun media sosial. Ancaman ini berdampak pada proses bisnis: Upload data content, Promosi.",
            business_processes: [
              { name: "Upload data content", explanation: "Akun yang diretas dapat kehilangan kontrol atas jadwal posting konten." },
              { name: "Promosi", explanation: "Pelaku dapat mengubah pengaturan kampanye iklan atau menayangkan konten yang merusak reputasi." }
            ]
          }
        ]
      },
      {
        id: 4,
        "title-data": "Backup / Cadangan Data",
        description: "Salinan cadangan data bisnis yang disimpan di luar sistem utama (offline/cloud backup).",
        threats: [
          {
            id: 1,
            title: "Backup Tampering / Incomplete Backup",
            description: "Kerusakan, kehilangan, atau manipulasi cadangan data yang menyebabkan pemulihan gagal. Ancaman ini berdampak pada proses bisnis: Backup data keuangan, customer, vendor, report dan sebagainya.",
            business_processes: [
              { name: "Backup data keuangan", explanation: "Cadangan laporan keuangan yang rusak menghambat audit dan proses pelaporan." },
              { name: "Customer", explanation: "Cadangan data pelanggan yang tidak lengkap menyebabkan kehilangan histori pesanan dan data kontak." },
              { name: "Vendor", explanation: "Ketidaktersediaan cadangan kontrak vendor dapat mengganggu pengadaan dan negosiasi." },
              { name: "Report", explanation: "Laporan operasional yang tidak lengkap menghambat analisis kinerja dan pengambilan keputusan." }
            ]
          }
        ]
      },
      {
        id: 5,
        "title-data": "Data Keuangan",
        description: "Catatan transaksi, invoice, bukti transfer, saldo rekening, dan laporan keuangan.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang dapat mencuri, mengenkripsi, atau merusak file keuangan. Ancaman ini berdampak pada proses bisnis: Finance.",
            business_processes: [
              { name: "Finance", explanation: "Enkripsi atau pencurian file keuangan menghentikan proses pembayaran, rekonsiliasi, dan pelaporan." }
            ]
          },
          {
            id: 2,
            title: "Payment Fraud",
            description: "Penipuan atau manipulasi dalam proses pembayaran, seperti bukti transfer palsu atau pengubahan rekening tujuan. Ancaman ini berdampak pada proses bisnis: Finance.",
            business_processes: [
              { name: "Finance", explanation: "Transfer tidak sah atau penggantian rekening dapat menyebabkan kehilangan dana dan masalah rekonsiliasi." }
            ]
          }
        ]
      },
      {
        id: 6,
        "title-data": "Data Pelanggan",
        description: "Informasi identitas pelanggan seperti nama, nomor telepon, alamat, histori pembelian, dan preferensi.",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran data pelanggan akibat konfigurasi sistem atau akses tidak sah. Ancaman ini berdampak pada proses bisnis: Penjualan barang dan Customer Service.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Penyebaran data pelanggan dapat mempengaruhi keamanan pengiriman dan personalisasi penjualan." },
              { name: "Customer Service", explanation: "Informasi pelanggan yang bocor mengurangi kepercayaan pelanggan dan memperberat beban layanan." }
            ]
          },
          {
            id: 2,
            title: "Phishing / Penipuan WA",
            description: "Serangan rekayasa sosial yang menipu pelanggan melalui WhatsApp atau media lain untuk mengungkap data sensitif. Ancaman ini berdampak pada proses bisnis: Penjualan barang dan Customer Service.",
            business_processes: [
              { name: "Penjualan Barang", explanation: "Pelanggan tertipu memberikan detail pembayaran atau OTP sehingga pesanan bermasalah." },
              { name: "Customer Service", explanation: "Layanan pelanggan harus menangani klaim dan komplain akibat penipuan tersebut." }
            ]
          }
        ]
      },
      {
        id: 7,
        "title-data": "Data Supplier / Vendor",
        description: "Informasi pemasok seperti kontak, harga, jadwal pengiriman, dan persyaratan.",
        threats: [
          {
            id: 1,
            title: "Business Email Compromise (BEC)",
            description: "Penipuan melalui email di mana pelaku menyamar sebagai supplier atau manajer pembelian untuk mengubah rekening pembayaran. Ancaman ini berdampak pada proses bisnis: Pembelian Barang.",
            business_processes: [
              { name: "Pembelian Barang", explanation: "Perubahan rekening atau instruksi pembayaran palsu dapat menyebabkan pengiriman dana ke pihak tidak berwenang." }
            ]
          }
        ]
      },
      {
        id: 8,
        "title-data": "Dokumen Legal / Kontrak (scan)",
        description: "Scan kontrak, dokumen legal, atau sertifikat yang disimpan secara digital.",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran dokumen legal atau kontrak akibat akses tidak sah atau konfigurasi yang lemah. Ancaman ini berdampak pada proses bisnis: Contract Pembelian dengan vendor, Contract dengan karyawan, Legalitas PT.",
            business_processes: [
              { name: "Contract Pembelian dengan vendor", explanation: "Pengungkapan syarat kontrak atau harga yang seharusnya privat bisa merugikan posisi negosiasi." },
              { name: "Contract dengan karyawan", explanation: "Bocornya data kontrak karyawan dapat menimbulkan masalah hukum dan pelanggaran privasi." },
              { name: "Legalitas PT", explanation: "Dokumen legal yang bocor dapat mengekspos struktur kepemilikan, izin usaha, atau informasi sensitif korporat." }
            ]
          }
        ]
      },
      {
        id: 9,
        "title-data": "Konfigurasi Jaringan / Wi‑Fi Toko",
        description: "Setelan jaringan lokal yang menghubungkan perangkat kasir, printer, dan perangkat staf.",
        threats: [
          {
            id: 1,
            title: "Unauthorized Access",
            description: "Akses tidak sah ke jaringan atau perangkat akibat kredensial lemah atau konfigurasi yang buruk. Ancaman ini berdampak pada proses bisnis: Produksi/Operasional.",
            business_processes: [
              { name: "Produksi/Operasional", explanation: "Penyerang dapat mengganggu mesin, cetak struk, atau akses data transaksi yang menyebabkan gangguan layanan." }
            ]
          },
          {
            id: 2,
            title: "Man-in-the-Middle Attack",
            description: "Penyadapan komunikasi antara perangkat pengguna dan sistem, memungkinkan pencurian data atau manipulasi. Ancaman ini berdampak pada proses bisnis: Produksi/Operasional, Penjualan.",
            business_processes: [
              { name: "Produksi/Operasional", explanation: "Intersepsi komunikasi internal dapat menyebabkan perintah palsu atau kebocoran konfigurasi." },
              { name: "Penjualan", explanation: "Data transaksi yang disadap (mis. nomor kartu atau kredensial) dapat menimbulkan penipuan pembayaran." }
            ]
          }
        ]
      },
      {
        id: 10,
        "title-data": "Akun Bank",
        description: "Username, password, token, untuk akses ke data bank.",
        threats: [
          {
            id: 1,
            title: "Phishing",
            description: "Upaya menipu pengguna untuk menyerahkan kredensial atau OTP melalui email, situs palsu, atau chat. Ancaman ini berdampak pada proses bisnis: Finance.",
            business_processes: [
              { name: "Finance", explanation: "Kompromi akun bank dapat menyebabkan transfer tidak sah, kehilangan dana, dan gangguan arus kas." }
            ]
          }
        ]
      },
      {
        id: 11,
        "title-data": "Akun Komunikasi",
        description: "Sarana komunikasi digital dengan pelanggan seperti WhatsApp Business, Instagram DM, Tokopedia Chat, Shopee Chat, dan Live Chat di website.",
        threats: [
          {
            id: 1,
            title: "Account Takeover",
            description: "Pengambilalihan akun komunikasi yang memungkinkan pelaku menyamar sebagai perusahaan. Ancaman ini berdampak pada proses bisnis: Customer Service, Promosi, Penjualan Barang.",
            business_processes: [
              { name: "Customer Service", explanation: "Akun yang diretas dapat digunakan untuk memberikan informasi palsu, menunda jawaban, atau menipu pelanggan." },
              { name: "Promosi", explanation: "Pelaku dapat mengirim promosi palsu atau menyesatkan pelanggan melalui kanal resmi." },
              { name: "Penjualan Barang", explanation: "Pemalsuan bukti pembayaran atau instruksi pengiriman yang menyebabkan kerugian pesanan." }
            ]
          },
          {
            id: 2,
            title: "Social Engineering",
            description: "Manipulasi pengguna untuk melakukan tindakan yang membahayakan keamanan data atau akses. Ancaman ini berdampak pada proses bisnis: Customer Service, Promosi.",
            business_processes: [
              { name: "Customer Service", explanation: "Pegawai ditipu menyerahkan informasi sensitif pelanggan atau akses sistem." },
              { name: "Promosi", explanation: "Kampanye atau pesan promosi disalahgunakan untuk menipu audiens." }
            ]
          },
          {
            id: 3,
            title: "Data Leakage",
            description: "Kebocoran data percakapan atau informasi pelanggan akibat konfigurasi yang lemah atau kelalaian. Ancaman ini berdampak pada proses bisnis: Customer Service, Promosi.",
            business_processes: [
              { name: "Customer Service", explanation: "Percakapan pelanggan yang bocor dapat mengungkap data sensitif dan memperburuk kepercayaan." },
              { name: "Promosi", explanation: "Data audiens yang bocor dapat disalahgunakan untuk spam atau penipuan." }
            ]
          },
          {
            id: 4,
            title: "Phishing",
            description: "Upaya menipu pengguna akun komunikasi agar memberikan kredensial atau OTP. Ancaman ini berdampak pada proses bisnis: Customer Service, Finance.",
            business_processes: [
              { name: "Customer Service", explanation: "Akun CS yang diretas menyebabkan gangguan layanan dan klaim pelanggan." },
              { name: "Finance", explanation: "Bukti pembayaran yang dipalsukan atau instruksi transfer yang salah dapat merusak proses pembayaran." }
            ]
          }
        ]
      },
      {
        id: 12,
        "title-data": "Perangkat Kerja (HP / Laptop / POS)",
        description: "Perangkat yang digunakan staf untuk operasional: kasir, komunikasi, pencatatan, atau akses akun bisnis.",
        threats: [
          {
            id: 1,
            title: "Malware / Ransomware",
            description: "Program berbahaya yang mencuri, mengenkripsi, atau merusak data pada perangkat. Ancaman ini berdampak pada proses bisnis: Penjualan, Pembelian, Produksi, Finance.",
            business_processes: [
              { name: "Penjualan", explanation: "Perangkat kasir yang terkunci atau datanya terenkripsi menghentikan transaksi di toko." },
              { name: "Pembelian", explanation: "Dokumen PO atau komunikasi pembelian yang hilang mengganggu proses pengadaan." },
              { name: "Produksi", explanation: "Perangkat yang mengontrol produksi atau inventaris terganggu menyebabkan penundaan produksi." },
              { name: "Finance", explanation: "Akses ke file keuangan yang dicuri atau terenkripsi menghambat rekonsiliasi dan pelaporan." }
            ]
          }
        ]
      },
      {
        id: 13,
        "title-data": "Sistem / Cloud (Drive/Server/ERP)",
        description: "Platform dan layanan cloud yang menyimpan file bisnis, laporan, atau dashboard penjualan.",
        threats: [
          {
            id: 1,
            title: "Data Leakage",
            description: "Kebocoran data sensitif akibat konfigurasi sistem yang salah atau akses tidak sah. Ancaman ini berdampak pada proses bisnis: Penjualan, Pembelian, Produksi, Finance.",
            business_processes: [
              { name: "Penjualan", explanation: "Data pelanggan atau transaksi yang bocor dapat menurunkan kepercayaan dan mempengaruhi penjualan." },
              { name: "Pembelian", explanation: "Data vendor atau harga yang bocor merusak negosiasi dan pengadaan." },
              { name: "Produksi", explanation: "Rencana produksi atau BOM yang bocor bisa mengganggu operasi pabrik." },
              { name: "Finance", explanation: "Laporan finansial yang bocor dapat mempengaruhi keputusan investor atau kepatuhan." }
            ]
          },
          {
            id: 2,
            title: "Distributed Denial of Service (DDoS)",
            description: "Serangan yang membanjiri layanan online sehingga tidak dapat diakses. Ancaman ini berdampak pada proses bisnis: Penjualan, Customer Service, Operasional.",
            business_processes: [
              { name: "Penjualan", explanation: "Website atau portal penjualan tidak dapat diakses sehingga transaksi online terhenti." },
              { name: "Customer Service", explanation: "CS tidak dapat mengakses sistem pelanggan sehingga layanan terdampak." },
              { name: "Operasional", explanation: "Gangguan pada sistem internal menghentikan proses operasional penting." }
            ]
          },
          {
            id: 3,
            title: "Privilege Escalation",
            description: "Eksploitasi yang memungkinkan pihak tidak berwenang memperoleh hak akses lebih tinggi. Ancaman ini berdampak pada proses bisnis: Penjualan, Pembelian, Produksi, Finance.",
            business_processes: [
              { name: "Penjualan", explanation: "Pengubahan data pesanan atau harga oleh akun yang mendapatkan hak lebih tinggi." },
              { name: "Pembelian", explanation: "Permintaan pembelian atau penerimaan barang dapat dimanipulasi." },
              { name: "Produksi", explanation: "Perubahan jadwal atau parameter produksi tanpa otorisasi menyebabkan cacat produk." },
              { name: "Finance", explanation: "Akses berlebih ke modul keuangan memungkinkan manipulasi laporan." }
            ]
          },
          {
            id: 4,
            title: "Supply-chain Compromise",
            description: "Kompromi vendor atau penyedia cloud yang dapat menyebabkan gangguan layanan atau kebocoran data. Ancaman ini berdampak pada proses bisnis: Penjualan, Pembelian, Produksi, Finance.",
            business_processes: [
              { name: "Penjualan", explanation: "Gangguan layanan pihak ketiga memengaruhi ketersediaan fitur penjualan seperti integrasi checkout." },
              { name: "Pembelian", explanation: "Gangguan pada sistem supplier menghambat proses pemesanan dan penerimaan barang." },
              { name: "Produksi", explanation: "Keterlambatan pasokan komponen mengganggu lini produksi." },
              { name: "Finance", explanation: "Kesalahan atau kebocoran data keuangan pihak ketiga memengaruhi rekonsiliasi." }
            ]
          },
          {
            id: 5,
            title: "Unauthorized Access",
            description: "Akses ke sistem atau data oleh pihak yang tidak berwenang akibat kontrol keamanan yang lemah. Ancaman ini berdampak pada proses bisnis: Penjualan, Pembelian, Produksi, Finance.",
            business_processes: [
              { name: "Penjualan", explanation: "Data pesanan atau pelanggan dapat diubah atau dihapus." },
              { name: "Pembelian", explanation: "Permintaan pembelian atau data vendor bisa dimanipulasi." },
              { name: "Produksi", explanation: "Data produksi yang diubah menyebabkan kesalahan operasional." },
              { name: "Finance", explanation: "Akses tidak sah dapat mengarah pada penggelapan atau manipulasi laporan keuangan." }
            ]
          }
        ]
      },
      {
        id: 14,
        "title-data": "Website / E‑commerce / Landing Page",
        description: "Situs web toko atau halaman produk yang menerima pesanan atau menampilkan informasi bisnis.",
        threats: [
          {
            id: 1,
            title: "Web Injection / Defacement",
            description: "Perubahan atau injeksi kode di website yang dapat mengarahkan pelanggan ke tautan berbahaya atau merusak reputasi bisnis. Ancaman ini berdampak pada proses bisnis: Inventory Management, Customer Service, Penjualan barang, Promosi.",
            business_processes: [
              { name: "Inventory Management", explanation: "Injeksi yang memanipulasi tampilan stok atau data produk menyebabkan ketidaksesuaian inventaris." },
              { name: "Customer Service", explanation: "Informasi salah pada website meningkatkan pertanyaan pelanggan dan komplain." },
              { name: "Penjualan barang", explanation: "Halaman produk yang diserang mengurangi konversi dan kepercayaan pembeli." },
              { name: "Promosi", explanation: "Link promosi dapat diarahkan ke pihak ketiga berbahaya sehingga merusak kampanye pemasaran." }
            ]
          },
          {
            id: 2,
            title: "Distributed Denial of Service (DDoS)",
            description: "Serangan lalu lintas berlebih yang membuat website atau layanan online tidak dapat diakses. Ancaman ini berdampak pada proses bisnis: Penjualan barang, Customer Service, Operasional.",
            business_processes: [
              { name: "Penjualan barang", explanation: "Website down menyebabkan hilangnya kesempatan transaksi dan pendapatan." },
              { name: "Customer Service", explanation: "CS tidak bisa mengakses data pesanan untuk membantu pelanggan." },
              { name: "Operasional", explanation: "Gangguan ini dapat memicu keterlambatan pemenuhan pesanan." }
            ]
          },
          {
            id: 3,
            title: "Payment Fraud (Checkout Manipulation)",
            description: "Modifikasi proses pembayaran oleh pihak jahat, mis. mengubah nominal atau menonaktifkan verifikasi pembayaran sehingga barang dikirim tanpa pembayaran sah. Ancaman ini berdampak pada proses bisnis: Penjualan barang, Finance.",
            business_processes: [
              { name: "Penjualan barang", explanation: "Checkout yang termanipulasi memungkinkan pesanan diproses tanpa pembayaran valid." },
              { name: "Finance", explanation: "Manipulasi pembayaran menyebabkan kehilangan pendapatan dan masalah rekonsiliasi." }
            ]
          }
        ]
      }
    ];

    console.log('📦 Creating assets and threats...');
    const createdAssets = [];
    
    // Cache business process ids by name
    const bpNameToId = new Map<string, number>();

    for (const assetData of assetsData) {
      // Create asset
      const asset = await prisma.asset.create({
        data: {
          name: assetData["title-data"],
          description: assetData.description
        }
      });
      createdAssets.push(asset);
      console.log(✅ Created asset: ${asset.name});

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

        const bps: BusinessProcessInput[] = Array.isArray(threatData.business_processes)
          ? threatData.business_processes
          : [];
        for (const bp of bps) {
          const name = bp.name.trim();
          let id = bpNameToId.get(name);
          if (!id) {
            const existing = await prisma.businessProcess.findFirst({ where: { name } });
            if (existing) {
              id = existing.id;
            } else {
              const created = await prisma.businessProcess.create({ data: { name, description: bp.explanation ?? null } });
              id = created.id;
              console.log(`    🧭 Created business process: ${name}`);
            }
            bpNameToId.set(name, id);
          }
          await prisma.threatBusinessProcess.create({ data: { threatId: threat.id, businessProcessId: id } });
          console.log(`    🔗 Linked threat -> business process: ${name}`);
        }
      }
    }

    // Summary
    const bpCount = await prisma.businessProcess.count();

    console.log('🎉 Real data seeding completed successfully!');
    console.log(📊 Created ${createdAssets.length} assets);
    console.log(⚠️ Created threats for all assets);
    console.log(🔄 Total business processes in DB: ${bpCount});

  } catch (error) {
    console.error('❌ Error seeding real data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedRealData()
    .then(() => {
      console.log('✅ Real data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Real data seeding failed:', error);
      process.exit(1);
    });
}

export { seedRealData };