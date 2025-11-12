const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Test server running' });
});

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

// 防止进程退出
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});
