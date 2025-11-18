import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { QuestionLevel, QuestionType, AssessmentStatus } from '@prisma/client';
import OpenAI from 'openai';
import { 
  getQuizLimitFromUserPlan, 
  getLimitStartDate, 
  validateQuizCreation 
} from '@/types/quiz-limits';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// GET user assessments
export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const blogId = searchParams.get('blogId');
      const blogSlug = searchParams.get('blogSlug');
      const chapterTopicId = searchParams.get('chapterTopicId');
      const courseId = searchParams.get('courseId');

      const where: any = { userId: user.id };

      if (blogId) where.blogId = blogId;
      if (blogSlug) where.blog = { slug: blogSlug };
      if (chapterTopicId) where.chapterTopicId = chapterTopicId;
      if (courseId) where.courseId = courseId;

      const assessments = await prisma.assessment.findMany({
        where,
        include: {
          assessmentQuestions: {
            include: {
              question: true
            },
            orderBy: { sequence: 'asc' }
          },
          blog: {
            select: { id: true, title: true, slug: true }
          },
          chapterTopic: {
            select: { id: true, name: true }
          },
          course: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return Response.json({
        success: true,
        data: assessments
      });
    } catch (error) {
      console.error('Error fetching assessments:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }
  })(req);
}

// POST/CREATE assessment
export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { 
        title, 
        description, 
        level, 
        allowedTypes, 
        totalQuestions, 
        blogId, 
        chapterTopicId, 
        courseId 
      } = body;

      // Validate input
      if (!level || !allowedTypes || !totalQuestions) {
        return Response.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!Object.values(QuestionLevel).includes(level)) {
        return Response.json(
          { success: false, error: 'Invalid question level' },
          { status: 400 }
        );
      }

      if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
        return Response.json(
          { success: false, error: 'Allowed types must be a non-empty array' },
          { status: 400 }
        );
      }

      if (!allowedTypes.every(type => Object.values(QuestionType).includes(type))) {
        return Response.json(
          { success: false, error: 'Invalid question types' },
          { status: 400 }
        );
      }

      if (totalQuestions < 3 || totalQuestions > 10) {
        return Response.json(
          { success: false, error: 'Total questions must be between 3 and 10' },
          { status: 400 }
        );
      }

      // Check quiz limits before creating assessment
      const userPlan = await prisma.userPlan.findFirst({
        where: { 
          userId: user.id,
          status: 'ACTIVE'
        },
        include: {
          plan: {
            include: {
              features: true
            }
          }
        }
      });

      const userPlanFeatures = userPlan?.plan?.features?.map(f => f.featureSlug) || [];
      const limitConfig = getQuizLimitFromUserPlan(userPlanFeatures);
      const startDate = getLimitStartDate(limitConfig.timePeriod);
      
      // Count existing assessments and questions
      const quizCount = await prisma.assessment.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate
          }
        }
      });
      
      const questionCount = await prisma.assessmentQuestion.count({
        where: {
          assessment: {
            userId: user.id,
            createdAt: {
              gte: startDate
            }
          }
        }
      });
      
      // Validate quiz creation
      const validation = validateQuizCreation(
        quizCount, 
        limitConfig
      );
      
      if (!validation.canCreateQuiz) {
        return Response.json(
          { 
            success: false, 
            error: 'Quiz creation limit exceeded',
            details: validation.errors,
            limits: {
              limitConfig,
              currentUsage: {
                quizCount
              },
              remaining: {
                quizzes: validation.remainingQuizzes
              }
            }
          },
          { status: 403 }
        );
      }

      // Find questions based on criteria
      const questions = await prisma.question.findMany({
        where: {
          level,
          type: { in: allowedTypes },
          status: 'LIVE',
          ...(blogId && { blogId }),
          ...(chapterTopicId && { chapterTopicId }),
          ...(courseId && { courseId })
        },
        orderBy: { createdAt: 'desc' },
        take: totalQuestions
      });

      // Get blog content for AI generation
      let blogContent = '';
      let blogTitle = '';
      let blogSlug = '';

      if (blogId) {
        const blog = await prisma.blog.findUnique({
          where: { id: blogId },
          include: {
            sequences: {
              include: {
                blogContent: true,
                blogMedia: true
              }
            }
          }
        });

        if (blog) {
          blogTitle = blog.title;
          blogSlug = blog.slug;
          
          // Combine blog content and media descriptions
          const contentText = blog.sequences
            ?.map(seq => seq.blogContent?.textContent)
            .filter(Boolean)
            .join(' ') || '';
          const mediaDescriptions = blog.sequences
            ?.map(seq => seq.blogMedia?.description)
            .filter(Boolean)
            .join(' ') || '';
          blogContent = `${contentText} ${mediaDescriptions}`.trim();
        }
      }

      let questionsToUse = questions;
      let questionsNeeded = 0;

      // Check if we need to generate more questions
      if (questions.length < totalQuestions) {
        questionsNeeded = totalQuestions - questions.length;
        
        // Generate questions using OpenAI
        const aiQuestions = await generateQuestionsWithAI({
          level,
          allowedTypes,
          questionsNeeded,
          blogTitle,
          blogContent
        });

        // Create new questions in database
        const createdQuestions = await Promise.all(
          aiQuestions.map(async (questionData) => {
            return await prisma.question.create({
              data: {
                text: questionData.text,
                options: questionData.options,
                correctAnswers: questionData.correctAnswer,
                explanation: questionData.explanation,
                type: questionData.type,
                level,
                status: 'LIVE',
                blogId,
                chapterTopicId,
                courseId
              }
            });
          })
        );

        questionsToUse = [...questions, ...createdQuestions];
      }

      // Create assessment with title based on blog
      const assessmentTitle = blogTitle ? `Assessment for ${blogTitle}` : title;

      // Create assessment with questions
      const assessment = await prisma.assessment.create({
        data: {
          userId: user.id,
          title: assessmentTitle,
          description: description || '',
          level,
          allowedTypes,
          totalQuestions,
          status: AssessmentStatus.ACTIVE,
          blogId,
          chapterTopicId,
          courseId,
          assessmentQuestions: {
            create: questionsToUse.map((question, index) => ({
              questionId: question.id,
              sequence: index + 1
            }))
          }
        },
        include: {
          assessmentQuestions: {
            include: {
              question: true
            },
            orderBy: { sequence: 'asc' }
          },
          blog: {
            select: { id: true, title: true, slug: true }
          }
        }
      });

      return Response.json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      return Response.json(
        { success: false, error: 'Failed to create assessment' },
        { status: 500 }
      );
    }
  })(req);
}

