import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callGeminiApi } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

// Smart review synthesis helper (Used as instant fallback or when no external API key is configured)
function generateSmartDynamicReview(businessName: string, tag: string, rating: number = 5): string {
  const cleanName = businessName || 'this place';
  const cleanTag = tag || 'Great Experience';

  const openings = [
    `Had a truly wonderful experience at ${cleanName}!`,
    `Visiting ${cleanName} was fantastic today.`,
    `Really impressed with our visit to ${cleanName}.`,
    `Absolutely loved my experience at ${cleanName}!`,
    `Top-notch service and quality at ${cleanName}.`,
    `Everything about ${cleanName} exceeded our expectations!`,
    `So glad we chose ${cleanName}.`,
  ];

  const tagSpecificSentences: Record<string, string[]> = {
    'Fast & Friendly': [
      `The staff was super polite, welcoming, and everything was handled with impressive speed.`,
      `Very courteous team and lightning fast service throughout our visit.`,
      `Staff was attentive and quick to assist with a warm smile.`,
    ],
    'Top Quality': [
      `The attention to detail and standard of quality is remarkable.`,
      `You can tell they genuinely care about high quality in everything they offer.`,
      `Exceptional standard and premium finish all around.`,
    ],
    'Great Hospitality': [
      `The hospitality was warm, accommodating, and made us feel right at home.`,
      `Staff treated us with great respect and went out of their way to ensure comfort.`,
      `Outstanding customer care and hospitality from start to finish.`,
    ],
    'Value for Money': [
      `Honest pricing and worth every single penny.`,
      `Great value for what they deliver, completely justified pricing.`,
      `Very reasonably priced considering the outstanding service and quality.`,
    ],
    'Highly Recommended': [
      `Will definitely be coming back again and recommending to friends and family.`,
      `A must-visit spot in the area. 10/10 recommendation!`,
      `Can't wait to return. Highly recommend giving them a try!`,
    ],
    'Best Doctors': [
      `The doctor took the time to listen carefully, explain everything clearly, and made me feel at ease.`,
      `Very knowledgeable, compassionate, and professional medical care.`,
      `Doctor consultation was detailed and very reassuring.`,
    ],
    'Caring Staff': [
      `The nursing and support staff was very gentle, cooperative, and attentive.`,
      `Staff took great care of us throughout our visit with utmost compassion.`,
    ],
    'Clean Premises': [
      `The entire facility was spotless, hygienic, and very well-maintained.`,
      `Very clean, sanitized, and organized environment.`,
    ],
    'Fast Delivery': [
      `Delivered the project well ahead of schedule without cutting any corners.`,
      `Very prompt turnaround and efficient project management.`,
    ],
    'Clean Code': [
      `High quality technical implementation and solid architecture throughout.`,
      `Clean, scalable development and reliable code quality.`,
    ],
    'Great Communication': [
      `Clear, prompt, and proactive communication at every step of the process.`,
      `Always accessible for updates and very transparent in their workflow.`,
    ],
  };

  // Find matching or closest tag sentences
  let matchingMiddle = tagSpecificSentences[cleanTag];
  if (!matchingMiddle) {
    // Check partial match
    const matchingKey = Object.keys(tagSpecificSentences).find((k) =>
      cleanTag.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cleanTag.toLowerCase())
    );
    if (matchingKey) {
      matchingMiddle = tagSpecificSentences[matchingKey];
    } else {
      matchingMiddle = [
        `Particularly loved the ${cleanTag.toLowerCase()} and smooth overall service.`,
        `The ${cleanTag.toLowerCase()} was spot on and made a huge positive impression.`,
        `Really appreciated their focus on ${cleanTag.toLowerCase()}.`,
      ];
    }
  }

  const closings = [
    `Will definitely be visiting again soon!`,
    `Keep up the great work! 👍`,
    `Five stars all the way! ⭐⭐⭐⭐⭐`,
    `A solid 10/10 experience!`,
    `Will definitely recommend to everyone.`,
  ];

  const opening = openings[Math.floor(Math.random() * openings.length)];
  const middle = matchingMiddle[Math.floor(Math.random() * matchingMiddle.length)];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${opening} ${middle} ${closing}`;
}

export async function POST(req: Request) {
  try {
    const { businessName, tag, rating = 5 } = await req.json();

    // 1. Fetch Admin AI Configuration from database
    let activeProvider = 'gemini';
    let geminiKey = process.env.GEMINI_API_KEY;
    let openAiKey = process.env.OPENAI_API_KEY;
    let customPrompt: string | null = null;

    try {
      const config = await prisma.systemSetting.findUnique({
        where: { id: 'global_config' },
      });
      if (config) {
        if (config.aiProvider) activeProvider = config.aiProvider;
        if (config.geminiApiKey) geminiKey = config.geminiApiKey;
        if (config.openAiApiKey) openAiKey = config.openAiApiKey;
        if (config.aiCustomPrompt) customPrompt = config.aiCustomPrompt;
      }
    } catch (dbErr) {
      console.warn('Could not read systemSetting table, fallback to env:', dbErr);
    }

    // 2. If Google Gemini is active and key is available
    if ((activeProvider === 'gemini' || !openAiKey) && geminiKey) {
      try {
        const prompt = customPrompt
          ? `${customPrompt}\nBusiness Name: "${businessName}", Highlight: "${tag}"`
          : `You are a satisfied real customer writing an authentic, natural, 2-to-3-sentence 5-star Google review for "${businessName}". Highlight the aspect: "${tag}". Make it sound casual, genuine, positive, and human. Do not include quotes, markdown bold, or intro text. Just the review body.`;

        const geminiResult = await callGeminiApi(geminiKey, prompt, 120);

        if (geminiResult.success && geminiResult.text) {
          return NextResponse.json({
            success: true,
            review: geminiResult.text,
            source: `gemini (${geminiResult.modelUsed})`,
          });
        }
      } catch (err) {
        console.error('Gemini API call failed, trying fallback:', err);
      }
    }

    // 3. If OpenAI is active and key is available
    if ((activeProvider === 'openai' || !geminiKey) && openAiKey) {
      try {
        const prompt = `Write an authentic, casual, 2-to-3-sentence 5-star Google review for "${businessName}". Highlight: "${tag}". Do not include quotes or intro text.`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 120,
            temperature: 0.85,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const generatedText = data?.choices?.[0]?.message?.content?.trim();
          if (generatedText) {
            return NextResponse.json({
              success: true,
              review: generatedText.replace(/^["']|["']$/g, ''),
              source: 'openai',
            });
          }
        }
      } catch (err) {
        console.error('OpenAI API call failed, using fallback:', err);
      }
    }

    // 4. Instant Smart Permutation Engine (Zero latency / fallback)
    const review = generateSmartDynamicReview(businessName, tag, rating);
    return NextResponse.json({
      success: true,
      review,
      source: 'smart_randomizer',
    });
  } catch (error: any) {
    console.error('AI Review Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review' },
      { status: 500 }
    );
  }
}
