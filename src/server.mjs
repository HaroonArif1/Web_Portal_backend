import app from './app.mjs';
import { env } from './config/env.mjs';
import { connectDB } from './config/db.mjs';

const PORT = env.PORT || 4000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
