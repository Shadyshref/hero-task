import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import projectsRouter from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(express.json({ limit: '5mb' })); 

app.use('/api/projects', projectsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
