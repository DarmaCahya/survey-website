'use client';

import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { questions } from '@/data/question';

export default function Survey() {
    const handleSubmit = () => {
        console.log("Form submitted");
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-[#fbfbfc]">
            <div className='max-w-3xl mx-auto'>
                <Button 
                    className='gap-4 mb-8'
                    asChild
                    variant="secondary"   
                    size="lg" 
                >
                    <Link href="/">
                        <ArrowLeft className="h-16 w-16 text-black" />
                        Kembali
                    </Link> 
                </Button>

                <div className='flex flex-col items-center text-center gap-4 mb-12'>
                    <h1 className="font-bold text-5xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Kuesioner Kepuasan
                    </h1>
                    <p className="text-lg text-gray-400">Silakan jawab semua pertanyaan berikut dengan lengkap</p>
                </div>

                <form onClick={handleSubmit} className="space-y-6">
                    {questions.map((question) => (
                        <div key={question.id} className="flex flex-col gap-4 bg-white p-8 rounded-lg border border-black/10">
                            <label className="text-xl font-normal text-gray-800">
                                {question.text}
                                {question.required && <span className="text-red-500"> *</span>}
                            </label>

                            {question.type === "short" && (
                                <input 
                                    type="text"
                                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                                    placeholder={question.placeholder}
                                    required={question.required}
                                />
                            )}
                            {question.type === "long" && (
                                <textarea 
                                className="max-w-lg border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                                placeholder={question.placeholder}
                                rows={1}
                                required={question.required}
                                ></textarea>
                            )}  
                            {question.type === "email" &&(
                                <input 
                                    type="email"
                                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                                    placeholder={question.placeholder}
                                    required={question.required}
                                />
                            )}
                            {question.type === "number" &&(
                                <input 
                                    type="number"
                                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800 placeholder-gray-400"
                                    placeholder={question.placeholder}
                                    required={question.required}
                                />
                            )}
                            {question.type === "dropdown" && question.options && (
                                <select 
                                    defaultValue=""
                                    className="max-w-70 border-b-2 border-gray-300 focus:border-purple-500 outline-none p-2 w-full transition-colors duration-200 text-gray-800"
                                    required={question.required}
                                >
                                    <option value="" disabled>
                                        {question.placeholder || "Pilih salah satu"}
                                    </option>
                                    {question.options.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {question.type === "radio" && question.options && (
                                <div className="flex flex-col gap-2">
                                    {question.options.map((option, index) => (
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
                                    {question.options.map((option, index) => (
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
                    ))}
                    <div className='flex justify-center mt-8'>
                        <Button 
                            variant="secondary"   
                            size="lg"        
                            type='submit'     
                            className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-lg p-6 text-white"
                        >
                            <Send className="h-6 w-6" />
                            Kirim Kuesioner
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}