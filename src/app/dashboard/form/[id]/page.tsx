"use client";

import { useState, useEffect, useMemo } from "react";
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
import RiskSummary from "@/components/form/RiskSummary";
import { useNextStep } from "nextstepjs";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

export default function SurveyPage() {
    const { startNextStep } = useNextStep();
    const queryClient = useQueryClient();
    
    useEffect(() => {
        startNextStep("formTour");
    }, [startNextStep]);

    const params = useParams();
    const id = params?.id as string;

    const [topics, setTopics] = useState<string[]>([]);
    const [description, setDescription] = useState<string[]>([]);
    const [threatIds, setThreatIds] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<{ [topic: string]: Answers }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);

    const { Threats, loading, error, refetch } = useThreatsByFormId(id);
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
                        tidak_mengerti: String(ans[`${threatId}_pemahaman_tidak_mengerti`] ?? ""),
                        tidak_mengerti_description: String(ans[`${threatId}_penjelasan_tidak_dipahami`] ?? ""),
                    };
                }),
            };

            setIsSubmitting(true); 

            try {
                await makeSubmission(payload);
                toast.success("Survey selesai! Data berhasil dikirim.");
                await refetch();
                queryClient.invalidateQueries({ queryKey: ["forms"] }); 
            } catch (err) {
                console.error(err);
                toast.error("Gagal mengirim survey.");
            } finally {
                setIsSubmitting(false);
            }

        }
    };

    const saveDraftToServer = async (updatedAnswers: typeof allAnswers, currentIndex: number) => {
        try {
            const userId = Cookies.get("userId"); 
            if (!userId) {
                console.warn("User ID tidak ditemukan di cookies");
                return;
            }

            await fetch(`/api/form/draft/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": String(userId),
                },
                body: JSON.stringify({ userId, answers: updatedAnswers, currentIndex }),
            });
        } catch (err) {
            console.error("Failed to save draft to server", err);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    useEffect(() => {
        if (Object.keys(allAnswers).length > 0) {
            const timeout = setTimeout(() => {
                saveDraftToServer(allAnswers, currentIndex);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [allAnswers, currentIndex]);

    const getDraftFromServer = async () => {
        try {
            const userId = Cookies.get("userId");
            if (!userId) {
                console.warn("User ID tidak ditemukan di cookies");
                return;
            }

            const response = await fetch(`/api/form/draft/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": String(userId),
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch draft data");
            }

            const data = await response.json();
            if (data.draft.answers) {
                setAllAnswers(data.draft.answers);
                setCurrentIndex(data.currentIndex || 0);
            }
        } catch (err) {
            console.error("Failed to fetch draft", err);
        }
    };

    useEffect(() => {
        getDraftFromServer();
    }, [id]);

    const topic = topics[currentIndex];
    const currentAnswers = useMemo(() => {
        const topic = topics[currentIndex];
        if (!topic) {
            return {}; 
        }
        return allAnswers[topic] || {};
    }, [allAnswers, currentIndex, topics]);

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
    const ThreatName = Threats?.asset.name;
    const threat = Threats?.threats[currentIndex];
    const businessProcessOptions = threat?.business_processes?.map(bp => bp.name) || [];

    const OptionsAnswer = [
        `Jenis Data : ${ThreatName || "Unknown Asset"}`,
        `Jenis Serangan : ${topic || "Unknown Topic"}`,
        `Proses Bisnis : ${(businessProcessOptions && businessProcessOptions.length > 0) 
            ? businessProcessOptions.join(", ") 
            : "Unknown Process"}`
    ]
    const questions = generateQuestions(threatId, OptionsAnswer);

    if (loading || topics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spinner className="w-12 h-12 text-purple-600 mb-4" />
                <p className="text-gray-500 text-lg animate-pulse">Loading survey...</p>
            </div>
        );
    }
    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-2xl p-4 my-10">
            <div className="mb-4 flex items-center justify-between mx-4 py-2">
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
                <p className="text-base font-normal text-justify text-black">
                    {Threats?.asset?.description}
                </p>
            </div>

            <div id="form-header" className="mb-2 mx-4">
                <h2 className="text-xl font-bold text-purple-500">{topic}</h2>
                <p className="text-base font-normal text-justify break-word mb-4">
                    {description[currentIndex]}
                </p>
                {threat?.business_processes?.length ? (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Proses Bisnis Terkait:
                        </h3>
                        <ul className="list-disc list-inside text-gray-600">
                            {threat.business_processes.map((bp, idx) => (
                                <li key={idx}>
                                    <span className="font-medium">{bp.name}:</span> {bp.explanation}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
            
            {completedForm && Threats?.threats.length > 0 ? (
                <RiskSummary submissions={Threats.threats.map(t => t.submission)} />
            ) : (
                <div className="relative" id="form-questions">
                    <QuestionForm
                        key={topic}
                        description={description[currentIndex]}
                        topic={topic}
                        questions={questions}
                        answers={currentAnswers}  
                        onSubmit={handleTopicSubmit}
                        onAnswerChange={(id, value) => {
                            setAllAnswers((prev) => {
                                const updated = {
                                    ...prev,
                                    [topic]: {
                                        ...prev[topic],
                                        [id]: value,
                                    }
                                };
                                return updated;
                            });
                        }}

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

            {/* {isModalOpen && (
                <RiskModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    submissions={Threats?.threats.map(t => t.submission) || []}
                />
            )} */}
        </div>
    );
}