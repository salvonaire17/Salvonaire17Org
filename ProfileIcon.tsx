
import React, { useState } from 'react';
import { generateSummary, generateQuiz } from '../services/geminiService';
import type { QuizQuestion } from '../types';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const QuizDisplay: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

    const toggleAnswer = (index: number) => {
        setRevealedAnswers(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="space-y-6">
            {quiz.map((item, index) => (
                <div key={index} className="bg-slate-50 p-6 rounded-lg">
                    <p className="font-semibold text-slate-800">{index + 1}. {item.question}</p>
                    <div className="mt-4 space-y-2">
                        {item.options.map((option, optIndex) => {
                            const isRevealed = revealedAnswers[index];
                            const isCorrect = option === item.answer;
                            let optionClass = "block w-full text-left p-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition-colors";
                            if (isRevealed) {
                                if (isCorrect) {
                                    optionClass = "block w-full text-left p-3 rounded-lg border border-green-400 bg-green-100 text-green-800 font-semibold";
                                } else {
                                    optionClass = "block w-full text-left p-3 rounded-lg border border-slate-300 bg-white opacity-70";
                                }
                            }

                            return (
                                <button key={optIndex} className={optionClass} disabled={isRevealed}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-right">
                        <button
                            onClick={() => toggleAnswer(index)}
                            className="text-sm font-semibold text-cyan-700 hover:text-indigo-800"
                        >
                            {revealedAnswers[index] ? 'Hide Answer' : 'Show Answer'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const StudyTools: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | QuizQuestion[] | null>(null);
    const [resultType, setResultType] = useState<'summary' | 'quiz' | null>(null);

    const handleGenerate = async (type: 'summary' | 'quiz') => {
        if (!inputText.trim()) {
            setError('Please paste some text into the input area first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        setResultType(type);

        try {
            if (type === 'summary') {
                const summary = await generateSummary(inputText);
                setResult(summary);
            } else {
                const quizData = await generateQuiz(inputText);
                if (quizData.error) {
                    setError(quizData.error);
                } else if (quizData.quiz) {
                    setResult(quizData.quiz);
                } else {
                    setError("Received an unexpected format for the quiz. Please try again.");
                }
            }
        } catch (e) {
            console.error(e);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h3 className="text-xl font-semibold text-slate-800">AI-Powered Study Aid Generator</h3>
                <p className="text-sm text-slate-500 mt-1">Paste any text content below to generate summaries or practice quizzes instantly.</p>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="mt-6 w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    placeholder="Paste your lecture notes, an article, or any text here..."
                    aria-label="Text input for study aid generation"
                />
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => handleGenerate('summary')}
                        disabled={isLoading}
                        className="w-full md:w-auto flex-1 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        Generate Summary
                    </button>
                    <button
                        onClick={() => handleGenerate('quiz')}
                        disabled={isLoading}
                        className="w-full md:w-auto flex-1 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        Create Practice Quiz
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            
            {isLoading && <LoadingSpinner />}
            
            {result && (
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                    {resultType === 'summary' && typeof result === 'string' && (
                        <>
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Generated Summary</h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
                        </>
                    )}
                    {resultType === 'quiz' && Array.isArray(result) && (
                        <>
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Generated Practice Quiz</h3>
                            <QuizDisplay quiz={result} />
                        </>
                    )}
                </div>
            )}

        </div>
    );
};
