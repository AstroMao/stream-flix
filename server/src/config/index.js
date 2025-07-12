import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module (__dirname equivalent in ES Modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Construct the path to the root .env file.
// This goes up from 'server/src/config/' -> 'server/src/' -> 'server/' -> project root '/'
const envPath = path.resolve(__dirname, '..', '..', '.env');

// Load environment variables from the specific path
dotenv.config({ path: envPath });

const config = {
  port: process.env.SERVER_PORT || 3001,
  pocketbase: {
    url: process.env.POCKETBASE_URL, // No fallback needed, will be checked below
    adminEmail: process.env.POCKETBASE_ADMIN_EMAIL,
    adminPassword: process.env.POCKETBASE_ADMIN_PASSWORD,
  },
  media: {
    moviesRoot: process.env.MOVIES_ROOT || '/mnt/media/movies',
    seriesRoot: process.env.SERIES_ROOT || '/mnt/media/series',
    adsRoot: process.env.ADS_ROOT || '/mnt/media/ads',
  }
};

export default config;