import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { createApp } from './app/create-app.js';

await connectDatabase();

const app = createApp();
const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
