const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Загружает ключи из файла .env
const fetch = require('node-fetch');

const app = express();
const port = 3001; // Сервер будет работать на этом порту

// Разрешаем нашему приложению (которое на порту 5173) общаться с сервером
app.use(cors()); 
app.use(express.json()); // Позволяем серверу читать JSON-запросы

// Главная "дверь", в которую будет стучаться наше приложение
app.post('/generate', async (req, res) => {
    const { prompt, model } = req.body; // Получаем промпт и ID модели от приложения
    
    console.log(`Получен запрос для модели: ${model} с промптом: "${prompt}"`);

    try {
        let generatedText = '';

        if (model === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка от Google API: ${response.statusText}`);
            }

            const data = await response.json();
            generatedText = data.candidates[0].content.parts[0].text;

        } else if (model === 'chatgpt4') {
            const apiKey = process.env.OPENAI_API_KEY;
            const url = 'https://api.openai.com/v1/chat/completions';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4", // Указываем конкретную модель
                    messages: [{ role: "user", content: prompt }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка от OpenAI API: ${response.statusText}`);
            }

            const data = await response.json();
            generatedText = data.choices[0].message.content;
        
        } else {
             throw new Error('Неизвестная модель');
        }

        res.json({ success: true, text: generatedText });

    } catch (error) {
        console.error("Произошла ошибка:", error);
        res.status(500).json({ success: false, message: 'Не удалось получить ответ от AI' });
    }
});

app.listen(port, () => {
    console.log(`✅ Сервер запущен и слушает на http://localhost:${port}`);
});