const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testModernModels() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const prompt = `Write a genuine 2-sentence 5-star Google review for "Onetech Solution", an IT & Software company offering custom web and mobile app development. Highlight "Top Quality". Output only the review text.`;

  const models = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-2.5-pro',
    'gemini-pro-latest',
    'gemini-2.5-flash-lite'
  ];

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.7 },
        }),
      });
      const data = await res.json();
      console.log(`\nModel: [${model}] Status: ${res.status}`);
      if (res.ok) {
        console.log('Output:', data?.candidates?.[0]?.content?.parts?.[0]?.text);
      } else {
        console.log('Error:', data?.error?.message);
      }
    } catch (e) {
      console.log(`Model: [${model}] Error:`, e.message);
    }
  }
}

testModernModels().finally(() => prisma.$disconnect());
