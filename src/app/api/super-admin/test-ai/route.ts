import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { callGeminiApi } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

async function ensureSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') return null;
  return user;
}

export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { provider, apiKey, model } = await req.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: 'Please enter an API key to test.' },
        { status: 400 }
      );
    }

    const testPrompt = `Write a short, natural 2-sentence 5-star Google review for "Sample Cafe" praising their "Fast Service". Return only the review.`;

    // 1. Test Google Gemini API
    if (provider === 'gemini') {
      const result = await callGeminiApi(apiKey, testPrompt, 300, undefined, model);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Google Gemini API Connection Failed',
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Google Gemini API Connected Successfully! (${result.modelUsed}) ✅`,
        sampleOutput: result.text || 'Review generated successfully!',
      });
    }

    // 2. Test OpenAI API
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data?.error?.message || `OpenAI API Error (Status ${response.status})`,
          },
          { status: 400 }
        );
      }

      const generatedText = data?.choices?.[0]?.message?.content?.trim();
      return NextResponse.json({
        success: true,
        message: 'OpenAI GPT-4o-mini API Connected Successfully! ✅',
        sampleOutput: generatedText || 'Review generated successfully!',
      });
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  } catch (error: any) {
    console.error('Test AI API Error:', error);
    return NextResponse.json({ error: error.message || 'Connection failed' }, { status: 500 });
  }
}
