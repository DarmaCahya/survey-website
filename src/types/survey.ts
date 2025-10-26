import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Submission } from "@/types/form";

type QuestionType = "short" | "long" | "radio" | "checkbox" | "email" | "dropdown" | "number" | "slider";

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    placeholder: string;
    required: boolean;
    options?: string[];
    description?: string;
}

export type Answers = {
  [questionId: string]: string | number;
};

export interface AnswerDetail {
    questionId: string;
    value: string | string[];
    answeredAt?: string;
}
  
export interface SurveyResponse {
    respondent: {
        name: string;
        email: string;
        submittedAt: string;
    };
  
    answers: AnswerDetail[];
}

export interface QuestionFieldProps {
    question: Question;
    index: number;
    register: UseFormRegister<Submission>;
    control: Control<Submission>;
    errors?: FieldErrors<Submission>;
}

export interface AnswerData {
    name: string;
    email: string;
    business_name: string;
    sector: string;
    data_type: string;
    understand_data_type: "Mengerti" | "Tidak Mengerti";
    biaya_pengetahuan: number;
    pengaruh_kerugian: number;
    frekuensi_serangan: number;
    pemulihan: number;
    pemahaman_poin: "Mengerti" | "Tidak Mengerti";
    pemahaman_tidak_mengerti?: string; 
    penjelasan_tidak_dipahami?: string; 
}  

export type responsesData = {
    name: string;
    email: string;
    answers: AnswerData;
    createdAt: string;
}