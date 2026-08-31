/**
 * Google Gemini API Helper with Multi-Model & Multi-Version Auto-Fallback
 * Supports v1 and v1beta endpoints, gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro, etc.
 */

export async function callGeminiApi(
  apiKey: string,
  prompt: string,
  maxTokens: number = 120
): Promise<{ success: boolean; text?: string; error?: string; modelUsed?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'API Key is empty or invalid.' };
  }

  const cleanKey = apiKey.trim();

  // List of endpoints to try in order of speed and recommendation
  const candidateEndpoints = [
    {
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
      name: 'gemini-1.5-flash (v1)',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${cleanKey}`,
      name: 'gemini-1.5-flash-latest',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
      name: 'gemini-1.5-flash (v1beta)',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
      name: 'gemini-2.0-flash',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${cleanKey}`,
      name: 'gemini-2.0-flash-exp',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${cleanKey}`,
      name: 'gemini-1.5-pro (v1)',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${cleanKey}`,
      name: 'gemini-1.5-pro (v1beta)',
    },
    {
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${cleanKey}`,
      name: 'gemini-pro (v1)',
    },
  ];

  let lastErrorMessage = '';

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.8,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            success: true,
            text: text.replace(/^["']|["']$/g, ''),
            modelUsed: endpoint.name,
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
          const dynamicUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`;

          const dynRes = await fetch(dynamicUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 },
            }),
          });

          if (dynRes.ok) {
            const dynData = await dynRes.json();
            const text = dynData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return {
                success: true,
                text: text.replace(/^["']|["']$/g, ''),
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
