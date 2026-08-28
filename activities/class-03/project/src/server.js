// Entry point: this file only starts the process. It does not know about routes.
import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Request API v3 is running on http://localhost:${PORT}`);
});