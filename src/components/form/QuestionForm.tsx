import { useState } from "react";
import { Question, Answers } from "@/types/survey";
import QuestionItem from "./QuestionItem";
import { Button } from "@/components/ui/button";
import { useNextStep } from "nextstepjs";
import React from "react";

type Props = {
    topic: string;
    description: string;
    questions: Question[];
    initialAnswers?: Answers;
    onSubmit: (answers: Answers) => void;
    onBack?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
};

export default function QuestionForm({
    topic,
    description,
    questions,
    initialAnswers = {},
    onSubmit,
    onBack,
    isFirst = false,
    isLast = false,
}: Props) {    
    const { startNextStep } = useNextStep();

    React.useEffect(() => {
        startNextStep("formTour");
    }, [startNextStep]);

    const [answers, setAnswers] = useState<Answers>(initialAnswers);

    const handleChange = (id: string, value: string | number) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(answers);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div id="form-header">
                <h2 className="text-xl font-bold text-purple-500">{topic}</h2>
                <p className="text-base font-normal text-justify break-word mb-4">
                    {description}
                </p>
            </div>
            <div className="flex flex-col gap-6">
                {questions.map((q) => (
                    <QuestionItem key={q.id} question={q} value={answers[q.id] || ""} onChange={(val) => handleChange(q.id, val)} />
                ))}
            </div>
            <div id="form-navigation" className="flex justify-center gap-4 mt-6">
                {!isFirst && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                    >
                        Back
                    </Button>
                )}

                <Button 
                    type="submit" 
                    id={isLast ? "submit-button" : ""} 
                    className={`${isLast ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} px-10`}
                >
                    {isLast ? "Submit" : "Next"}
                </Button>
            </div>        
        </form>
    );
}