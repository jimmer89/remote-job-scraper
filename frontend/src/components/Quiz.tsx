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
    id: 'experience',
    question: 'How many years of work experience do you have?',
    options: [
      { value: '0-1', label: '< 1 year' },
      { value: '1-3', label: '1-3 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '5+', label: '5+ years' },
    ],
  },
  {
    id: 'education',
    question: 'What is your highest level of education?',
    options: [
      { value: 'high-school', label: 'High School' },
      { value: 'some-college', label: 'Some College' },
      { value: 'bachelors', label: "Bachelor's Degree" },
      { value: 'masters', label: "Master's or Higher" },
    ],
  },
  {
    id: 'categories',
    question: 'What type of work interests you? (Select all)',
    multiple: true,
    options: [
      { value: 'support', label: '💬 Customer Support' },
      { value: 'data-entry', label: '📊 Data Entry' },
      { value: 'va', label: '📋 Virtual Assistant' },
      { value: 'writing', label: '✍️ Writing/Content' },
      { value: 'moderation', label: '🛡️ Content Moderation' },
      { value: 'dev', label: '💻 Development' },
      { value: 'design', label: '🎨 Design' },
      { value: 'marketing', label: '📈 Marketing' },
    ],
  },
  {
    id: 'noPhone',
    question: 'Do you prefer jobs without phone calls?',
    options: [
      { value: 'yes', label: '📵 Yes, no phone please!' },
      { value: 'no', label: '📞 Phone calls are fine' },
    ],
  },
  {
    id: 'salary',
    question: 'What is your minimum salary expectation? (annual)',
    options: [
      { value: '20000', label: '$20,000+' },
      { value: '30000', label: '$30,000+' },
      { value: '40000', label: '$40,000+' },
      { value: '50000', label: '$50,000+' },
      { value: '70000', label: '$70,000+' },
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
      
      // Auto advance for single selection
      if (currentStep < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 300);
      }
    }
  };
  
  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Quiz complete
      onComplete({
        experience: answers.experience,
        education: answers.education,
        categories: answers.categories,
        noPhone: answers.noPhone === 'yes',
        salaryMin: parseInt(answers.salary) || 0,
      });
    }
  };
  
  const canProceed = question.id === 'categories' 
    ? answers.categories?.length > 0
    : answers[question.id];
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {question.question}
      </h2>
      
      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => {
          const isSelected = question.id === 'categories'
            ? answers.categories?.includes(option.value)
            : answers[question.id] === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 text-gray-600 disabled:opacity-50"
        >
          ← Back
        </button>
        
        {(question.id === 'categories' || currentStep === QUESTIONS.length - 1) && (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Find Jobs →' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
