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
        
            {question.type === "long" && (
                <textarea
                    name={question.id}
                    className="max-w-2xl border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    placeholder={question.placeholder}
                    rows={1}
                    required={question.required}
                />
            )}
        
            {question.type === "email" && (
                <input
                    type="email"
                    name={question.id}
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    placeholder={question.placeholder}
                    required={question.required}
                />
            )}
        
            {question.type === "number" && (
                <input
                    type="number"
                    name={question.id}
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    placeholder={question.placeholder}
                    required={question.required}
                />
            )}
        
            {question.type === "dropdown" && question.options && (
                <select
                    name={question.id}
                    defaultValue=""
                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800"
                    required={question.required}
                >
                    <option value="" disabled>
                        {question.placeholder || "Pilih salah satu"}
                    </option>
                    {question.options.map((option: string, index: number) => (
                        <option key={index} value={option}>
                        {option}
                        </option>
                    ))}
                </select>
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
        
            {question.type === "checkbox" && question.options && (
                <div className="flex flex-col gap-2">
                    {question.options.map((option: string, index: number) => (
                        <label key={index} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name={question.id}
                                value={option}
                                className="form-checkbox"
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