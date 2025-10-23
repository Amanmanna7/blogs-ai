import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getMessageLimit, getMessageLimitFromUserPlan, getLimitStartDate, FeatureSlug } from '@/types/messaging-limits';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      messages, 
      systemPrompt, 
      sessionId, 
      blogId, 
      courseId, 
      chapterTopicId,
      isFirstMessage = false,
      featureSlug = FeatureSlug.AI_CHAT
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check message limits for users without active plans
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please refresh the page and try again.' },
        { status: 404 }
      );
    }

    // Check if user has an active plan
    const currentDate = new Date();
    const activePlan = await prisma.userPlan.findFirst({
      where: {
        userId: dbUser.id,
        status: 'ACTIVE',
        startDate: {
          lte: currentDate
        },
        endDate: {
          gte: currentDate
        }
      },
      include: {
        plan: {
          include: {
            features: true
          }
        }
      }
    });

    // Get user's plan features if they have an active plan
    let userPlanFeatures: string[] = [];
    if (activePlan) {
      userPlanFeatures = activePlan.plan.features.map(feature => feature.featureSlug);
    }

    // Get limit configuration based on user's plan features or fallback to requested feature
    const limitConfig = userPlanFeatures.length > 0 
      ? getMessageLimitFromUserPlan(userPlanFeatures)
      : getMessageLimit(featureSlug);

    // Check message limits based on user type and feature
    if (limitConfig.messageLimit !== -1) {
      // Get start date based on time period
      const startDate = getLimitStartDate(limitConfig.timePeriod);

      const messageCount = await prisma.chatMessage.count({
        where: {
          sender: 'USER',
          session: {
            userId: dbUser.id
          },
          createdAt: {
            gte: startDate
          }
        }
      });

      if (messageCount >= limitConfig.messageLimit) {
        return NextResponse.json({
          error: 'MESSAGE_LIMIT_EXCEEDED',
          message: `You have reached your ${limitConfig.timePeriod} message limit. Upgrade to continue chatting.`,
          messageLimit: limitConfig.messageLimit,
          messageCount,
          remainingMessages: 0,
          timePeriod: limitConfig.timePeriod
        }, { status: 429 });
      }
    }

    let currentSessionId = sessionId;

    // Create session if this is the first message and no sessionId provided
    if (isFirstMessage && !sessionId) {
      // User already exists from the limit check above

      const newSession = await prisma.chatSession.create({
        data: {
          userId: dbUser.id, // Use the database user ID, not Clerk userId
          blogId: blogId || null,
          courseId: courseId || null,
          chapterTopicId: chapterTopicId || null,
          status: 'ACTIVE'
        }
      });
      currentSessionId = newSession.id;
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      {
        role: 'system',
        content: (systemPrompt || 'You are a helpful AI assistant. Please provide clear, accurate, and helpful responses to user questions.') + 
        '\n\nCRITICAL: Format your responses ONLY in HTML with Tailwind CSS classes. DO NOT use markdown syntax like ``` or **. Use HTML tags with Tailwind styling:\n' +
        '- Use <strong class="font-semibold text-gray-900"> for bold/important terms\n' +
        '- Use <em class="italic text-gray-700"> for emphasis\n' +
        '- Use <code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800"> for inline technical terms\n' +
        '- Use <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3"><code class="text-gray-100"> for ALL code blocks (never use ```)\n' +
        '- Use <ul class="list-disc list-inside space-y-1 my-2"> and <li class="text-sm"> for lists\n' +
        '- Use <p class="mb-2"> for paragraphs\n' +
        '- Use <h3 class="text-base font-semibold text-gray-900 mt-3 mb-2"> for section headings\n' +
        'NEVER use markdown syntax. Always use HTML with complete Tailwind classes. For code examples, use <pre><code> structure with proper Tailwind classes.'
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Store messages in database if sessionId is provided
    if (currentSessionId) {
      try {
        // Get the last user message
        const lastUserMessage = messages[messages.length - 1];
        
        // Store user message
        await prisma.chatMessage.create({
          data: {
            sessionId: currentSessionId,
            message: lastUserMessage.content,
            sender: 'USER'
          }
        });

        // Store AI response
        await prisma.chatMessage.create({
          data: {
            sessionId: currentSessionId,
            message: response.trim(),
            sender: 'AI'
          }
        });

        // Update session timestamp
        await prisma.chatSession.update({
          where: { id: currentSessionId },
          data: { updatedAt: new Date() }
        });
      } catch (dbError) {
        console.error('Error storing messages:', dbError);
        // Continue with response even if DB storage fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      response: response.trim(),
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is busy, please try again later' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
