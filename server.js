const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/save-article', async (req, res) => {
    const { title, content } = req.body;

    const token = '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'; // Замените на ваш токен
    const repo = 'guideFP_K15'; // Замените на ваш репозиторий
    const path = 'articles/article1.html'; // Путь к файлу, который вы хотите обновить

    try {
        // Получение текущего содержимого файла
        const { data: { content: currentContent, sha } } = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        // Создание нового содержимого
        const newContent = Buffer.from(content).toString('base64');

        // Обновление файла
        await axios.put(`https://api.github.com/repos/${repo}/contents/${path}`, {
            message: `Обновление статьи: ${title}`,
            content: newContent,
            sha: sha
        }, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        res.status(200).send('Статья успешно сохранена в репозитории!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при сохранении статьи.');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
