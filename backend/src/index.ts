import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database/database';

dotenv.config();


const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
