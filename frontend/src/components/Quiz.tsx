'use client';

import { useState } from 'react';

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

export interface QuizAnswers {
  experience: string;
  education: string;
  categories: string[];
  noPhone: boolean;
  salaryMin: number;
}

const QUESTIONS = [
  {
    id: 'noPhone',
    question: 'Do you prefer jobs without phone calls?',
    subtitle: 'This is our specialty! We filter for chat/email-only positions.',
    options: [
      { value: 'yes', label: 'Yes, no phone please!', emoji: '📵', highlight: true },
      { value: 'no', label: 'Phone calls are fine', emoji: '📞', highlight: false },
    ],
  },
  {
    id: 'categories',
    question: 'What type of work interests you?',
    subtitle: 'Select all that apply',
    multiple: true,
    options: [
      { value: 'support', label: 'Customer Support', emoji: '💬' },
      { value: 'data-entry', label: 'Data Entry', emoji: '📊' },
      { value: 'va', label: 'Virtual Assistant', emoji: '📋' },
      { value: 'writing', label: 'Writing/Content', emoji: '✍️' },
      { value: 'moderation', label: 'Content Moderation', emoji: '🛡️' },
      { value: 'dev', label: 'Development', emoji: '💻' },
      { value: 'design', label: 'Design', emoji: '🎨' },
      { value: 'marketing', label: 'Marketing', emoji: '📈' },
    ],
  },
  {
    id: 'experience',
    question: 'How many years of work experience do you have?',
    subtitle: 'Any field counts, not just remote work',
    options: [
      { value: '0-1', label: 'Less than 1 year', emoji: '🌱' },
      { value: '1-3', label: '1-3 years', emoji: '🌿' },
      { value: '3-5', label: '3-5 years', emoji: '🌳' },
      { value: '5+', label: '5+ years', emoji: '🏆' },
    ],
  },
  {
    id: 'salary',
    question: 'What is your minimum salary expectation?',
    subtitle: 'Annual USD equivalent',
    options: [
      { value: '20000', label: '$20,000+', emoji: '💵' },
      { value: '30000', label: '$30,000+', emoji: '💰' },
      { value: '40000', label: '$40,000+', emoji: '💰' },
      { value: '50000', label: '$50,000+', emoji: '🤑' },
      { value: '70000', label: '$70,000+', emoji: '🤑' },
    ],
  },
];

export default function Quiz({ onComplete }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    categories: [],
  });
  
  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  
  const handleSelect = (value: string) => {
    if (question.id === 'categories') {
      // Multiple selection
      const current = answers.categories || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, categories: updated });
    } else {
      setAnswers({ ...answers, [question.id]: value });
      
      // Auto advance for single selection (with slight delay for UX)
      if (currentStep < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 400);
      }
    }
  };
  
  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Quiz complete
      onComplete({
        experience: answers.experience || '0-1',
        education: answers.education || 'any',
        categories: answers.categories,
        noPhone: answers.noPhone === 'yes',
        salaryMin: parseInt(answers.salary) || 0,
      });
    }
  };
  
  const canProceed = question.id === 'categories' 
    ? answers.categories?.length > 0
    : answers[question.id];

  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-pink-500 mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Find Your Perfect Job</h1>
        <p className="text-text-secondary">Answer a few questions to get personalized results</p>
      </div>
      
      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm text-text-muted mb-2">
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-bg rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question Card */}
      <div className="card p-8 mb-6 animate-fadeIn" key={currentStep}>
        <h2 className="text-2xl font-bold text-text mb-2">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-text-secondary mb-6">{question.subtitle}</p>
        )}
        
        {/* Options */}
        <div className={`grid gap-3 ${question.multiple ? 'grid-cols-2' : ''}`}>
          {question.options.map((option) => {
            const isSelected = question.id === 'categories'
              ? answers.categories?.includes(option.value)
              : answers[question.id] === option.value;
            
            const isHighlight = 'highlight' in option && option.highlight;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  group p-4 text-left rounded-xl border-2 transition-all
                  ${isSelected
                    ? isHighlight
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-bg'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl
                    ${isSelected 
                      ? isHighlight ? 'bg-secondary/20' : 'bg-primary/20'
                      : 'bg-bg group-hover:bg-primary/10'
                    }
                  `}>
                    {option.emoji}
                  </span>
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-lg">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        
        {(question.multiple || isLastQuestion) && (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              px-8 py-3 font-semibold rounded-xl transition-all
              ${canProceed
                ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-border text-text-muted cursor-not-allowed'
              }
            `}
          >
            {isLastQuestion ? (
              <span className="flex items-center gap-2">
                Find My Jobs
                <span>🎯</span>
              </span>
            ) : (
              'Continue →'
            )}
          </button>
        )}
      </div>
      
      {/* Skip hint */}
      {!question.multiple && !isLastQuestion && (
        <p className="text-center text-text-muted text-sm mt-6">
          Select an option to continue
        </p>
      )}
    </div>
  );
}
