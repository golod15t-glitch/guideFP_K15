const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Инициализация Octokit с токеном из переменных окружения
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // Токен должен быть в .env
});

// Настройка CORS
app.use(cors());
app.use(bodyParser.json());

app.post('/save-article', async (req, res) => {
  const { title, content, path } = req.body; // path - путь к файлу, например, 'articles/article1.html'

  if (!title || !content || !path) {
    return res.status(400).json({ error: 'Отсутствуют обязательные поля: title, content или path.' });
  }

  const repo = process.env.GITHUB_REPO || 'guideFP_K15'; // Репозиторий из переменных окружения
  const owner = process.env.GITHUB_OWNER || 'golod15t-glitch'; // Владелец репозитория (ваш username)

  try {
    // Получение текущего содержимого файла
    const { data: { content: currentContent, sha } } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    // Создание нового содержимого в base64
    const newContent = Buffer.from(content).toString('base64');

    // Обновление файла
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Обновление статьи: ${title}`,
      content: newContent,
      sha: sha
    });

    res.status(200).json({ message: 'Статья успешно сохранена в репозитории!' });
  } catch (error) {
    console.error('Ошибка при сохранении статьи:', error.message);
    res.status(500).json({ error: 'Ошибка при сохранении статьи. Проверьте токен и права доступа.' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
