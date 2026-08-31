const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test36() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const prompt = `Write a natural 2-sentence 5-star Google review for "Onetech Solution", an IT & Software company offering web and mobile app development. Highlight "Top Quality". Output only the review.`;

  const models = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-pro-latest'];

  for (const m of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.7 },
      }),
    });
    const data = await res.json();
    console.log(`\nModel [${m}] Status: ${res.status}`);
    if (res.ok) {
      console.log('Output:', data?.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('Error:', data?.error?.message);
    }
  }
}

test36().finally(() => prisma.$disconnect());
