import { QuestionFieldProps } from "@/types/survey";

export default function QuestionFields({ question, value, onChange }: QuestionFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange?.(question.id, e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const option = e.target.value;
    const current = Array.isArray(value) ? value : [];
    let newValue: string[];

    if (e.target.checked) {
      newValue = [...current, option];
    } else {
      newValue = current.filter((v) => v !== option);
    }

    onChange(question.id, newValue);
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-8 rounded-lg border border-black/10">
      <div>
        <label className="text-xl font-normal text-gray-800">
          {question.text}
          {question.required && <span className="text-red-500"> *</span>}
        </label>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
      </div>

      {question.type === "short" && (
        <input
          type="text"
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400"
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
            {Array.from({ length: 6 }, (_, i) => i + 1).map((num)  => (
              <label key={num} className="flex flex-col items-center cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={num}
                  checked={value === String(num)}
                  onChange={handleChange}
                  className="appearance-none h-5 w-5 rounded-full border-2 border-purple-500 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                />
                <span className="text-xs mt-1">{num}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {question.type === "long" && (
        <textarea
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          className="max-w-2xl border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400"
          placeholder={question.placeholder}
          rows={1}
          required={question.required}
        />
      )}

      {question.type === "email" && (
        <input
          type="email"
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400"
          placeholder={question.placeholder}
          required={question.required}
        />
      )}

      {question.type === "number" && (
        <input
          type="number"
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800 placeholder-gray-400"
          placeholder={question.placeholder}
          required={question.required}
        />
      )}

      {question.type === "dropdown" && question.options && (
        <select
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full text-gray-800"
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
                checked={value === option}
                onChange={handleChange}
                className="form-radio text-purple-600 focus:ring-purple-500"
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
                checked={Array.isArray(value) && value.includes(option)}
                onChange={handleCheckboxChange}
                className="form-checkbox text-purple-600 focus:ring-purple-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
