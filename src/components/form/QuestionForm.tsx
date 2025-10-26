import { useState } from "react";
import { Question, Answers } from "@/types/survey";
import QuestionItem from "./QuestionItem";

type Props = {
  topic: string;
  questions: Question[];
  initialAnswers?: Answers;
  onSubmit: (answers: Answers) => void;
};

export default function QuestionForm({ topic, questions, initialAnswers = {}, onSubmit }: Props) {
    const [answers, setAnswers] = useState<Answers>(initialAnswers);

    const handleChange = (id: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(answers);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Topik: {topic}</h2>
        {questions.map((q) => (
            <QuestionItem key={q.id} question={q} value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </form>
    );
}