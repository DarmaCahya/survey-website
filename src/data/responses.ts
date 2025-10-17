import { SurveyResponse } from "@/types/survey";

export const mockResponses: SurveyResponse[] = [
    {
        respondent: {
            name: "Andi Saputra",
            email: "andi.saputra@example.com",
            submittedAt: "2025-10-10T09:32:00Z",
        },
        answers: [
            { questionId: "q1", value: "Sangat Puas", answeredAt: "2025-10-10T09:33:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-10T09:34:00Z" },
            { questionId: "q3", value: ["Tampilan", "Kemudahan Penggunaan"], answeredAt: "2025-10-10T09:35:00Z" },
        ],
    },
    {
        respondent: {
            name: "Budi Santoso",
            email: "budi.santoso@example.com",
            submittedAt: "2025-10-11T10:15:00Z",
        },
        answers: [
            { questionId: "q1", value: "Puas", answeredAt: "2025-10-11T10:16:00Z" },
            { questionId: "q2", value: "Tidak", answeredAt: "2025-10-11T10:17:00Z" },
            { questionId: "q3", value: ["Performa", "Aksesibilitas"], answeredAt: "2025-10-11T10:18:00Z" },
        ],
    },
    {
        respondent: {
            name: "Citra Rahma",
            email: "citra.rahma@example.com",
            submittedAt: "2025-10-12T13:22:00Z",
        },
        answers: [
            { questionId: "q1", value: "Netral", answeredAt: "2025-10-12T13:23:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-12T13:24:00Z" },
            { questionId: "q3", value: ["Desain", "Navigasi"], answeredAt: "2025-10-12T13:25:00Z" },
        ],
    },
    {
        respondent: {
            name: "Dewi Kartika",
            email: "dewi.kartika@example.com",
            submittedAt: "2025-10-13T08:47:00Z",
        },
        answers: [
            { questionId: "q1", value: "Sangat Puas", answeredAt: "2025-10-13T08:48:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-13T08:49:00Z" },
            { questionId: "q3", value: ["Kemudahan", "Kecepatan"], answeredAt: "2025-10-13T08:50:00Z" },
        ],
    },
    {
        respondent: {
            name: "Eko Prasetyo",
            email: "eko.prasetyo@example.com",
            submittedAt: "2025-10-13T11:15:00Z",
        },
        answers: [
            { questionId: "q1", value: "Tidak Puas", answeredAt: "2025-10-13T11:16:00Z" },
            { questionId: "q2", value: "Tidak", answeredAt: "2025-10-13T11:17:00Z" },
            { questionId: "q3", value: ["Loading Lambat"], answeredAt: "2025-10-13T11:18:00Z" },
        ],
    },
    {
        respondent: {
            name: "Farah Lestari",
            email: "farah.lestari@example.com",
            submittedAt: "2025-10-14T09:00:00Z",
        },
        answers: [
            { questionId: "q1", value: "Puas", answeredAt: "2025-10-14T09:01:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-14T09:02:00Z" },
            { questionId: "q3", value: ["Fitur", "Desain"], answeredAt: "2025-10-14T09:03:00Z" },
        ],
    },
    {
        respondent: {
            name: "Gilang Aditya",
            email: "gilang.aditya@example.com",
            submittedAt: "2025-10-14T15:42:00Z",
        },
        answers: [
            { questionId: "q1", value: "Netral", answeredAt: "2025-10-14T15:43:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-14T15:44:00Z" },
            { questionId: "q3", value: ["Aksesibilitas"], answeredAt: "2025-10-14T15:45:00Z" },
        ],
    },
    {
        respondent: {
            name: "Hana Putri",
            email: "hana.putri@example.com",
            submittedAt: "2025-10-15T07:18:00Z",
        },
        answers: [
            { questionId: "q1", value: "Sangat Puas", answeredAt: "2025-10-15T07:19:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-15T07:20:00Z" },
            { questionId: "q3", value: ["Kecepatan", "Konsistensi"], answeredAt: "2025-10-15T07:21:00Z" },
        ],
    },
    {
        respondent: {
            name: "Indra Wijaya",
            email: "indra.wijaya@example.com",
            submittedAt: "2025-10-15T12:25:00Z",
        },
        answers: [
            { questionId: "q1", value: "Puas", answeredAt: "2025-10-15T12:26:00Z" },
            { questionId: "q2", value: "Tidak", answeredAt: "2025-10-15T12:27:00Z" },
            { questionId: "q3", value: ["Navigasi", "UI"], answeredAt: "2025-10-15T12:28:00Z" },
        ],
    },
    {
        respondent: {
            name: "Joko Rahman",
            email: "joko.rahman@example.com",
            submittedAt: "2025-10-16T10:10:00Z",
        },
        answers: [
            { questionId: "q1", value: "Sangat Puas", answeredAt: "2025-10-16T10:11:00Z" },
            { questionId: "q2", value: "Ya", answeredAt: "2025-10-16T10:12:00Z" },
            { questionId: "q3", value: ["Kemudahan Penggunaan"], answeredAt: "2025-10-16T10:13:00Z" },
        ],
    },
];  