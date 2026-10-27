import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Gemini Chat API endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, documentContext, currentDocumentName } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please provide messages array' });
    }

    const systemInstruction = `You are AuraPDF AI Copilot, an expert document analyst and intelligence engine embedded in AuraPDF Studio.
The user is working on the PDF document: "${currentDocumentName || 'Document.pdf'}".
${documentContext ? `DOCUMENT CONTENT FOR GROUNDING:\n"""\n${documentContext.slice(0, 40000)}\n"""` : 'No document text extracted yet.'}

Guidelines:
1. Answer questions about this specific document accurately, citing page numbers or sections whenever applicable.
2. If asked to summarize, provide clean executive bullet points with key outcomes and numbers.
3. If asked about redactions, point out confidential figures, bank account numbers, names, or addresses that the user should blackout using AuraPDF's Redaction tool.
4. If asked about signing or approval, highlight the signature lines and parties involved.
5. If the question is about general PDF editing, explain how to use AuraPDF tools (Draw, Highlight, Digital Signature, Stamp, Crop, Watermark, Merge, Page Color).
6. Be concise, highly professional, structured, and easy to read.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
