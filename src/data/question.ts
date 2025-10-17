import { Question } from "@/types/survey";

export const questions: Question[] = [
    {
        id: "name",
        text: "Apa nama lengkap Anda?",
        placeholder: "Masukkan nama lengkap Anda",
        type: "short",
        required: true,
    },
    {
        id: "email",
        text: "Apa alamat email Anda?",
        placeholder: "Masukkan alamat email Anda",
        type: "email",
        required: true,
    },
    {
        id: "age",
        text: "Berapa usia Anda?",
        placeholder: "Masukkan usia Anda",
        type: "number",
        required: true,
    },
    {
        id: "gender",
        text: "Apa jenis kelamin Anda?",
        placeholder: "",
        type: "dropdown",
        options: ["Laki-laki", "Perempuan", "Lainnya", "Tidak ingin menyebutkan"],
        required: true,
    },
    {
        id: "experience",
        text: "Ceritakan pengalaman Anda menggunakan layanan kami.",
        placeholder: "Tulis pengalaman Anda di sini...",
        type: "long",
        required: true,
    },
    {
        id: "satisfaction",
        text: "Seberapa puas Anda dengan layanan kami?",    
        placeholder: "",
        type: "radio",
        options: [
            "Sangat Puas",
            "Puas",
            "Cukup Puas",
            "Tidak Puas",
            "Sangat Tidak Puas",
        ],  
        required: true,
    },
    {
        id: "features",
        text: "Fitur apa yang paling Anda sukai? (Pilih semua yang sesuai)",
        placeholder: "",
        type: "checkbox",
        options: [
            "Kemudahan Penggunaan",
            "Kecepatan Layanan",
            "Dukungan Pelanggan",
            "Harga",
            "Fitur Tambahan",
        ],
        required: false,
    },
];