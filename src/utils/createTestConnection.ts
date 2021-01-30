import { createConnection } from 'typeorm';

/**
 * Connect to the test database.
 */
export const createTestConnection = () => {
  return createConnection({
    name: 'default',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'ben',
    password: 'ben',
    database: 'postit_test',
    synchronize: true,
    dropSchema: true,
    entities: [`${__dirname}/../../src/entities/*.ts`],
  });
};
