import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST generate AI feedback for assessment
export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { assessmentId } = await req.json();

      if (!assessmentId) {
        return Response.json(
          { success: false, error: 'Assessment ID is required' },
          { status: 400 }
        );
      }

      // Check if feedback already exists
      const existingFeedback = await prisma.assessmentFeedback.findUnique({
        where: { assessmentId }
      });

      if (existingFeedback) {
        return Response.json({
          success: true,
          data: existingFeedback
        });
      }

      // Fetch assessment with questions and answers
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          assessmentQuestions: {
            include: {
              question: true
            },
            orderBy: { sequence: 'asc' }
          },
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!assessment) {
        return Response.json(
          { success: false, error: 'Assessment not found' },
          { status: 404 }
        );
      }

      // Check if user owns this assessment
      if (assessment.userId !== user.id) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Prepare assessment data for AI
      const assessmentData = {
        title: assessment.title,
        description: assessment.description,
        level: assessment.level,
        totalQuestions: assessment.totalQuestions,
        questions: assessment.assessmentQuestions.map(aq => ({
          question: aq.question.text,
          type: aq.question.type,
          userAnswer: aq.userAnswer,
          correctAnswer: aq.question.correctAnswers,
          explanation: aq.question.explanation,
          isCorrect: aq.isCorrect
        }))
      };

      // Calculate score
      const correctAnswers = assessment.assessmentQuestions.filter(aq => aq.isCorrect).length;
      const score = Math.round((correctAnswers / assessment.totalQuestions) * 100);

      // Generate AI feedback
      const prompt = `
You are an AI tutor providing personalized feedback for a student's assessment. 

Assessment Details:
- Title: ${assessment.title || 'Assessment'}
- Level: ${assessment.level}
- Score: ${correctAnswers}/${assessment.totalQuestions} (${score}%)

Questions and Answers:
${assessmentData.questions.map((q, index) => `
Question ${index + 1}: ${q.question}
Type: ${q.type}
User Answer: ${JSON.stringify(q.userAnswer)}
Correct Answer: ${JSON.stringify(q.correctAnswer)}
Is Correct: ${q.isCorrect}
Explanation: ${q.explanation}
`).join('\n')}

Please provide comprehensive feedback in the following JSON format:
{
  "overall_feedback": "A detailed overall assessment of the student's performance, highlighting strengths and areas for improvement",
  "key_improvement_areas": [
    "Specific area 1 that needs improvement",
    "Specific area 2 that needs improvement",
    "Specific area 3 that needs improvement"
  ],
  "question_level_feedback": [
    "Detailed feedback for question 1",
    "Detailed feedback for question 2",
    "Detailed feedback for question 3"
  ]
}

Make the feedback encouraging but honest, specific, and actionable. Focus on learning and improvement.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational tutor providing personalized feedback to help students improve their learning. Always be encouraging, specific, and actionable in your feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse AI response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (error) {
        // If JSON parsing fails, create a structured response
        parsedResponse = {
          overall_feedback: aiResponse,
          key_improvement_areas: ["Review the questions you got wrong", "Practice more with similar concepts", "Focus on understanding the explanations"],
          question_level_feedback: assessmentData.questions.map((_, index) => `Review question ${index + 1} and understand the explanation provided.`)
        };
      }

      // Create overall summary
      const overallSummary = parsedResponse.overall_feedback || aiResponse;

      // Save feedback to database
      const feedback = await prisma.assessmentFeedback.create({
        data: {
          assessmentId,
          rawResponse: parsedResponse,
          overallSummary
        }
      });

      return Response.json({
        success: true,
        data: feedback
      });

    } catch (error) {
      console.error('Error generating feedback:', error);
      return Response.json(
        { success: false, error: 'Failed to generate feedback' },
        { status: 500 }
      );
    }
  })(req);
}
