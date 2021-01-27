import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import express from 'express';
import { createConnection } from 'typeorm';

(async () => {
  const app = express();
  const schema = await buildSchema({
    resolvers: [`${__dirname}/resolvers/*.ts`],
  });

  await createConnection();

  const server = new ApolloServer({ schema });

  server.applyMiddleware({ app });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
