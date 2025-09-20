const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// GitHub API конфиг
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Установите в Render
const REPO_OWNER = 'guideFP_K15'; // Проверьте точное имя репозитория
const REPO_NAME = 'guideFP_K15'; // То же самое, если это пользовательский репозиторий

app.use(express.json());

// Эндпоинт для получения статьи (GET-запрос, который падает в логах)
app.get('/articles/:filename', async (req, res) => {
    const { filename } = req.params;
    const path = `articles/${filename}.html`; // Например, 'articles/article1.html'

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
        console.error('Ошибка при получении файла из GitHub:', error.response ? error.response.data : error.message);
        res.status(404).json({ error: 'Файл не найден в репозитории' });
    }
});

// Эндпоинт для сохранения статьи (POST, как в HTML)
app.post('/save-article', async (req, res) => {
    const { title, content, path } = req.body;

    try {
        // Сначала получите SHA файла (для обновления)
        const getResponse = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
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
        console.error('Ошибка при сохранении:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Ошибка при сохранении статьи' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
