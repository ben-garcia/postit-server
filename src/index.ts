import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { createConnection, getRepository } from 'typeorm';

import {
  GeneralPreferences,
  NotificationPreferences,
  Profile,
  User,
} from './entities';
import {
  createEmailTemplate,
  createRedisClient,
  createTransporter,
  createSchema,
} from './utils';

dotenv.config();

(async () => {
  // establish the connection to the database.
  await createConnection();

  // Set values on the injected properties.
  Container.set('userRepository', getRepository(User));
  Container.set('profileRepository', getRepository(Profile));
  Container.set(
    'generalPreferencesRepository',
    getRepository(GeneralPreferences)
  );
  Container.set(
    'notificationPreferencesRepository',
    getRepository(NotificationPreferences)
  );
  Container.set('transporter', await createTransporter());
  Container.set('jwt', jwt);
  Container.set('redisClient', createRedisClient());
  Container.set('emailTemplate', createEmailTemplate());

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
