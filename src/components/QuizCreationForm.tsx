'use client';

import { useState } from 'react';
import QuizLimitValidator from './QuizLimitValidator';
import useQuizLimits from '@/hooks/useQuizLimits';

interface QuizCreationFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function QuizCreationForm({ onSubmit, onCancel }: QuizCreationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'EASY',
    allowedTypes: ['MCQ_SINGLE'],
    totalQuestions: 3,
    blogId: '',
    chapterTopicId: '',
    courseId: ''
  });

  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [limitData, setLimitData] = useState<any>(null);

  const { checkLimits, loading, error } = useQuizLimits();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'allowedTypes' ? [value] : value
    }));

    // Check limits when totalQuestions changes
    if (name === 'totalQuestions') {
      const questions = parseInt(value) || 3;
      checkLimits(questions);
    }
  };

  const handleValidationChange = (valid: boolean, errors: string[]) => {
    setIsValid(valid);
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      alert('Please resolve the validation errors before submitting.');
      return;
    }

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSubmit(result.data);
      } else {
        alert(result.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz description"
            />
          </div>
        </div>

        {/* Quiz Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="ADVANCE">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="totalQuestions" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="totalQuestions"
              name="totalQuestions"
              value={formData.totalQuestions}
              onChange={handleInputChange}
              min="3"
              max="10"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="allowedTypes" className="block text-sm font-medium text-gray-700">
            Question Type
          </label>
          <select
            id="allowedTypes"
            name="allowedTypes"
            value={formData.allowedTypes[0]}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MCQ_SINGLE">Multiple Choice (Single)</option>
            <option value="MCQ_MULTIPLE">Multiple Choice (Multiple)</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="FILL_BLANK">Fill in the Blank</option>
            <option value="MIXED">Mixed Types</option>
          </select>
        </div>

        {/* Quiz Limits Validation */}
        <QuizLimitValidator
          requestedQuestions={formData.totalQuestions}
          onValidationChange={handleValidationChange}
          onLimitDataChange={setLimitData}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`px-6 py-2 rounded-md font-medium ${
              isValid && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-red-800 font-medium mb-2">Cannot Create Quiz</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
