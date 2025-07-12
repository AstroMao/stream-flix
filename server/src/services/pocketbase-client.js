import PocketBase from 'pocketbase';
import config from '../config/index.js';

// Create a new PocketBase instance using the URL from your config
const pb = new PocketBase(config.pocketbase.url);

/**
 * Authenticates the PocketBase client as a superuser.
 * This is a self-invoking async function to ensure the client is authenticated on startup.
 * It will use the admin credentials from your .env file via the config.
 */
(async () => {
  try {
    console.log('Authenticating PocketBase superuser...');
    // MODIFIED: Use the '_superusers' collection for authentication
    await pb.collection('_superusers').authWithPassword(
      config.pocketbase.adminEmail,
      config.pocketbase.adminPassword
    );
    console.log('PocketBase superuser authenticated successfully.');
  } catch (error) {
    console.error('FATAL: Could not authenticate PocketBase superuser.', error);
    // Exit the process if admin authentication fails, as the scanner cannot run.
    process.exit(1);
  }
})();

// Set up an auto-reauthentication hook. If the auth token expires,
// this will automatically attempt to log in again.
pb.authStore.onChange((token, model) => {
  if (!token && model === null) {
    console.log('PocketBase token expired or cleared. Re-authenticating...');
    // MODIFIED: Use the '_superusers' collection for re-authentication
    pb.collection('_superusers').authWithPassword(
      config.pocketbase.adminEmail,
      config.pocketbase.adminPassword
    ).catch(err => {
      console.error('Failed to re-authenticate PocketBase superuser:', err);
    });
  }
});


export default pb;
