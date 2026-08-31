const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLanguages() {
  const config = await prisma.systemSetting.findFirst();
  const apiKey = config.geminiApiKey;

  const languages = [
    { name: 'English', instruction: 'Write in English' },
    { name: 'Hinglish', instruction: 'Language: Hinglish (Conversational Hindi written in English/Latin script, e.g. "Onetech Solution ki service sach me bohot acchi hai, mobile app time par deliver kiya.")' },
    { name: 'Hindi', instruction: 'Language: Pure Hindi (Devanagari script: "वनटेक सॉल्यूशन की सेवाएं बहुत ही उच्च स्तर की हैं।")' },
    { name: 'Gujarati', instruction: 'Language: Gujarati (ગુજરાતી લિપિ)' },
    { name: 'Marathi', instruction: 'Language: Marathi (मराठी)' }
  ];

  for (const lang of languages) {
    const prompt = `Write an authentic, unique 5-star Google review for "Onetech Solution".
Business Category: "IT & Software Solutions"
The customer used ONLY these specific service(s): "Mobile App Development".
Specific praise aspects to highlight: "Fast Delivery, Top Quality".
Target Language: ${lang.instruction}

STRICT INSTRUCTIONS:
- Write exactly 2 to 3 natural, positive sentences as a real customer.
- Write the ENTIRE review in ${lang.name}.
- Output ONLY the raw review text without quotes or bullet points.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are an authentic customer review assistant. Write ONLY a single, natural, 2-to-3-sentence 5-star Google review in the requested language. Do not output quotes, bullet points, or options.` }]
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.75 },
      }),
    });

    const data = await res.json();
    console.log(`\n=== Language: ${lang.name} ===`);
    console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  }
}

testLanguages().finally(() => prisma.$disconnect());
