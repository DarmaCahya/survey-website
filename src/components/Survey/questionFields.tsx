import { QuestionFieldProps } from "@/types/survey";

export default function QuestionFields({question}: QuestionFieldProps) {
    return (
        <div className="flex flex-col gap-4 bg-white p-8 rounded-lg border border-black/10">
            <label className="text-xl font-normal text-gray-800">
                {question.text}
                {question.required && <span className="text-red-500"> *</span>}
            </label>
    
            {question.type === "short" && (
                <input
                    type="text"
                    name={question.id}
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    placeholder={question.placeholder}
                    required={question.required}
                />
            )}

            {question.type === "slider" && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{question.options?.[0]}</span>
                        <span>{question.options?.[1]}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        {Array.from({ length: 6 }, (_, i) => (
                            <label key={i} className="flex flex-col items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={i}
                                    className="appearance-none h-5 w-5 rounded-full border-2 border-purple-500 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                                />
                                <span className="text-xs mt-1">{i}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {question.type === "long" && (
                <textarea
                    name={question.id}
                    className="max-w-2xl border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    placeholder={question.placeholder}
                    rows={1}
                    required={question.required}
                />
            )}
        
            {question.type === "radio" && question.options && (
                <div className="flex flex-col gap-2">
                    {question.options.map((option: string, index: number) => (
                        <label key={index} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={question.id}
                                value={option}
                                className="form-radio"
                                required={question.required}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}