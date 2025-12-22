
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API Key found in .env');
    return;
  }

  console.log('Using API Key:', apiKey.substring(0, 5) + '...');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: accessing the model manager to list models might not be directly exposed 
    // in the simplified high-level usage, but let's try a direct fetch if the SDK 
    // doesn't have a helper, or use the specific SDK method if available.
    // In @google/generative-ai, there isn't a direct `listModels` on the main class 
    // in some versions, but let's check if we can just try a simple generation 
    // with a "known good" model to see if it works, or catch the error.
    
    // Actually, let's try the most basic 'gemini-pro' again, but logging everything.
    // If listModels isn't easy, we will try to probe.
    
    // Better approach: use the REST API to list models to be sure what the key sees.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
            console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.error('Failed to list models:', data);
    }
    
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
