import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image using Tesseract.js (OCR).
 * This runs entirely client-side.
 */
export async function extractTextFromImage(imageSrc: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageSrc,
      'eng', // Language
      { logger: m => console.log(m) } // Optional logger
    );
    return result.data.text;
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error('Failed to extract text from image.');
  }
}
