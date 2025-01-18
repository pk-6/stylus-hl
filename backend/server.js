require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();


app.use(cors({
    origin: ['https://stylus-hl.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, projectName, tokenSymbol } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are helping generate content for a crypto project called ${projectName} (${tokenSymbol}).`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        res.json({ text: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});