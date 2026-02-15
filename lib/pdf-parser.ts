import { createRequire } from 'module';
import * as Tesseract from 'tesseract.js';

// Set up global configuration to avoid verbosity error
process.env.VERBOSITY = '0';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

interface PDFData {
  text: string;
  pages?: number;
  info?: any;
  metadata?: any;
}

interface OCRResult {
  data: {
    text: string;
    confidence?: number;
  };
}

/** pdf-parse getText() return shape */
interface PDFGetTextResult {
  text: string;
  total: number;
}

export interface PDFParseResult {
  success: boolean;
  title?: string;
  author?: string;
  year?: string;
  fullText?: string;
  error?: string;
}

const DEFAULT_PARSE_TIMEOUT_MS = 15000;

export async function parsePDF(
  buffer: Buffer,
  options?: { timeoutMs?: number; enableOCR?: boolean }
): Promise<PDFParseResult> {
  try {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_PARSE_TIMEOUT_MS;
    const enableOCR = options?.enableOCR ?? process.env.ENABLE_PDF_OCR === 'true';

    // First, try pdf-parse for regular PDFs (pdf-parse v2 uses class constructor)
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    let pdfData: PDFData;
    try {
      const result = await withTimeout(
        parser.getText(),
        timeoutMs,
        'PDF parsing timed out'
      ) as PDFGetTextResult;
      pdfData = { text: result.text, pages: result.total };
    } finally {
      await parser.destroy();
    }

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      // If no text or very little text, optionally try OCR
      if (enableOCR) {
        return await parseWithOCR(buffer, timeoutMs);
      }

      return {
        success: false,
        error: 'No extractable text found in PDF',
      };
    }

    // Extract metadata from text
    const extractedData = extractMetadata(pdfData.text);
    
    return {
      success: true,
      ...extractedData,
      fullText: pdfData.text.substring(0, 2000), // First 2000 chars for AI context
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    const enableOCR = options?.enableOCR ?? process.env.ENABLE_PDF_OCR === 'true';
    if (enableOCR) {
      return await parseWithOCR(buffer, options?.timeoutMs ?? DEFAULT_PARSE_TIMEOUT_MS);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    };
  }
}

async function parseWithOCR(buffer: Buffer, timeoutMs: number): Promise<PDFParseResult> {
  try {
    console.log('Attempting OCR on PDF...');
    
    // Note: This is a simplified OCR approach
    // In production, you might want to convert PDF pages to images first
    const worker = await Tesseract.createWorker('eng');
    const ret = await withTimeout(worker.recognize(buffer), timeoutMs, 'OCR timed out') as OCRResult;
    await worker.terminate();
    
    if (!ret.data.text || ret.data.text.trim().length < 20) {
      return {
        success: false,
        error: 'Could not extract text from PDF using OCR'
      };
    }

    const extractedData = extractMetadata(ret.data.text);
    
    return {
      success: true,
      ...extractedData,
      fullText: ret.data.text.substring(0, 2000),
    };
  } catch (error) {
    console.error('OCR parsing error:', error);
    return {
      success: false,
      error: 'Failed to parse PDF with OCR: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function extractMetadata(text: string): { title?: string; author?: string; year?: string } {
  const result: { title?: string; author?: string; year?: string } = {};
  
  // Basic title extraction (first significant line)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length > 0) {
    // Look for title in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 10 && line.length < 200 && !isMetadataLine(line)) {
        result.title = line;
        break;
      }
    }
  }
  
  // Basic year extraction (4-digit years between 1900-2030)
  const yearMatch = text.match(/\b(19[4-9]\d|20[0-2]\d|203[0])\b/);
  if (yearMatch) {
    result.year = yearMatch[1];
  }
  
  // Basic author extraction (look for common patterns)
  const authorPatterns = [
    /(?:by\s+|author[s]?:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+,\s[A-Z]\.(?:\s[A-Z]\.)?)/,
  ];
  
  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.author = match[1].trim();
      break;
    }
  }
  
  return result;
}

function isMetadataLine(line: string): boolean {
  const metadataKeywords = ['page', 'copyright', '©', 'doi:', 'isbn', 'issn', 'url:', 'http'];
  return metadataKeywords.some(keyword => line.toLowerCase().includes(keyword));
}