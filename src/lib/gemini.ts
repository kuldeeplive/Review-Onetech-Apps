/**
 * Google Gemini API Client
 * Optimized with systemInstruction and active models (gemini-3.6-flash, gemini-3.5-flash, gemini-flash-latest, etc.)
 */

export async function callGeminiApi(
  apiKey: string,
  userPrompt: string,
  maxTokens: number = 1000,
  systemInstructionText?: string
): Promise<{ success: boolean; text?: string; error?: string; modelUsed?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'API Key is empty or invalid.' };
  }

  const cleanKey = apiKey.trim();
  const sysText =
    systemInstructionText ||
    'You are an authentic customer review assistant. Write ONLY a single, natural, 2-to-3-sentence 5-star Google review. Do not include introductory phrases, quotation marks, bullet points, personas, formatting outlines, or options. Output only the final review text.';

  // Top candidate models for Google Generative AI
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-pro-latest',
    'gemini-3.5-flash-lite',
  ];

  let lastErrorMessage = '';

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: sysText }],
          },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.75,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            success: true,
            text: text.replace(/^["'`]|["'`]$/g, '').trim(),
            modelUsed: model,
          };
        }
      } else {
        lastErrorMessage = data?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err: any) {
      lastErrorMessage = err?.message || 'Network error connecting to Google AI';
    }
  }

  // Dynamic discovery via ListModels if standard candidates were rejected
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );
    if (listResponse.ok) {
      const listData = await listResponse.json();
      if (listData.models && Array.isArray(listData.models)) {
        const supported = listData.models.filter(
          (m: any) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
        );

        for (const model of supported) {
          const modelName = model.name.replace(/^models\//, '');
          // Skip gemma base models
          if (modelName.includes('gemma')) continue;

          const dynamicUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`;

          const dynRes = await fetch(dynamicUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: sysText }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: { maxOutputTokens: maxTokens, temperature: 0.75 },
            }),
          });

          if (dynRes.ok) {
            const dynData = await dynRes.json();
            const text = dynData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return {
                success: true,
                text: text.replace(/^["'`]|["'`]$/g, '').trim(),
                modelUsed: modelName,
              };
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore list error
  }

  return {
    success: false,
    error: lastErrorMessage || 'Could not connect to Google Gemini. Please check your API key.',
  };
}
