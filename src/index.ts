import 'reflect-metadata';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

import App from './App';
import { createTestConnection } from './utils';

dotenv.config();

(async () => {
  try {
    if (process.env.CYPRESS_TEST) {
      await createTestConnection();
    } else {
      // establish the connection to the database.
      await createConnection();
    }
  } catch (e) {
    // eslint-disable-next-line
    console.log('error connecting to the db: ', e);
  }

  const app = new App();

  app.listen();
})();
