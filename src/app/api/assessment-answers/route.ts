import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// POST assessment answers
export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { assessmentId, answers } = body;

      if (!assessmentId || !answers) {
        return Response.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Verify assessment exists and belongs to user
      const assessment = await prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          userId: user.id
        }
      });

      if (!assessment) {
        return Response.json(
          { success: false, error: 'Assessment not found' },
          { status: 404 }
        );
      }

      // Get questions to calculate correctness
      const assessmentQuestions = await prisma.assessmentQuestion.findMany({
        where: { assessmentId },
        include: { question: true }
      });

      // Update assessment questions with user answers and correctness
      const assessmentAnswers = await Promise.all(
        answers.map((answer: { questionId: string; answer: any }) => {
          const assessmentQuestion = assessmentQuestions.find(aq => aq.questionId === answer.questionId);
          const isCorrect = assessmentQuestion ? checkAnswer(assessmentQuestion.question, answer.answer) : false;
          
          return prisma.assessmentQuestion.updateMany({
            where: {
              assessmentId,
              questionId: answer.questionId
            },
            data: {
              userAnswer: answer.answer,
              isCorrect
            }
          });
        })
      );

      // Update assessment status to completed
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: 'COMPLETED' }
      });

      return Response.json({
        success: true,
        data: assessmentAnswers
      });
    } catch (error) {
      console.error('Error saving assessment answers:', error);
      return Response.json(
        { success: false, error: 'Failed to save assessment answers' },
        { status: 500 }
      );
    }
  })(req);
}

// Helper function to check if answer is correct
function checkAnswer(question: any, userAnswer: any): boolean {
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
}
