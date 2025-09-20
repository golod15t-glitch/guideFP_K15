// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Создайте экземпляр Octokit с вашим токеном доступа
const octokit = new Octokit({ auth: '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' }); // Замените на ваш токен доступа

// Главная страница
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

// Эндпоинт для сохранения статьи
app.post('/save-article', async (req, res) => {
    const { title, content } = req.body;

    try {
        // Получите текущую информацию о файле
        const { data: { sha } } = await octokit.repos.getContent({
            owner: 'golod15t-glitch', // Замените на ваше имя пользователя GitHub
            repo: 'guideFP_K15',   // Замените на имя вашего репозитория
            path: 'articles/article1.html'   // Путь к файлу, который нужно обновить
        });

        // Отправьте изменения в файл
        await octokit.repos.createOrUpdateFileContents({
            owner: 'YOUR_GITHUB_USERNAME', // Замените на ваше имя пользователя GitHub
            repo: 'YOUR_REPOSITORY_NAME',   // Замените на имя вашего репозитория
            path: 'articles/article1.html',  // Путь к файлу, который нужно обновить
            message: 'Update article content',
            content: Buffer.from(content).toString('base64'),
            sha: sha,
        });

        res.status(200).send({ message: 'Article saved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error saving article.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
