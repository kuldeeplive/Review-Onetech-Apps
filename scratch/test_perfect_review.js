const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFull() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const prompt = `Write a 5-star Google review for "Onetech Solution".
Business Type: IT & Software Solutions
About what they do: We provide custom web development, mobile app development, UI/UX design, and digital IT cloud solutions for businesses.
Aspect to praise: Top Quality`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: 'You are an authentic customer review assistant. Write ONLY a single, natural, 2-to-3-sentence 5-star Google review. Do not include introductory phrases, quotation marks, bullet points, or options.' }]
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    }),
  });

  const data = await res.json();
  console.log('Result:\n', data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

testFull().finally(() => prisma.$disconnect());
