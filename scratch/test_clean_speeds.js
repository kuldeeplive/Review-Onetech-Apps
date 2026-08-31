const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSpeedsClean() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const prompt = `Write an authentic 2-sentence 5-star Google review for "Onetech Solution". Service: Mobile App. Praise: Fast Delivery.`;

  const models = [
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' }
  ];

  for (const m of models) {
    const t0 = Date.now();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are an authentic review generator. Output ONLY a natural 2-sentence 5-star review. No intro, no quotes, no bullets.' }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          }
        }),
      });

      const elapsed = Date.now() - t0;
      const data = await res.json();
      console.log(`\nModel: [${m.name}] (${m.id}) Status: ${res.status} Latency: ${elapsed}ms`);
      if (res.ok) {
        console.log('Output:', data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      } else {
        console.log('Error:', data?.error?.message);
      }
    } catch (e) {
      console.log(`Model: [${m.name}] Error:`, e.message);
    }
  }
}

testSpeedsClean().finally(() => prisma.$disconnect());
