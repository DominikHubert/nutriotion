const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Helper to get OpenAI client on demand
function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API Key. Please set OPENAI_API_KEY in .env");
    }
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

router.post('/food', async (req, res) => {
    try {
        const { image, provider } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const base64Data = image.split(',')[1];
        const promptText = `
        Analysiere dieses Essens-Bild. Identifiziere die Komponenten.
        Gib NUR ein valides JSON-Objekt zurück (kein Markdown):
        {
            "foods": [
                { "name": "Lebensmittel Name", "calories": 100, "weight_g": 100, "protein_g": 5, "carbs_g": 10, "fat_g": 5 }
            ]
        }
        Schätze die Werte so gut es geht.
        `;

        let jsonString = "";

        if (provider === 'openai') {
            console.log("Using OpenAI for Food Analysis...");
            const openai = getOpenAIClient();
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            {
                                type: "image_url",
                                image_url: {
                                    "url": image, // OpenAI accepts data:image/...
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            });
            const content = response.choices[0].message.content;
            jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
        } else {
            // Default to Gemini
            console.log("Using Gemini for Food Analysis...");
            const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ model: modelName });

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            };

            const result = await model.generateContent([promptText, imagePart]);
            const response = await result.response;
            const text = response.text();
            jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const data = JSON.parse(jsonString);
            res.json(data);
        } catch (e) {
            console.error("JSON Parse Error:", jsonString);
            res.status(500).json({ error: 'Failed to parse AI response', raw: jsonString });
        }
    } catch (error) {
        console.error('AI API Error (Food):', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/food-text', async (req, res) => {
    try {
        const { text, provider } = req.body;
        if (!text) return res.status(400).json({ error: 'No text provided' });

        const promptText = `
        Analysiere folgende Essens-Beschreibung: "${text}".
        Gib NUR ein valides JSON-Objekt zurück (kein Markdown):
        {
            "foods": [
                { "name": "Lebensmittel Name", "calories": 100, "weight_g": 100, "protein_g": 5, "carbs_g": 10, "fat_g": 5 }
            ]
        }
        Schätze die Werte so gut es geht.
        `;

        let jsonString = "";

        if (provider === 'openai') {
            console.log("Using OpenAI for Food Text Analysis...");
            const openai = getOpenAIClient();
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o",
                messages: [{ role: "user", content: promptText }],
            });
            const content = response.choices[0].message.content;
            jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
        } else {
            // Default to Gemini
            console.log("Using Gemini for Food Text Analysis...");
            const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(promptText);
            const response = await result.response;
            jsonString = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const data = JSON.parse(jsonString);
            res.json(data);
        } catch (e) {
            console.error("JSON Parse Error:", jsonString);
            res.status(500).json({ error: 'Failed to parse AI response', raw: jsonString });
        }
    } catch (error) {
        console.error('AI API Error (Food Text):', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/sport', async (req, res) => {
    try {
        const { text, weight, provider } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        const promptText = `
        Analysiere folgende Sport-Beschreibung: \"${text}\".
        Nutzergewicht: ${weight || 70}kg.
        Schätze die verbrannten Kalorien basierend auf der Aktivität, Intensität und Dauer.
        Wenn keine Dauer angegeben ist, schätze eine typische Dauer (z.B. 30 min) oder frage nicht nach, sondern triff eine Annahme, die zur Beschreibung passt.
        Gib NUR ein valides JSON-Objekt zurück (kein Markdown):
        {
            "name": "Name der Aktivität",
            "calories": 300,
            "duration_min": 30,
            "intensity": "moderate"
        }
        `;

        let jsonString = "";

        if (provider === 'openai') {
            console.log("Using OpenAI for Sport Analysis...");
            const openai = getOpenAIClient();
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o",
                messages: [
                    { role: "user", content: promptText },
                ],
            });
            const content = response.choices[0].message.content;
            jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
        } else {
            // Default to Gemini
            console.log("Using Gemini for Sport Analysis...");
            const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(promptText);
            const response = await result.response;
            const text = response.text();
            jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const data = JSON.parse(jsonString);
            res.json(data);
        } catch (e) {
            console.error("JSON Parse Error:", jsonString);
            res.status(500).json({ error: 'Failed to parse AI response', raw: jsonString });
        }
    } catch (error) {
        console.error('AI API Error (Sport):', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
