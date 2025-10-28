import { Question } from "@/types/survey";
import { useNextStep } from "nextstepjs";
import React from "react";

type Props = {
    question: Question;
    value: string | number;
    onChange: (value: string | number) => void;
};

export default function QuestionItem({ question, value, onChange }: Props) {
    const { startNextStep } = useNextStep();

    React.useEffect(() => {
        startNextStep("formTour");
    }, [startNextStep]);
    
    return (
        <div className="flex flex-col gap-4 bg-white p-6 xl:p-8 rounded-lg border border-black/10 shadow-sm">
            <div id="form-description" >
                <label className="text-lg xl:text-xl font-normal text-gray-800">
                    {question.text}
                    {question.required ? (
                        <span className="text-red-500"> *</span>
                    ) : (
                        <span className="text-gray-400 text-sm italic"> (optional)</span>
                    )}
                </label>
                {question.description && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{question.description}</p>
                )}
            </div>

            {question.type === "short" && (
                <input
                    type="text"
                    name={question.id}
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    required={question.required}
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400 transition-all duration-200"
                />
            )}

            {question.type === "slider" && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                        {question.options?.map((option, index) => (
                            <span key={index}>{option}</span>
                        ))}                    
                    </div>

                    <div className="flex justify-between items-center">
                        {(question.optionsNumbers || [1, 2, 3, 4, 5, 6]).map((num) => (
                            <label key={num} className="flex flex-col items-center cursor-pointer">
                            <input
                                type="radio"
                                name={question.id}
                                value={num}
                                checked={value === String(num)}
                                onChange={(e) => onChange(e.target.value)}
                                required={question.required}
                                className="appearance-none h-5 w-5 rounded-full border-2 border-purple-500 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                            />
                            <span className="text-xs mt-1">{num}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {question.type === "radio" && question.options && (
                <div className="flex flex-col gap-2">
                    {question.options.map((opt) => (
                        <label
                        key={opt}
                        className="flex items-center gap-2 text-gray-700 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name={question.id}
                                value={opt}
                                checked={value === opt}
                                onChange={(e) => onChange(e.target.value)}
                                className="form-radio text-purple-600 focus:ring-purple-500"
                                required={question.required}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}

            {question.type === "dropdown" && question.options && (
                <select
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 bg-white transition-all duration-200"
                    required={question.required}
                >
                    <option value="">Pilih</option>
                    {question.options.map((opt) => (
                        <option key={opt} value={opt}>
                        {opt}
                        </option>
                    ))}
                </select>
            )}

            {question.type === "long" && (
                <textarea
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder}
                    rows={1}
                    required={question.required}
                    className="max-w-2xl border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400 transition-all duration-200"
                />
            )}
        </div>
    );
}