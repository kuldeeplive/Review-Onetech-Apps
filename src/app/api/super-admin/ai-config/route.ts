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
          openAiApiKey: process.env.OPENAI_API_KEY || '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        aiProvider: config.aiProvider,
        geminiApiKey: config.geminiApiKey || '',
        openAiApiKey: config.openAiApiKey || '',
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
    const { aiProvider, geminiApiKey, openAiApiKey, aiCustomPrompt } = body;

    const config = await prisma.systemSetting.upsert({
      where: { id: 'global_config' },
      update: {
        aiProvider: aiProvider || 'gemini',
        geminiApiKey: geminiApiKey !== undefined ? geminiApiKey.trim() : undefined,
        openAiApiKey: openAiApiKey !== undefined ? openAiApiKey.trim() : undefined,
        aiCustomPrompt: aiCustomPrompt !== undefined ? aiCustomPrompt.trim() : undefined,
      },
      create: {
        id: 'global_config',
        aiProvider: aiProvider || 'gemini',
        geminiApiKey: geminiApiKey ? geminiApiKey.trim() : null,
        openAiApiKey: openAiApiKey ? openAiApiKey.trim() : null,
        aiCustomPrompt: aiCustomPrompt ? aiCustomPrompt.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Configuration saved successfully!',
      config: {
        aiProvider: config.aiProvider,
        geminiApiKey: config.geminiApiKey,
        openAiApiKey: config.openAiApiKey,
        aiCustomPrompt: config.aiCustomPrompt,
      },
    });
  } catch (error: any) {
    console.error('Save AI Config Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save AI config' }, { status: 500 });
  }
}
