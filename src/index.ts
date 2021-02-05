import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { createConnection } from 'typeorm';

import { createSchema, injectProperties } from './utils';

dotenv.config();

(async () => {
  // establish the connection to the database.
  await createConnection();

  // Set values on the injected properties.
  injectProperties();

  const app = express();
  const cookieSecret = process.env.COOKIE_SECRET || 'cookiesecret';

  app.use(cookieParser(cookieSecret));
  // builds the GraphQL schema using the resolver classes.
  const schema = await createSchema();
  const server = new ApolloServer({
    context: ({ req, res }) => ({ req, res }),
    schema,
  });

  server.applyMiddleware({ app });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
