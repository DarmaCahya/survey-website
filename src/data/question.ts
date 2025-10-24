import { Question } from "@/types/survey";

export const questions: Question[] = [
    {
        id: "biaya_pengetahuan",
        text: "Biaya & Pengetahuan",
        description:
            "Seberapa besar pemahaman Anda tentang biaya yang dibutuhkan dan pengetahuan teknis untuk mengamankan sistem digital bisnis Anda?",
        placeholder: "",
        type: "slider",
        options: ["Tidak Mengerti", "Mengerti"],
        required: true,
    },
    {
        id: "pengaruh_kerugian",
        text: "Pengaruh & Kerugian",
        description:
            "Seberapa baik Anda memahami potensi dampak atau kerugian yang bisa terjadi jika sistem Anda terkena serangan siber?",
        placeholder: "",
        type: "slider",
        options: ["Tidak Mengerti", "Mengerti"],
        required: true,
    },
    {
        id: "frekuensi_serangan",
        text: "Frekuensi Serangan",
        description:
            "Menurut Anda, seberapa sering kemungkinan terjadinya serangan siber terhadap sistem atau data bisnis Anda?",
        placeholder: "",
        type: "slider",
        options: ["Jarang", "Sangat Sering"],
        required: true,
    },
    {
        id: "pemulihan",
        text: "Pemulihan",
        description:
            "Seberapa siap Anda dalam melakukan pemulihan jika sistem bisnis terkena gangguan atau serangan siber?",
        placeholder: "",
        type: "slider",
        options: ["Belum Siap", "Sangat Siap"],
        required: true,
    },
    {
        id: "pemahaman_poin",
        text: "Apakah anda mengerti tentang poin ini?",
        placeholder: "",
        type: "radio",
        options: ["Mengerti", "Tidak Mengerti"],
        required: true,
    },
    {
        id: "pemahaman_tidak_mengerti",
        text: "Jika tidak mengerti, apa yang tidak anda mengerti?",
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
        "id": "penjelasan_tidak_dipahami",
        "text": "Penjelasan tentang hal yang tidak dimengerti",
        "placeholder": "Misal: saya tidak paham apa itu data pelanggan",
        "type": "long",
        "required": false,
    }
];