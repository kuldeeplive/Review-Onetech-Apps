import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callGeminiApi } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

/**
 * Sanitizes and extracts clean 5-star review text from AI output,
 * stripping away any stray prompt analysis, personas, bullet points, or options.
 */
function sanitizeAiReview(rawText: string, fallbackName: string, fallbackTag: string): string {
  if (!rawText || !rawText.trim()) {
    return generateSmartDynamicReview(fallbackName, fallbackTag, 5);
  }

  let text = rawText.trim();

  // If AI output contains bullet options like "* Option 1: I had a great..." or "Option 1: ...", extract the review
  if (text.includes('Option 1:') || text.includes('Option 1 -') || text.includes('Option 1.')) {
    const parts = text.split(/Option 1[:.-]/i);
    if (parts[1]) {
      // take until Option 2 or next major header
      text = parts[1].split(/Option 2[:.-]|\n\n\*/i)[0].trim();
    }
  }

  // Remove markdown bullet points / asterisks at line starts
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => {
      // Filter out meta lines
      const lower = l.toLowerCase();
      if (
        lower.startsWith('* persona') ||
        lower.startsWith('* goal') ||
        lower.startsWith('* constraint') ||
        lower.startsWith('persona:') ||
        lower.startsWith('goal:') ||
        lower.startsWith('constraint') ||
        lower.startsWith('here is') ||
        lower.startsWith('here are') ||
        lower.startsWith('here\'s')
      ) {
        return false;
      }
      return l.length > 0;
    });

  text = lines.join(' ').replace(/^[*•\-]\s*/, '').trim();

  // Strip leading/trailing quotation marks
  text = text.replace(/^["'`]|["'`]$/g, '').trim();

  // If text is too short (< 40 chars) or corrupted, fallback
  if (text.length < 40) {
    return generateSmartDynamicReview(fallbackName, fallbackTag, 5);
  }

  return text;
}

// Smart review synthesis helper (Used as instant fallback or when no external API key is configured)
function generateSmartDynamicReview(
  businessName: string,
  tag: string,
  rating: number = 5,
  category?: string,
  bio?: string
): string {
  const cleanName = businessName || 'this place';
  const cleanTag = tag || 'Great Experience';

  const openings = [
    `Had a truly wonderful experience at ${cleanName}!`,
    `Visiting ${cleanName} was fantastic today.`,
    `Really impressed with our experience at ${cleanName}.`,
    `Absolutely loved my experience at ${cleanName}!`,
    `Top-notch service and outstanding quality at ${cleanName}.`,
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
      `You can tell they genuinely care about delivering high quality in everything they offer.`,
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
    const body = await req.json();
    const {
      businessName,
      slug,
      tag,
      service,
      selectedTags = [],
      selectedServices = [],
      rating = 5,
    } = body;

    // 1. Fetch Business details (category, bio, services) from database
    let businessCategory = 'General Business';
    let businessBio = '';
    let resolvedName = businessName || 'this business';

    if (slug) {
      const b = await prisma.business.findUnique({
        where: { slug },
        select: { name: true, category: true, bio: true, services: true },
      });
      if (b) {
        resolvedName = b.name;
        if (b.category) businessCategory = b.category;
        if (b.bio) businessBio = b.bio;
      }
    } else if (businessName) {
      const b = await prisma.business.findFirst({
        where: { name: businessName },
        select: { name: true, category: true, bio: true, services: true },
      });
      if (b) {
        if (b.category) businessCategory = b.category;
        if (b.bio) businessBio = b.bio;
      }
    }

    // Normalize tags & services
    const tagsList: string[] =
      Array.isArray(selectedTags) && selectedTags.length > 0
        ? selectedTags
        : tag
        ? [tag]
        : ['Top Quality', 'Highly Recommended'];

    const servicesList: string[] =
      Array.isArray(selectedServices) && selectedServices.length > 0
        ? selectedServices
        : service
        ? [service]
        : [];

    const primaryAspect = tagsList[0] || 'Top Quality';

    // 2. Fetch Admin AI Configuration from database
    let activeProvider = 'gemini';
    let geminiKey = process.env.GEMINI_API_KEY;
    let preferredGeminiModel = 'gemini-3.5-flash-lite';
    let openAiKey = process.env.OPENAI_API_KEY;
    let preferredOpenAiModel = 'gpt-4o-mini';
    let customPrompt: string | null = null;

    try {
      const config = await prisma.systemSetting.findUnique({
        where: { id: 'global_config' },
      });
      if (config) {
        if (config.aiProvider) activeProvider = config.aiProvider;
        if (config.geminiApiKey) geminiKey = config.geminiApiKey;
        if (config.geminiModel) preferredGeminiModel = config.geminiModel;
        if (config.openAiApiKey) openAiKey = config.openAiApiKey;
        if (config.openAiModel) preferredOpenAiModel = config.openAiModel;
        if (config.aiCustomPrompt) customPrompt = config.aiCustomPrompt;
      }
    } catch (dbErr) {
      console.warn('Could not read systemSetting table, fallback to env:', dbErr);
    }

    const servicesFocusText =
      servicesList.length > 0
        ? `The customer used ONLY these specific service(s): "${servicesList.join(', ')}". (Mention ONLY these services. Do NOT list or mention other services from the company).`
        : `Background context: "${businessBio || 'Top quality customer services'}".`;

    const praiseFocusText = `Specific praise aspects to highlight: "${tagsList.join(', ')}".`;

    // Craft unambiguous, strict prompt
    const prompt = customPrompt
      ? `${customPrompt}\nBusiness Name: "${resolvedName}"\nCategory: "${businessCategory}"\n${servicesFocusText}\n${praiseFocusText}\nWrite a fresh, unique 2-to-3 sentence review text.`
      : `Write an authentic, unique 5-star Google review for "${resolvedName}".
Business Category: "${businessCategory}"
${servicesFocusText}
${praiseFocusText}

STRICT INSTRUCTIONS:
- Write exactly 2 to 3 natural, positive, and realistic sentences from the perspective of a real customer.
- Focus ONLY on the specific service(s) and praise aspects mentioned above.
- Make the wording natural, varied, and unique.
- Do NOT output bullet points, personas, options (like Option 1), formatting rules, markdown headers, or quotes.
- Output ONLY the review paragraph text.`;

    // 3. If Google Gemini is active and key is available
    if ((activeProvider === 'gemini' || !openAiKey) && geminiKey) {
      try {
        const geminiResult = await callGeminiApi(
          geminiKey,
          prompt,
          500,
          undefined,
          preferredGeminiModel
        );

        if (geminiResult.success && geminiResult.text) {
          const cleanReview = sanitizeAiReview(geminiResult.text, resolvedName, primaryAspect);
          return NextResponse.json({
            success: true,
            review: cleanReview,
            source: `gemini (${geminiResult.modelUsed})`,
          });
        }
      } catch (err) {
        console.error('Gemini API call failed, trying fallback:', err);
      }
    }

    // 4. If OpenAI is active and key is available
    if ((activeProvider === 'openai' || !geminiKey) && openAiKey) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey.trim()}`,
          },
          body: JSON.stringify({
            model: preferredOpenAiModel || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an authentic customer review assistant. Write ONLY a single, natural, 2-to-3-sentence 5-star Google review. Do not include quotes, markdown bold, or introductory phrases.',
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 250,
            temperature: 0.8,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const raw = data?.choices?.[0]?.message?.content?.trim();
          if (raw) {
            const cleanReview = sanitizeAiReview(raw, resolvedName, tag);
            return NextResponse.json({
              success: true,
              review: cleanReview,
              source: 'openai',
            });
          }
        }
      } catch (err) {
        console.error('OpenAI API call failed, using fallback:', err);
      }
    }

    // 5. Instant Smart Permutation Engine (Zero latency / fallback)
    const review = generateSmartDynamicReview(
      resolvedName,
      tag,
      rating,
      businessCategory,
      businessBio
    );
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
