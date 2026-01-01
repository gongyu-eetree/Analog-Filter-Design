
import { GoogleGenAI } from "@google/genai";
import { FilterParams } from "../types";

export async function getFilterInsights(params: FilterParams) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this analog filter design:
    - Type: ${params.type}
    - Topology: ${params.topology}
    - Order: ${params.order}
    - Cutoff Frequency: ${params.cutoffFreq} Hz
    ${params.type === 'BAND_PASS' ? `- Second Cutoff: ${params.cutoffFreq2} Hz` : ''}
    - Target Gain: ${params.gain} V/V (Active only)
    
    Provide a professional engineering summary covering:
    1. The significance of choosing order ${params.order} for this configuration.
    2. Expected roll-off rate (dB/decade).
    3. Potential real-world implementation challenges (component tolerances, op-amp bandwidth).
    4. Suggested applications for this specific filter.
    Keep it concise and technical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Unable to generate AI insights at this time.";
  }
}
