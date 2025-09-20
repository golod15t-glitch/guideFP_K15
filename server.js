const express = require('express');
const axios = require('axios');  // Это вызовет ошибку, если axios не установлен
const app = express();
const PORT = process.env.PORT || 10000;

// GitHub API конфиг
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Установите в Render
const REPO_OWNER = 'guideFP_K15';
const REPO_NAME = 'guideFP_K15';

app.use(express.json());

// Эндпоинт для получения статьи
app.get('/articles/:filename', async (req, res) => {
    const { filename } = req.params;
    const path = `articles/${filename}.html`;

    console.log(`[LOG] Получение файла: ${path} из репозитория ${REPO_OWNER}/${REPO_NAME}`);

    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.send(content);
    } catch (error) {
        console.error('[ERROR] Ошибка при получении файла:', error.response ? error.response.status : error.message);
        res.status(404).json({ error: 'Файл не найден. Проверьте путь и токен.' });
    }
});

// Эндпоинт для сохранения статьи
app.post('/save-article', async (req, res) => {
    const { title, content, path } = req.body;

    console.log(`[LOG] Сохранение файла: ${path} с заголовком: ${title}`);

    try {
        // Получите SHA (если файл существует)
        const getResponse = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });

        const sha = getResponse.data.sha;

        // Обновите файл
        const updateResponse = await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            message: `Обновление статьи: ${title}`,
            content: Buffer.from(content).toString('base64'),
            sha: sha
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });

        res.json({ message: 'Статья сохранена успешно!' });
    } catch (error) {
        console.error('[ERROR] Ошибка при сохранении:', error.response ? error.response.status : error.message);
        res.status(500).json({ error: 'Ошибка при сохранении. Проверьте токен и репозиторий.' });
    }
});

app.listen(PORT, () => {
    console.log(`[LOG] Сервер запущен на http://localhost:${PORT}`);
});
