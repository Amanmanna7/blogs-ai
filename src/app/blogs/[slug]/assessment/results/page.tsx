'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  options: any;
  correctAnswers: any;
  explanation: string;
  type: string;
}

interface AssessmentQuestion {
  id: string;
  sequence: number;
  userAnswer: any;
  question: Question;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  level: string;
  totalQuestions: number;
  status: string;
  assessmentQuestions: AssessmentQuestion[];
  blog: {
    id: string;
    title: string;
    slug: string;
  };
  chapterTopic: {
    id: string;
  };
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchAssessmentResults();
  }, [slug]);

  const fetchAssessmentResults = async () => {
    try {
      const response = await fetch(`/api/assessments/results?blogSlug=${slug}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setAssessment(data.data);
        calculateScore(data.data);
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (assessment: Assessment) => {
    let correctCount = 0;
    const questionResults = assessment.assessmentQuestions.map((assessmentQuestion) => {
      const isCorrect = checkAnswer(assessmentQuestion.question, assessmentQuestion.userAnswer);
      if (isCorrect) correctCount++;
      
      return {
        question: assessmentQuestion.question,
        userAnswer: assessmentQuestion.userAnswer,
        correctAnswer: assessmentQuestion.question.correctAnswers,
        isCorrect,
        explanation: assessmentQuestion.question.explanation
      };
    });

    setScore(correctCount);
    setResults(questionResults);
  };

  const checkAnswer = (question: Question, userAnswer: any) => {
    if (question.type === 'TRUE_FALSE' || question.type === 'MCQ_SINGLE' || question.type === 'FILL_BLANK') {
      return userAnswer === question.correctAnswers;
    } else if (question.type === 'MCQ_MULTIPLE') {
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswers)) {
        return false;
      }
      return userAnswer.length === question.correctAnswers.length &&
             userAnswer.every(answer => question.correctAnswers.includes(answer));
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
          <p className="text-gray-600 mb-6">The assessment results you're looking for don't exist.</p>
          <a href={`/blogs/${slug}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </a>
        </div>
      </div>
    );
  }
  const percentage = Math.round((score / assessment.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
            <p className="text-gray-600">{assessment.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">{percentage}%</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              You scored {score} out of {assessment.totalQuestions}
            </h2>
            <p className="text-gray-600">
              {percentage >= 80 ? 'Excellent work!' : 
               percentage >= 60 ? 'Good job!' : 
               'Keep studying to improve!'}
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Question Review</h3>
          
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900 mr-3">
                      Question {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-900 mb-4">{result.question.text}</p>
                </div>
              </div>

              {/* Question Options */}
              {result.question.type === 'TRUE_FALSE' && (
                <div className="space-y-2 mb-4">
                  {['True', 'False'].map((option) => (
                    <div
                      key={option}
                      className={`p-3 rounded-lg border-2 ${
                        option === result.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : option === result.userAnswer && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {option === result.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {option === result.userAnswer && !result.isCorrect && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'MCQ_SINGLE' && (
                <div className="space-y-2 mb-4">
                  {Object.entries(result.question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 ${
                        key === result.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : key === result.userAnswer && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                      <span>{value as string}</span>
                      {key === result.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {key === result.userAnswer && !result.isCorrect && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'MCQ_MULTIPLE' && (
                <div className="space-y-2 mb-4">
                  {Object.entries(result.question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 ${
                        result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key)
                          ? 'border-green-500 bg-green-50'
                          : (result.userAnswer || []).includes(key) && !result.isCorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                      <span>{value as string}</span>
                      {result.correctAnswer && Array.isArray(result.correctAnswer) && result.correctAnswer.includes(key) && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {(result.userAnswer || []).includes(key) && !result.correctAnswer.includes(key) && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.question.type === 'FILL_BLANK' && (
                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                    <span className="font-medium text-green-800">Correct Answer: </span>
                    <span className="text-green-900">{result.correctAnswer}</span>
                  </div>
                  {result.userAnswer && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                      <span className="font-medium text-red-800">Your Answer: </span>
                      <span className="text-red-900">{result.userAnswer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800">{result.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Blog Button */}
        <div className="mt-8 text-center">
          <a
            href={`/blogs/${slug}${assessment?.chapterTopic?.id ? `?chapter=${assessment.chapterTopic.id}` : ''}`}
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    </div>
  );
}
