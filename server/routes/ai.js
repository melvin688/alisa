import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// POST /api/ai/recommend - AI 咖啡推荐（代理 Gemini API）
router.post('/recommend', async (req, res) => {
  const { input, lang } = req.body || {};
  try {

    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service is not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const languageInstruction = lang === 'zh'
      ? "Respond in Chinese (Mandarin). Use elegant, flowery, sophisticated language suitable for a high-end luxury coffee brand."
      : "Respond in English. Use elegant, sophisticated, slightly whimsical language.";

    const prompt = `
      You are the Head Roaster and Concierge at 'Felix Inspired Roastery', a high-end, maximalist coffee brand.
      ${languageInstruction}
      The user will describe their taste preferences. You must recommend a coffee type (Origin, Roast Level, Tasting Notes) and explain why in a poetic way.
      Keep it under 80 words.
      
      User input: "${input.trim()}"
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = result.text || (lang === 'zh'
      ? '我们的礼宾正在调整研磨度，请稍后再试。'
      : 'Our concierge is currently polishing the espresso machine. Please try again.');

    res.json({ recommendation: text });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      error: lang === 'zh'
        ? '抱歉，AI服务暂时不可用。'
        : 'Sorry, AI service is temporarily unavailable.'
    });
  }
});

export default router;
