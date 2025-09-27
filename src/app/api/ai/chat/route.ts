import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
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
      model: 'gpt-3.5-turbo',
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

    return NextResponse.json({ 
      success: true, 
      response: response.trim() 
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