// Helper function to generate questions with OpenAI
async function generateQuestionsWithAI({
  level,
  allowedTypes,
  questionsNeeded,
  blogTitle,
  blogContent
}: {
  level: QuestionLevel;
  allowedTypes: QuestionType[];
  questionsNeeded: number;
  blogTitle: string;
  blogContent: string;
}) {
  const prompt = `
You are an expert quiz creator. Create ${questionsNeeded} assessment questions based on the following content:

Blog Title: ${blogTitle}
Content: ${blogContent}

Requirements:
- Difficulty Level: ${level}
- Question Types: ${allowedTypes.join(', ')}
- Create exactly ${questionsNeeded} questions
- Each question should be based on the provided content
- Make questions challenging but fair for the ${level} level

Return the questions in the following JSON format as an array:

For TRUE_FALSE questions:
{
  "text": "Question text here",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "Explanation of why this is correct",
  "type": "TRUE_FALSE"
}

For MCQ_SINGLE questions:
{
  "text": "Question text here",
  "options": {
    "a": "Option A text",
    "b": "Option B text", 
    "c": "Option C text",
    "d": "Option D text"
  },
  "correctAnswer": "a",
  "explanation": "Explanation of why this is correct",
  "type": "MCQ_SINGLE"
}

For MCQ_MULTIPLE questions:
{
  "text": "Question text here",
  "options": {
    "a": "Option A text",
    "b": "Option B text",
    "c": "Option C text", 
    "d": "Option D text"
  },
  "correctAnswer": ["a", "c"],
  "explanation": "Explanation of why these are correct",
  "type": "MCQ_MULTIPLE"
}

For FILL_BLANK questions:
{
  "text": "Question text with _____ blank here",
  "options": null,
  "correctAnswer": "correct answer",
  "explanation": "Explanation of why this is correct",
  "type": "FILL_BLANK"
}

Return only the JSON array, no other text.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz creator. Always return valid JSON arrays with the exact format specified."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const questions = JSON.parse(response);
    
    // Validate the response format
    if (!Array.isArray(questions)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions with OpenAI:', error);
    throw new Error('Failed to generate questions with AI');
  }
}
