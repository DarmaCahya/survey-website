"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { generateQuestions } from "@/data/generateQuestions";
import QuestionForm from "@/components/form/QuestionForm";
import { Answers } from "@/types/survey";
import { useThreatsByFormId } from "@/hooks/forms/useThreatsByFormId";

export default function SurveyPage() {
    const params = useParams();
    const id = params?.id as string;

    const [topics, setTopics] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<{ [topic: string]: Answers }>({});

    const { threats, loading, error } = useThreatsByFormId(id);

    useEffect(() => {
        if (!loading && threats) {
            const topicNames = threats.map((t: any) => t.name);
            setTopics(topicNames);
        }
    }, [loading, threats]);

    const { handleSubmit, control, reset } = useForm<Answers>({
        defaultValues: allAnswers[topics[currentIndex]] || {},
    });

    const onSubmit = (data: Answers) => {
        const topic = topics[currentIndex];
        console.log("topic", topic);
        setAllAnswers((prev) => ({ ...prev, [topic]: data }));
        console.log("All Answer", allAnswers)
        if (currentIndex < topics.length - 1) {
            setCurrentIndex((i) => i + 1);
            reset(allAnswers[topics[currentIndex + 1]] || {}); // reset form untuk page berikut
        } else {
            console.log("Survey selesai:", { ...allAnswers, [topic]: data });
            alert("Survey selesai! Lihat console untuk jawaban");
        }
    };

    if (loading || topics.length === 0) return <p>Loading survey...</p>;
    if (error) return <p>Error loading survey!</p>;

    const topic = topics[currentIndex];
    const questions = generateQuestions(topic);

    return (
        <div className="max-w-xl mx-auto mt-10">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h2 className="text-xl font-bold mb-4">{topic}</h2>
                {questions.map((q) => (
                    <div key={q.id} className="mb-4">
                        <label className="block mb-1">{q.text}</label>
                        <Controller
                            name={q.id}
                            control={control}
                            rules={{ required: q.required }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder={q.placeholder}
                                    className="border p-2 w-full"
                                />
                            )}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {currentIndex < topics.length - 1 ? "Next" : "Submit"}
                </button>
            </form>
            <p className="text-gray-500 mt-2">
                Page {currentIndex + 1} dari {topics.length}
            </p>
        </div>
    );
}
