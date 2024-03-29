import { ApolloServer } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import {
  Community,
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Post,
  Profile,
  User,
} from './entities';
import {
  createEmailTemplate,
  createRedisClient,
  createTransporter,
  createSchema,
  formatResponse,
} from './utils';

dotenv.config();

class App {
  public app: Application;
  public server: ApolloServer;

  constructor() {
    this.app = express();

    this.initializeMiddleware();
    this.initializeServer();
  }

  private async initializeMiddleware() {
    const cookieSecret = process.env.COOKIE_SECRET || 'cookiesecret';

    this.app.use(cookieParser(cookieSecret));
    this.app.use(
      helmet({
        // play nice with graphql playground
        contentSecurityPolicy:
          process.env.NODE_ENV === 'production' ? undefined : false,
      })
    );

    // Set values on the injected properties.
    Container.set('communityRepository', getRepository(Community));
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
    Container.set('postRepository', getRepository(Post));
    Container.set('userRepository', getRepository(User));
    Container.set('transporter', await createTransporter());
    Container.set('bcrypt', bcrypt);
    Container.set('jwt', jwt);
    Container.set('redisClient', createRedisClient());
    Container.set('emailTemplate', createEmailTemplate());
  }

  private async initializeServer() {
    // builds the GraphQL schema using the resolver classes.
    const schema = await createSchema();

    this.server = new ApolloServer({
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

    this.server.applyMiddleware({
      app: this.app,
      cors,
    });
  }

  public async listen() {
    this.app.listen(4000, () =>
      // eslint-disable-next-line no-console
      console.log(
        `🚀 Server ready at http://localhost:4000${this.server.graphqlPath}`
      )
    );
  }
}

export default App;
