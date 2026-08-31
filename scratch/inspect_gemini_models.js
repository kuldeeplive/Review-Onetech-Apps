const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectModels() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;
  console.log('Using API key:', apiKey.slice(0, 10) + '...');

  const prompt = `Write a short 5-star Google review for "Onetech Solution", an IT & Software company specializing in custom web apps and mobile apps. Highlight "Top Quality". Output only the review text.`;

  const endpoints = [
    { name: 'v1 gemini-1.5-flash', url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: 'v1beta gemini-1.5-flash', url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: 'v1beta gemini-1.5-flash-latest', url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}` },
    { name: 'v1beta gemini-2.0-flash', url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}` },
    { name: 'v1 gemini-1.5-pro', url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}` },
    { name: 'v1beta gemini-1.5-pro', url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}` },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.7 },
        }),
      });
      const data = await res.json();
      console.log(`\nModel: [${ep.name}] Status: ${res.status}`);
      if (res.ok) {
        console.log('Output:', data?.candidates?.[0]?.content?.parts?.[0]?.text);
      } else {
        console.log('Error:', data?.error?.message);
      }
    } catch (e) {
      console.log(`Model: [${ep.name}] Fetch Failed:`, e.message);
    }
  }

  // Also list models
  const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const listData = await listRes.json();
  if (listData.models) {
    console.log('\nAvailable models on this key:');
    listData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).forEach(m => console.log(' -', m.name));
  }
}

inspectModels().finally(() => prisma.$disconnect());
