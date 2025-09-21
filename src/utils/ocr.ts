import { recognize } from 'tesseract.js';

export const extractTextFromImage = async (imageData: string): Promise<string> => {
  try {
    const result = await recognize(imageData, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    return result.data.text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const findProductMatches = (extractedText: string, productModels: string[]): string[] => {
  const text = extractedText.toUpperCase().replace(/\s+/g, ' ');
  const matches: string[] = [];
  
  productModels.forEach(model => {
    const modelPattern = model.toUpperCase().replace(/[-_]/g, '[-_\\s]?');
    const regex = new RegExp(modelPattern, 'i');
    
    if (regex.test(text) || text.includes(model.toUpperCase())) {
      matches.push(model);
    }
  });
  
  return matches;
};

// No longer needed with the simplified approach
export const terminateOCR = async () => {
  // No cleanup needed with direct recognize method
};