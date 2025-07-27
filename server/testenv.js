import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);
console.log('CWD:', process.cwd());