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
};

export default function QuestionForm({
    topic,
    description,
    questions,
    initialAnswers = {},
    onSubmit,
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
                {questions.map((q) => {
                    let isVisible = true;

                    if (q.dependencyId) {
                        const parentAnswer = answers[q.dependencyId];
                        if (parentAnswer !== q.dependencyValue) {
                            isVisible = false;
                        }
                    }

                    if (!isVisible) return null;

                    const effectiveQuestion = {
                        ...q,
                        required: q.required || (!!q.dependencyId && !!answers[q.dependencyId]),
                    };

                    return (
                        <QuestionItem
                            key={q.id}
                            question={effectiveQuestion}
                            value={answers[q.id] || ""}
                            onChange={(val) => handleChange(q.id, val)}
                        />
                    );
                })}

                <Button type="submit" className="mt-4 bg-purple-600 text-white hover:bg-purple-700">
                    Kirim
                </Button>
            </div>  
        </form>
    );
}