// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Ваш токен GitHub, лучше хранить через Render Secrets (переменные окружения)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'golod15t-glitch';
const REPO_NAME = 'guideFP_K15';
const FILE_PATH = 'articles/article1.json';

const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

// Для загрузки статьи
app.get('/article', async (req, res) => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Ошибка GitHub API при загрузке' });
    }

    const data = await response.json();
    // Декодируем base64
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    res.json({
      sha: data.sha,
      content: JSON.parse(content),
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Для сохранения статьи (PUT)
app.put('/article', async (req, res) => {
  const { title, content, sha } = req.body;

  if (!title || !content || !sha) {
    return res.status(400).json({ error: 'Неверный формат данных' });
  }

  const fileContent = JSON.stringify({ title, content }, null, 2);
  const encodedContent = Buffer.from(fileContent, 'utf-8').toString('base64');

  try {
    const response = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Обновление статьи: ${title}`,
        content: encodedContent,
        sha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || 'Ошибка GitHub API' });
    }

    const data = await response.json();
    res.json({
      message: 'Статья успешно сохранена',
      sha: data.content.sha,
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
