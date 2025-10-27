import { Question } from "@/types/survey";

export const generateQuestions = (threatId: string): Question[] => [
    {
        id: `${threatId}_biaya_pengetahuan`,
        text: "Biaya & Pengetahuan",
        description:
        "1 (Tidak Mengerti): Tidak memahami biaya maupun alat yang dibutuhkan untuk melakukan atau mencegah serangan siber.\n" +
        "2: Mengetahui sebagian kecil biaya atau alat, namun belum bisa memperkirakan secara detail.\n" +
        "3: Paham kisaran biaya dasar, tapi belum memahami kebutuhan alat khusus atau teknis.\n" +
        "4: Mengetahui kebutuhan alat dan biaya moderat, tapi belum sepenuhnya paham cara penerapannya.\n" +
        "5: Paham sebagian besar aspek biaya dan alat yang dibutuhkan untuk perlindungan.\n" +
        "6 (Mengerti): Sangat memahami estimasi biaya, alat, dan kebutuhan teknis untuk melindungi sistem digital bisnis.",
        placeholder: "",
        type: "slider",
        options: ["Tidak Mengerti", "Mengerti"],
        optionsNumbers: [1, 2, 3, 4, 5, 6],
        required: true,
    },
    {
        id: `${threatId}_pengaruh_kerugian`,
        text: "Pengaruh & Kerugian",
        description:
        "1 (Rendah): Dampak serangan kecil, mudah dipulihkan (<8 jam), kerugian <2% omzet.\n" +
        "2: Dampak kecil, ada alternatif aset, kerugian sedang (2-10% omzet).\n" +
        "3: Dampak kecil tapi kerugian besar (>10% omzet).\n" +
        "4: Dampak besar terhadap aset penting, namun kerugian masih kecil (<2%).\n" +
        "5: Dampak besar dengan kerugian sedang (2-10% omzet).\n" +
        "6 (Tinggi): Dampak besar dan kerugian signifikan (>10% omzet), berpotensi mengancam kelangsungan bisnis.",
        placeholder: "",
        type: "slider",
        options: ["Rendah", "Tinggi"],
        optionsNumbers: [1, 2, 3, 4, 5, 6],
        required: true,
    },
    {
        id: `${threatId}_frekuensi_serangan`,
        text: "Frekuensi Serangan",
        description:
        "1 (Tidak Relevan): Ancaman tidak pernah terjadi dan tidak berdampak pada bisnis.\n" +
        "2 (Tidak Pernah): Belum pernah ada kejadian serangan.\n" +
        "3 (Jarang): Serangan terjadi 1-4 kali per tahun (sekitar 1x per kuartal).\n" +
        "4 (Kadang): Serangan terjadi 5-12 kali per tahun (sekitar 1x per bulan).\n" +
        "5 (Sering): Serangan terjadi 13-50 kali per tahun (sekitar 1x per minggu).\n" +
        "6 (Sangat Sering): Serangan terjadi 51-365 kali per tahun (lebih dari 1x seminggu atau setiap hari).",
        placeholder: "",
        type: "slider",
        options: ["Jarang", "Sangat Sering"],
        optionsNumbers: [1, 2, 3, 4, 5, 6],
        required: true,
    },
    {
        id: `${threatId}_pemulihan`,
        text: "Pemulihan",
        description:
        "2 (Mudah): Pemulihan cepat (<12 jam), tersedia backup, dan akun mudah diamankan ulang (2FA aktif).\n" +
        "4 (Sulit): Pemulihan membutuhkan waktu 12-24 jam, ada backup namun proses verifikasi lama.\n" +
        "6 (Tidak Bisa): Pemulihan gagal (>24 jam), data hilang permanen, dan tidak ada alternatif aset.",
        placeholder: "",
        type: "slider",
        options: ["Mudah", "Sulit", "Tidak Bisa"],
        optionsNumbers: [2, 4, 6],
        required: true,
    },
    {
        id: `${threatId}_pemahaman_poin`,
        text: "Apakah anda mengerti tentang poin ini?",
        placeholder: "",
        type: "radio",
        options: ["Mengerti", "Tidak Mengerti"],
        required: true,
    },
    {
        id: `${threatId}_pemahaman_tidak_mengerti`,
        text: "Jika tidak mengerti, Poin apa yang tidak anda mengerti?",
        placeholder: "",
        type: "dropdown",
        options: [
        "Biaya & Pengetahuan",
        "Pengaruh & Kerugian",
        "Frekuensi Serangan",
        "Pemulihan",
        ],
        required: false,
    },
    {
        id: `${threatId}_penjelasan_tidak_dipahami`,
        text: "Penjelasan tentang hal yang tidak dimengerti",
        placeholder: "Misal: saya tidak paham apa itu data pelanggan",
        type: "long",
        required: false,
    },
];