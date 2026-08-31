const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWithSystemInstruction() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];

  for (const m of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are an authentic customer review assistant. Write ONLY the final 2-3 sentence 5-star Google review. Never output outlines, personas, bullet points, options, or quotes.' }]
          },
          contents: [{ parts: [{ text: 'Write a 5-star review for Onetech Solution (Custom software, web & mobile app development). Praise: Top Quality.' }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
        }),
      });

      const data = await res.json();
      console.log(`\n--- Model [${m}] Status: ${res.status} ---`);
      if (res.ok) {
        console.log('Result:', data?.candidates?.[0]?.content?.parts?.[0]?.text);
      } else {
        console.log('Error:', data?.error?.message);
      }
    } catch (e) {
      console.log(`Model [${m}] failed:`, e.message);
    }
  }
}

testWithSystemInstruction().finally(() => prisma.$disconnect());
