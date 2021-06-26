import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { createConnection, getRepository } from 'typeorm';

import {
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Profile,
  User,
} from './entities';
import {
  createEmailTemplate,
  createRedisClient,
  createTestConnection,
  createTransporter,
  createSchema,
  formatResponse,
} from './utils';

dotenv.config();

(async () => {
  if (process.env.CYPRESS_TEST) {
    await createTestConnection();
  } else {
    // establish the connection to the database.
    await createConnection();
  }

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
  Container.set(
    'emailNotificationPreferencesRepository',
    getRepository(EmailNotificationPreferences)
  );
  Container.set('transporter', await createTransporter());
  Container.set('jwt', jwt);
  Container.set('redisClient', createRedisClient());
  Container.set('emailTemplate', createEmailTemplate());

  const app = express();
  const cookieSecret = process.env.COOKIE_SECRET || 'cookiesecret';

  app.use(cookieParser(cookieSecret));
  app.use(
    helmet({
      // play nice with graphql playground
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    })
  );

  // builds the GraphQL schema using the resolver classes.
  const schema = await createSchema();
  const server = new ApolloServer({
    context: ({ req, res }) => ({ req, res }),
    // @ts-ignore
    formatResponse,
    schema,
  });
  const cors = {
    // send relevant cookies
    credentials: true,
    methods: ['POST'],
    // should match the origin of the request
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  };

  server.applyMiddleware({
    app,
    cors,
  });

  app.listen(4000, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
