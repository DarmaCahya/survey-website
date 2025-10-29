import { Question } from "@/types/survey";

export const generateQuestions = (threatId: string, dynamicOptions: string[]): Question[] => [
    {
        id: `${threatId}_biaya_pengetahuan`,
        text: "Biaya & Pengetahuan",
        description:
            "1: Perlu alat khusus dan biaya yang dikeluarkan pelaku tinggi.\n" +
            "2: Tidak perlu alat khusus tapi biaya yang dikeluarkan pelaku tinggi.\n" +
            "3: Perlu alat khusus dan biaya moderat.\n" +
            "4: Tidak perlu alat khusus dan biaya moderat.\n" +
            "5: Perlu alat khusus tapi biaya rendah.\n" +
            "6: Tidak perlu alat khusus dan biaya yang dikeluarkan pelaku rendah.",
        placeholder: "",
        type: "slider",
        options: ["Tinggi", "Rendah"],
        optionsNumbers: [1, 2, 3, 4, 5, 6],
        required: true,
    },
    {
        id: `${threatId}_pengaruh_kerugian`,
        text: "Pengaruh & Kerugian",
        description:
            "1: Pengaruh asset kecil + kerugian kecil (<2% omzet)\n" +
            "2: Pengaruh asset kecil + kerugian sedang (2-10% omzet)\n" +
            "3: Pengaruh asset kecil + kerugian besar (>10% omzet)\n" +
            "4: Pengaruh asset besar + kerugian kecil (<2% omzet)\n" +
            "5: Pengaruh asset besar + kerugian sedang (2-10% omzet)\n" +
            "6: Pengaruh asset besar + kerugian besar (>10% omzet, ganggu kelangsungan bisnis)",       
        placeholder: "",
        type: "slider",
        options: ["Kecil", "Besar"],
        optionsNumbers: [1, 2, 3, 4, 5, 6],
        required: true,
    },
    {
        id: `${threatId}_frekuensi_serangan`,
        text: "Frekuensi Serangan",
        description:
            "1: Tidak relevan \n" +
            "2: Tidak pernah \n"+
            "3: Jarang (1x per quarter) \n" +
            "4: Kadang (1x per bulan)\n" +
            "5: Sering (≥ 1x per minggu)\n" +
            "6: Sangat sering (≥ 1x per hari) \n" ,        
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
            "2: Cukup mudah (8-12 jam, butuh sedikit waktu verifikasi)\n" +
            "4: Sulit (12-24 jam, butuh proses verifikasi lama)\n" +
            "6: Tidak bisa pulih (>24 jam, data hilang permanen)",        
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
        options: dynamicOptions,
        required: false,
        dependencyId: `${threatId}_pemahaman_poin`,  
        dependencyValue: "Tidak Mengerti", 
    },
    {
        id: `${threatId}_penjelasan_tidak_dipahami`,
        text: "Penjelasan tentang hal yang tidak dimengerti",
        placeholder: "Misal: saya tidak paham apa itu data pelanggan",
        type: "long",
        required: false,
        dependencyId: `${threatId}_pemahaman_poin`,  
        dependencyValue: "Tidak Mengerti", 
    },
];