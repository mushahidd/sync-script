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
    // Support both OpenRouter and OpenAI
    const apiKey = process.env.OPENROUTER_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'No AI API key configured (set OPENROUTER_API_KEY or OPENAI_API_KEY)',
      };
    }

    // Construct prompt based on available metadata
    let prompt = '';
    
    if (title && author && year) {
      prompt = `Generate an APA format citation for an academic paper with the following details:
Title: ${title}
Author: ${author}
Year: ${year}

Please provide only the citation in proper APA format.`;
    } else if (title || author || year) {
      prompt = `Generate an APA format citation for an academic paper with the following available information:
${title ? `Title: ${title}` : ''}
${author ? `Author: ${author}` : ''}
${year ? `Year: ${year}` : ''}

Please provide only the citation in proper APA format. If any information is missing, use appropriate placeholders or format adjustments.`;
    } else if (fullText) {
      prompt = `Based on the following text from an academic paper, generate an APA format citation. Extract the title, author, year, and any other relevant publication information from the text:

${fullText}

Please provide only the citation in proper APA format.`;
    } else {
      return {
        success: false,
        error: 'No information provided for citation generation',
      };
    }

    const model = isOpenRouter 
      ? (process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct')
      : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
    
    const baseUrl = isOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(isOpenRouter ? { 'HTTP-Referer': 'https://syncscript.app' } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic citation assistant. Generate accurate APA format citations. Only respond with the citation, no additional text or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const citation = data.choices?.[0]?.message?.content?.trim();
    
    if (!citation) {
      return {
        success: false,
        error: 'Failed to generate citation from AI response',
      };
    }

    return {
      success: true,
      citation,
    };
  } catch (error) {
    console.error('Citation generation error:', error);
    return {
      success: false,
      error: 'Failed to generate citation: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

export function generateFallbackCitation(
  title?: string,
  author?: string,
  year?: string
): string {
  // Generate a basic citation format when AI fails
  const authorPart = author || '[Author]';
  const yearPart = year || '[Year]';
  const titlePart = title || '[Title]';
  
  return `${authorPart} (${yearPart}). ${titlePart}. [PDF Document].`;
}