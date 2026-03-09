const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 从环境变量读取豆包 API Key
const DOUBAO_CONFIG = {
  apiKey: process.env.DOUBAO_API_KEY,
  apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  model: 'doubao-pro'
};

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/doubao/chat', async (req, res) => {
  try {
    const requestData = {
      model: DOUBAO_CONFIG.model,
      messages: req.body.messages || [],
      stream: req.body.stream || true,
      temperature: req.body.temperature || 0.7,
      tools: req.body.tools || [
        { type: 'code_interpreter', enabled: true },
        { type: 'web_search', enabled: true }
      ]
    };

    const response = await axios({
      method: 'POST',
      url: DOUBAO_CONFIG.apiUrl,
      headers: {
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      responseType: req.body.stream ? 'stream' : 'json'
    });

    if (req.body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('豆包API调用失败:', error.message);
    res.status(500).json({ error: '服务暂时不可用' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '后端代理服务运行正常' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});
