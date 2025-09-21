const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());

// Замените на свой токен GitHub (лучше хранить в настройках Render или .env)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'golod15t-glitch';
const REPO_NAME = 'guideFP_K15';
const FILE_PATH = 'articles/article1.json';

const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

// Маршрут API: Получить статью
app.get('/article', async (req, res) => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.status} ${response.statusText}` });
    }

    const data = await response.json();
    const contentStr = Buffer.from(data.content, 'base64').toString('utf8');
    res.json({ sha: data.sha, content: JSON.parse(contentStr) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Маршрут API: Сохранить статью
app.put('/article', async (req, res) => {
  const { title, content, sha } = req.body;

  if (!title || !content || !sha) {
    return res.status(400).json({ error: 'Missing title, content or sha' });
  }

  try {
    const jsonContent = JSON.stringify({ title, content }, null, 2);
    const encodedContent = Buffer.from(jsonContent, 'utf8').toString('base64');

    const response = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update article: ${title}`,
        content: encodedContent,
        sha,
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.message || 'GitHub API error' });
    }

    const data = await response.json();
    res.json({ message: 'Article updated', sha: data.content.sha });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отдаём статические файлы фронтенда из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Для любых других маршрутов отдаём index.html — полезно, если используете роутинг на фронтенде
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
