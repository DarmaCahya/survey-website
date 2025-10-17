type QuestionType = "short" | "long" | "radio" | "checkbox" | "email" | "dropdown" | "number";

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    placeholder: string;
    required: boolean;
    options?: string[];
}

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