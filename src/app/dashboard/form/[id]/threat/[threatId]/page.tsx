"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { useQueryClient } from "@tanstack/react-query";
import { useNextStep } from "nextstepjs";
import React from "react";

import QuestionForm from "@/components/form/QuestionForm";
import { Answers, Question } from "@/types/survey";
import { useThreatsByFormId } from "@/hooks/forms/useThreatsByFormId";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { makeSubmission } from "@/services/FormService";
import RiskSummary from "@/components/form/RiskSummary";
import { generateQuestions } from "@/data/generateQuestions";
import { threatSchema } from "@/validations/form/schema";
import { ThreatPayload } from "@/types/form";

export default function ThreatFormPage() {
    const { startNextStep } = useNextStep();
    const [questionForm, setQuestionForm] = useState<Question[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const params = useParams();
    const id = params?.id as string;
    const threatId = params?.threatId as string; 

    const { Threats, loading, refetch } = useThreatsByFormId(id);
    
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(threatSchema),
        defaultValues: {
            biaya_pengetahuan: 0,
            pengaruh_kerugian: 0,
            frekuensi_serangan: 0,
            pemulihan: 0,
            mengerti_poin: true,
            tidak_mengerti: "",
            tidak_mengerti_description: "",
        },
    });

    React.useEffect(() => {
        startNextStep("formTour");
    }, [startNextStep]);
    
    useEffect(() => {
        if (!loading && Threats?.asset) {
            const threat = Threats.threats.find((t) => t.id === threatId);
            const threatItem = threat ? threat.name : ""; 
            const dynamicOptions = [
                Threats.asset["title-data"],
                threatItem,
            ];

            setQuestionForm(generateQuestions(dynamicOptions));
        }
    }, [loading, Threats]);
    
    const onSubmit = async (answers: Answers) => {
        console.log(answers);
        try {
            setIsSubmitting(true);
            
            const payload: ThreatPayload = {
                biaya_pengetahuan: Number(answers.biaya_pengetahuan),
                pengaruh_kerugian: Number(answers.pengaruh_kerugian),
                Frekuensi_serangan: Number(answers.frekuensi_serangan),
                Pemulihan: Number(answers.pemulihan),
                mengerti_poin: true,
                Tidak_mengerti_poin: String(answers.pemahaman_tidak_mengerti),
                description_tidak_mengerti: String(answers.penjelasan_tidak_dipahami),
            };

            await makeSubmission(payload, id, threatId);
            toast.success("Formulir berhasil dikirim!");

            refetch();
            reset();
        } catch (err: any) {
            console.error(err);
        toast.error("Terjadi kesalahan saat mengirim data.");
        }
    };

    const currentThreat = Threats?.threats?.find((t) => t.id === threatId);
    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-2xl p-4 md:p-10 my-10">
            <div className="mb-4 flex items-center justify-between mx-4 py-2">
                <Link href={`/dashboard/form/${id}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm md:text-base font-normal border-gray-300 hover:bg-gray-100 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar
                    </Button>
                </Link>
            </div>

            <div className="mb-2 mx-4">
                <h2 className="text-2xl font-bold text-purple-600">
                    {Threats?.asset?.name}
                </h2>
                <p className="text-base font-normal text-justify text-black">
                    {Threats?.asset?.description}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                <Spinner className="w-8 h-8 text-purple-600" />
                </div>
            ) : (
                <QuestionForm
                    topic={currentThreat?.title-data || ""}
                    description={currentThreat?.description || ""}
                    questions={questionForm}
                    onSubmit={onSubmit}
                />
            )}
        </div>
    )
}