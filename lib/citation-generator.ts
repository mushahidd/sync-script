import { config } from 'dotenv';

// Load environment variables
config();

const apiKey = process.env.OPENROUTER_API_KEY?.trim() || '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';

if (!apiKey) {
  console.warn('⚠️ OPENROUTER_API_KEY is not set');
}

// OpenRouter API client
const openrouter = {
  chat: {
    completions: {
      create: async (params: any) => {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'SyncScript PDF Citation Generator',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            max_tokens: params.max_tokens,
            temperature: params.temperature,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      },
    },
  },
};

export interface CitationGenerationResult {
  success: boolean;
  citation?: string;
  error?: string;
}

export async function generateCitation(
  title?: string,
  author?: string,
  year?: string,
  fullText?: string
): Promise<CitationGenerationResult> {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenRouter API key not configured',
      };
    }

    let prompt = '';

    if (title && author && year) {
      prompt = `Generate an APA format citation for an academic paper with the following details:

Title: ${title}
Author: ${author}
Year: ${year}

Provide ONLY the citation in proper APA format.`;
    } else if (title || author || year) {
      prompt = `Generate an APA format citation using the available information:

${title ? `Title: ${title}` : ''}
${author ? `Author: ${author}` : ''}
${year ? `Year: ${year}` : ''}

Provide ONLY the citation in proper APA format.`;
    } else if (fullText) {
      prompt = `From the following academic text, extract citation details and generate an APA format citation:

${fullText}

Provide ONLY the citation in proper APA format.`;
    } else {
      return {
        success: false,
        error: 'No information provided for citation generation',
      };
    }

    const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct';

    const response = await openrouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert academic citation assistant. Generate accurate APA format citations. Only respond with the citation, no additional text or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const citation = response.choices[0]?.message?.content?.trim();

    if (!citation) {
      return {
        success: false,
        error: 'AI returned an empty citation',
      };
    }

    return {
      success: true,
      citation,
    };
  } catch (error: any) {
    console.error('Citation generation error:', error);

    return {
      success: false,
      error: error?.message || 'Failed to generate citation',
    };
  }
}

/**
 * Fallback citation generator when AI fails
 */
export function generateFallbackCitation(
  title?: string,
  author?: string,
  year?: string
): string {
  const authorPart = author || '[Author]';
  const yearPart = year || '[Year]';
  const titlePart = title || '[Title]';

  return `${authorPart} (${yearPart}). ${titlePart}. [PDF document].`;
}
