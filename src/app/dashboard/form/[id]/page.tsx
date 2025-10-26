"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { generateQuestions } from "@/data/generateQuestions";
import QuestionForm from "@/components/form/QuestionForm";
import { Answers } from "@/types/survey";
import { useThreatsByFormId } from "@/hooks/forms/useThreatsByFormId";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SurveyPage() {
    const params = useParams();
    const id = params?.id as string;

    const [topics, setTopics] = useState<string[]>([]);
    const [description, setDescription] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<{ [topic: string]: Answers }>({});

    const { threats, loading, error } = useThreatsByFormId(id);

    useEffect(() => {
        if (!loading && threats) {
            const topicNames = threats.map((t: any) => t.name);
            const description = threats.map((t: any) => t.description );
            setTopics(topicNames);
            setDescription(description);
        }
    }, [loading, threats]);

    const handleTopicSubmit = (data: Answers) => {
        const topic = topics[currentIndex];

        setAllAnswers((prev) => ({ ...prev, [topic]: data }));

        if (currentIndex < topics.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            console.log("Survey selesai ✅", { ...allAnswers, [topic]: data });
            alert("Survey selesai! Cek console untuk hasilnya.");
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    if (loading || topics.length === 0) return <p>Loading survey...</p>;
    if (error) return <p>Error loading survey!</p>;

    const topic = topics[currentIndex];
    const questions = generateQuestions(topic);

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <div className="mb-4 flex items-center justify-between mx-4">
                <Link href="/dashboard">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm md:text-base font-normal border-gray-300 hover:bg-gray-100 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar
                    </Button>
                </Link>

                <span className="text-sm text-gray-600">
                    Page {currentIndex + 1} dari {topics.length}
                </span>
            </div>
            <QuestionForm
                key={topic} 
                description={description[currentIndex]}                 
                topic={topic}
                questions={questions}
                initialAnswers={allAnswers[topic]}
                onSubmit={handleTopicSubmit}
                onBack={handleBack}
                isFirst={currentIndex === 0}
                isLast={currentIndex === topics.length - 1}
            />
        </div>
    );
}
