
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available as an environment variable
if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates a tutor bio using the Gemini API.
 * @param name The tutor's name.
 * @param subjects The subjects the tutor teaches.
 * @param experience The tutor's years of experience.
 * @returns A professionally crafted bio in Bengali.
 */
export const generateTutorBio = async (name: string, subjects: string, experience: string): Promise<string> => {
  try {
    const prompt = `
      Write a short, professional, and friendly tutor bio in Bengali. The bio should be encouraging for students and parents.
      
      Details:
      - Tutor's Name: ${name}
      - Teaches: ${subjects}
      - Experience: ${experience} years
      
      The bio should be about 3-4 sentences long. Highlight the tutor's expertise and positive teaching approach. Do not use markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating tutor bio:", error);
    return "দুঃখিত, এই মুহূর্তে বায়ো তৈরি করা সম্ভব হচ্ছে না। অনুগ্রহ করে নিজে লিখুন।";
  }
};
