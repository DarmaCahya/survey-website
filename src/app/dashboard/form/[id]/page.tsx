"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { generateQuestions } from "@/data/generateQuestions";
import QuestionForm from "@/components/form/QuestionForm";
import { Answers } from "@/types/survey";
import { useThreatsByFormId } from "@/hooks/forms/useThreatsByFormId";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { makeSubmission } from "@/services/FormService";
import toast from 'react-hot-toast';
import RiskModal from "@/components/form/RiskModal";
import RiskSummary from "@/components/form/RiskSummary";

export default function SurveyPage() {
    const params = useParams();
    const id = params?.id as string;

    const [topics, setTopics] = useState<string[]>([]);
    const [description, setDescription] = useState<string[]>([]);
    const [threatIds, setThreatIds] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<{ [topic: string]: Answers }>({});
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { Threats, loading, error } = useThreatsByFormId(id);
    const completedForm = Threats?.summary.total === Threats?.summary.completed && Threats?.summary.notStarted === 0;

    useEffect(() => {
        if (!loading && Threats && Array.isArray(Threats.threats)) {
            const topicNames = Threats.threats.map((t) => t.name);
            const descriptions = Threats.threats.map((t) => t.description || "");
            const threatIds = Threats.threats.map((t) => t.id);
            setTopics(topicNames);
            setDescription(descriptions);
            setThreatIds(threatIds); 
        }
    }, [loading, Threats]);

    const handleTopicSubmit = async (data: Answers) => {
        const topic = topics[currentIndex];
        const updatedAnswers = { ...allAnswers, [topic]: data };
        setAllAnswers(updatedAnswers);

        if (currentIndex < topics.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            const payload = {
                assetId: Number(id),
                threats: threatIds.map((threatId, index) => {
                    const tName = topics[index];
                    const ans = updatedAnswers[tName];

                    return {
                        threatId: Number(threatId),
                        biaya_pengetahuan: Number(ans[`${threatId}_biaya_pengetahuan`]),
                        pengaruh_kerugian: Number(ans[`${threatId}_pengaruh_kerugian`]),
                        Frekuensi_serangan: Number(ans[`${threatId}_frekuensi_serangan`]),
                        Pemulihan: Number(ans[`${threatId}_pemulihan`]),
                        mengerti_poin: ans[`${threatId}_pemahaman_poin`] === "Mengerti",
                        tidak_mengerti: String(ans[`${threatId}_tidak_mengerti`] ?? ""),
                        tidak_mengerti_description: String(ans[`${threatId}_tidak_mengerti_description`] ?? ""),
                    };
                }),
            };

            setIsSubmitting(true); 

            try {
                await makeSubmission(payload);
                toast.success("Survey selesai! Data berhasil dikirim.");
                setIsModalOpen(true);
            } catch (err) {
                console.error(err);
                toast.error("Gagal mengirim survey.");
            } finally {
                setIsSubmitting(false);
            }

        }
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    if (loading || topics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spinner className="w-12 h-12 text-purple-600 mb-4" />
                <p className="text-gray-500 text-lg animate-pulse">Loading survey...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg font-medium">Error loading survey!</p>
            </div>
        );
    }

    const threatId = threatIds[currentIndex];
    const topic = topics[currentIndex];
    const questions = generateQuestions(threatId);

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

                {!completedForm && (
                    <span className="text-sm text-gray-600">
                        Page {currentIndex + 1} dari {topics.length}
                    </span>
                )}

            </div>
            <div className="mb-2 mx-4">
                <h2 className="text-2xl font-bold text-purple-600">
                    {Threats?.asset?.name}
                </h2>
                <p className="text-base font-normal text-justify break-words text-black">
                    {Threats?.asset?.description}
                </p>
            </div>
            
            {completedForm && Threats?.threats.length > 0 ? (
                <RiskSummary submissions={Threats.threats.map(t => t.submission)} />
            ) : (
                <div className="relative">
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

                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
                            <Spinner className="w-12 h-12 text-purple-600" />
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <RiskModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    submissions={Threats?.threats.map(t => t.submission) || []}
                />
            )}

        </div>
    );
}