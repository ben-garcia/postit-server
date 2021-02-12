import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import { MailService, RedisService } from '../../../src/services';
import {
  createEmailTemplate,
  createRedisClient,
  createTestConnection,
  createTransporter,
  createSchema,
  TestUtils,
} from '../../../src/utils';
import { GeneralPreferences, Profile, User } from '../../../src/entities';

dotenv.config();

describe('AuthResolver integration', () => {
  let mutate: any;
  let testUtils: TestUtils;
  const registerMutation = `
	mutation Register($createUserData: RegisterInput!) {
		register(createUserData: $createUserData)
	}
`;
  const fakeUser = {
    email: 'ben@ben.com',
    username: 'benben',
    password: 'benben',
  };

  beforeAll(async () => {
    testUtils = new TestUtils(await createTestConnection());

    Container.set('userRepository', getRepository(User));
    Container.set('profileRepository', getRepository(Profile));
    Container.set(
      'generalPreferencesRepository',
      getRepository(GeneralPreferences)
    );
    Container.set('transporter', await createTransporter());
    Container.set('jwt', jwt);
    Container.set('redisClient', createRedisClient());
    Container.set('emailTemplate', createEmailTemplate());

    const schema = await createSchema();
    const server = new ApolloServer({
      schema,
      context: () => ({ res: { cookie: jest.fn() } }),
    });

    const testServer = createTestClient(server);

    mutate = testServer.mutate;
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await testUtils.clearTables('users');
  });

  afterAll(async () => {
    await testUtils.closeConnection();
  });

  describe('Mutations', () => {
    describe('register', () => {
      it('should succesfully create a user', async () => {
        // Mock the implementation of the MailService.sendVerificationEmail
        // There is no need to send test email to ethereal during testing.
        jest
          .spyOn(MailService.prototype, 'sendVerificationEmail')
          // @ts-ignore
          .mockImplementation(() => ({
            sendMail: jest.fn().mockReturnValue({
              then: jest.fn(),
              catch: jest.fn(),
              response: {
                length: jest.fn(),
                lastIndexOf: jest.fn(),
                substring: jest.fn(),
              },
            }),
          }));

        // Mock the implementation of the MailService.sendVerificationEmail
        // There is no need to send test email to ethereal during testing.
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = { register: true };
        const response = await mutate({
          mutation: registerMutation,
          variables: {
            createUserData: fakeUser,
          },
        });

        expect(response.data).toEqual(expected);
      });

      describe('email', () => {
        it('should fail when email isnt an email format', async () => {
          const expected = 'email must be an email';
          const response = await mutate({
            mutation: registerMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben.com',
                username: 'benbenben',
              },
            },
          });
          const errors =
            response.errors[0].extensions.exception.validationErrors;

          expect(errors.length).toBe(1);
          expect(errors[0].constraints.isEmail).toEqual(expected);
        });
      });

      describe('username', () => {
        it('should fail when trying to add user with a username that is already taken', async () => {
          await testUtils
            .getConnection()
            .getRepository(User)
            .create(fakeUser)
            .save();

          const expected = 'That username is already taken';
          const response = await mutate({
            mutation: registerMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
              },
            },
          });
          const errors =
            response.errors[0].extensions.exception.validationErrors;

          expect(errors.length).toBe(1);
          expect(errors[0].constraints.isUsernameUnique).toEqual(expected);
        });

        it('should fail when username is less than 3 characters', async () => {
          const expected = 'Username must be between 3 and 20 characters';
          const response = await mutate({
            mutation: registerMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
                username: 'be',
              },
            },
          });
          const errors =
            response.errors[0].extensions.exception.validationErrors;

          expect(errors.length).toBe(1);
          expect(errors[0].constraints.minLength).toEqual(expected);
        });

        it('should fail when username is greater than 20 characters', async () => {
          const expected = 'Username must be between 3 and 20 characters';
          const response = await mutate({
            mutation: registerMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
                username: 'thisisaverylongpassword',
              },
            },
          });
          const errors =
            response.errors[0].extensions.exception.validationErrors;

          expect(errors.length).toBe(1);
          expect(errors[0].constraints.maxLength).toEqual(expected);
        });
      });

      it('should fail when password is less than 6 characters', async () => {
        const expected = 'Password must be at least 6 characters long';
        const response = await mutate({
          mutation: registerMutation,
          variables: {
            createUserData: {
              email: 'ben2@ben.com',
              username: 'benbenben',
              password: 'ben',
            },
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.minLength).toEqual(expected);
      });
    });
  });
});
