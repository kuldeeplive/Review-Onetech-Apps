import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function ensureSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') return null;
  return user;
}

// GET /api/super-admin/ai-config - Fetch global AI settings
export async function GET() {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let config = await prisma.systemSetting.findUnique({
      where: { id: 'global_config' },
    });

    if (!config) {
      config = await prisma.systemSetting.create({
        data: {
          id: 'global_config',
          aiProvider: 'gemini',
          geminiApiKey: process.env.GEMINI_API_KEY || '',
          geminiModel: 'gemini-3.5-flash-lite',
          openAiApiKey: process.env.OPENAI_API_KEY || '',
          openAiModel: 'gpt-4o-mini',
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        aiProvider: config.aiProvider,
        geminiApiKey: config.geminiApiKey || '',
        geminiModel: config.geminiModel || 'gemini-3.5-flash-lite',
        openAiApiKey: config.openAiApiKey || '',
        openAiModel: config.openAiModel || 'gpt-4o-mini',
        aiCustomPrompt: config.aiCustomPrompt || '',
        hasGeminiKey: Boolean(config.geminiApiKey || process.env.GEMINI_API_KEY),
        hasOpenAiKey: Boolean(config.openAiApiKey || process.env.OPENAI_API_KEY),
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Fetch AI Config Error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI config' }, { status: 500 });
  }
}

// POST /api/super-admin/ai-config - Save global AI settings
export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { aiProvider, geminiApiKey, geminiModel, openAiApiKey, openAiModel, aiCustomPrompt } = body;

    const config = await prisma.systemSetting.upsert({
      where: { id: 'global_config' },
      update: {
        aiProvider: aiProvider || 'gemini',
        geminiApiKey: geminiApiKey !== undefined ? geminiApiKey.trim() : undefined,
        geminiModel: geminiModel !== undefined ? geminiModel.trim() : 'gemini-3.5-flash-lite',
        openAiApiKey: openAiApiKey !== undefined ? openAiApiKey.trim() : undefined,
        openAiModel: openAiModel !== undefined ? openAiModel.trim() : 'gpt-4o-mini',
        aiCustomPrompt: aiCustomPrompt !== undefined ? aiCustomPrompt.trim() : undefined,
      },
      create: {
        id: 'global_config',
        aiProvider: aiProvider || 'gemini',
        geminiApiKey: geminiApiKey ? geminiApiKey.trim() : null,
        geminiModel: geminiModel ? geminiModel.trim() : 'gemini-3.5-flash-lite',
        openAiApiKey: openAiApiKey ? openAiApiKey.trim() : null,
        openAiModel: openAiModel ? openAiModel.trim() : 'gpt-4o-mini',
        aiCustomPrompt: aiCustomPrompt ? aiCustomPrompt.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Configuration saved successfully!',
      config: {
        aiProvider: config.aiProvider,
        geminiApiKey: config.geminiApiKey,
        geminiModel: config.geminiModel,
        openAiApiKey: config.openAiApiKey,
        openAiModel: config.openAiModel,
        aiCustomPrompt: config.aiCustomPrompt,
      },
    });
  } catch (error: any) {
    console.error('Save AI Config Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save AI config' }, { status: 500 });
  }
}
