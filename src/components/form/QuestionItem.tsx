import { Question } from "@/types/survey";

type Props = {
  question: Question;
  value: string | number;
  onChange: (value: string | number) => void;
};

export default function QuestionItem({ question, value, onChange }: Props) {
    return (
        <div className="mb-6">
        <label className="block font-semibold mb-1">{question.text}</label>
        {question.description && <p className="text-sm text-gray-500 mb-2">{question.description}</p>}

        {question.type === "slider" && (
            <input
            type="range"
            min={1}
            max={6}
            value={value as number || 50}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
            />
        )}

        {question.type === "radio" && question.options && (
            <div className="flex gap-4">
            {question.options.map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                <input
                    type="radio"
                    name={question.id}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => onChange(e.target.value)}
                />
                {opt}
                </label>
            ))}
            </div>
        )}

        {question.type === "dropdown" && question.options && (
            <select value={value as string || ""} onChange={(e) => onChange(e.target.value)} className="border p-1">
            <option value="">Pilih</option>
            {question.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
            </select>
        )}

        {question.type === "long" && (
            <textarea
            value={value as string || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full border p-2"
            />
        )}
        </div>
    );
}