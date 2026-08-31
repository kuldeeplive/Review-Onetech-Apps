const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.systemSetting.upsert({
    where: { id: 'global_config' },
    update: {
      geminiModel: 'gemini-3.5-flash-lite',
      openAiModel: 'gpt-4o-mini',
    },
    create: {
      id: 'global_config',
      aiProvider: 'gemini',
      geminiModel: 'gemini-3.5-flash-lite',
      openAiModel: 'gpt-4o-mini',
    },
  });
  console.log('Updated global AI config with fast model:', updated);
}

main().finally(() => prisma.$disconnect());
