import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import express from 'express';
import { Container } from 'typedi';
import { createConnection, getRepository } from 'typeorm';

import { User } from './entities';
import { createTransporter, createSchema } from './utils';

dotenv.config();

(async () => {
  // establish the connection to the database.
  await createConnection();

  // Set values on the injected properties.
  Container.set('userRepository', getRepository(User));
  Container.set('transporter', await createTransporter());

  const app = express();
  // builds the GraphQL schema using the resolver classes.
  const schema = await createSchema();
  const server = new ApolloServer({
    schema,
  });

  server.applyMiddleware({ app });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
