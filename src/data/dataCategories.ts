type DataCategoryStatus = "belum" | "proses" | "selesai";

type DataCategory = {
  title: string;
  description: string;
  status: DataCategoryStatus;
};

export const dataCategories: DataCategory[] = [
  {
    title: "API / Integrasi Pihak Ketiga",
    status: "belum",
    description:
      "Usaha Anda mungkin menggunakan layanan dari pihak ketiga seperti payment gateway, kurir, atau marketplace API agar operasional berjalan lebih efisien. Data yang tersimpan di sini biasanya berupa kredensial dan koneksi yang menghubungkan sistem Anda dengan layanan eksternal.",
  },
  {
    title: "Akun Marketplace / Seller Account",
    status: "selesai",
    description:
      "Akun di platform marketplace seperti Tokopedia, Shopee, atau Bukalapak menjadi pintu utama penjualan online Anda. Di dalamnya tersimpan data toko, saldo, pengaturan logistik, serta akses admin.",
  },
  {
    title: "Akun Media Sosial",
    status: "proses",
    description:
      "Instagram, Facebook, TikTok, atau YouTube bukan sekadar tempat promosi—mereka adalah wajah digital usaha Anda. Data penting seperti username, password, dan pesan dengan pelanggan juga tersimpan di sini.",
  },
  {
    title: "Backup / Cadangan Data",
    status: "selesai",
    description:
      "Cadangan data bisnis yang disimpan di luar sistem utama—baik di flashdisk, hard drive, maupun cloud—berguna untuk mengantisipasi kehilangan data penting.",
  },
  {
    title: "Data Keuangan",
    status: "proses",
    description:
      "Catatan keuangan seperti transaksi, invoice, bukti transfer, dan laporan penjualan merupakan aset sensitif yang mencerminkan kondisi bisnis.",
  },
  {
    title: "Data Pelanggan",
    status: "selesai",
    description:
      "Berisi informasi identitas pelanggan seperti nama, nomor telepon, alamat, riwayat pembelian, dan preferensi belanja. Data ini membantu mengenali kebutuhan pelanggan dan membangun hubungan jangka panjang.",
  },
  {
    title: "Data Supplier / Vendor",
    status: "proses",
    description:
      "Data ini mencakup informasi pemasok seperti kontak, harga, jadwal pengiriman, hingga syarat kerja sama.",
  },
  {
    title: "Dokumen Legal / Kontrak (scan)",
    status: "belum",
    description:
      "Dokumen penting seperti surat kontrak, legalitas usaha, dan sertifikat yang sudah discan menjadi bukti formal kegiatan bisnis.",
  },
  {
    title: "Konfigurasi Jaringan / Wi-Fi Toko",
    status: "belum",
    description:
      "Pengaturan jaringan lokal yang menghubungkan perangkat kasir, printer, atau komputer staf.",
  },
  {
    title: "Akun Bank",
    status: "proses",
    description:
      "Menyimpan data username, password, token, dan akses ke rekening usaha. Informasi ini sangat sensitif karena langsung berhubungan dengan keuangan bisnis.",
  },
  {
    title: "Akun Komunikasi",
    status: "selesai",
    description:
      "Meliputi WhatsApp Business, Instagram DM, Tokopedia Chat, Shopee Chat, hingga Live Chat di website. Data di sini berisi percakapan pelanggan, permintaan pesanan, dan bukti pembayaran.",
  },
  {
    title: "Perangkat Kerja (HP / Laptop / POS)",
    status: "selesai",
    description:
      "Perangkat seperti handphone, laptop, dan mesin kasir digunakan setiap hari untuk mencatat transaksi dan mengelola operasional.",
  },
  {
    title: "Sistem / Cloud (Drive / Server / ERP)",
    status: "selesai",
    description:
      "Layanan cloud seperti Google Drive, Dropbox, atau sistem ERP menyimpan file bisnis, laporan, dan dashboard penjualan.",
  },
  {
    title: "Website / E-commerce / Landing Page",
    status: "belum",
    description:
      "Situs web usaha menjadi wajah digital bisnis Anda—menampilkan produk, menerima pesanan, dan mengelola informasi pelanggan.",
  },
];