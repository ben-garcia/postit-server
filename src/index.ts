import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { Container } from 'typedi';
import express from 'express';
import { createConnection, getRepository } from 'typeorm';

import { User } from './entities';
import { createSchema } from './utils/createSchema';

(async () => {
  // establish the connection to the database.
  await createConnection();

  // Set the User repository as the injected property
  // on the UserService.
  Container.set('userRepository', getRepository(User));

  const app = express();
  // builds the GraphQL schema using the resolver classes.
  const schema = await createSchema();
  const server = new ApolloServer({ schema });

  server.applyMiddleware({ app });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
