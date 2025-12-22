import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API Key found in .env');
    return;
  }

  console.log('Using API Key:', apiKey.substring(0, 5) + '...');
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try with the configured model
  const modelName = "gemini-1.5-flash";
  console.log(`Testing model: ${modelName}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log('Response:', response.text());
    console.log('SUCCESS: Model is working!');
  } catch (error: any) {
    console.error('ERROR calling generateContent:', error);
    if (error.response) {
        console.error('Error Response:', error.response);
    }
  }
}

testGenAI();
