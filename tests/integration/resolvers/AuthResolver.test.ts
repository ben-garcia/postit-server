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
  formatResponse,
  TestUtils,
} from '../../../src/utils';
import {
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Profile,
  User,
} from '../../../src/entities';

dotenv.config();

describe('AuthResolver integration', () => {
  let mutate: any;
  let testUtils: TestUtils;
  const signUpMutation = `
	mutation Register($createUserData: SignUpInput!) {
		signUp(createUserData: $createUserData) {
			created
			errors {
				field
				constraints {
					isEmail
					maxLength
					minLength
				}
			}
		}
	}
`;
  const fakeUser = {
    email: 'ben@ben.com',
    username: 'benben',
    password: 'benbenben',
  };

  beforeAll(async () => {
    testUtils = new TestUtils(await createTestConnection());

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

    const schema = await createSchema();
    const server = new ApolloServer({
      context: () => ({ res: { cookie: jest.fn() } }),
      // @ts-ignore
      formatResponse,
      schema,
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
    describe('signUp', () => {
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

        const expected = { signUp: { errors: null, created: true } };
        const response = await mutate({
          mutation: signUpMutation,
          variables: {
            createUserData: fakeUser,
          },
        });

        expect(response.data).toEqual(expected);
      });

      it('should succesfully create a user without an email', async () => {
        // Mock the implementation of the MailService.sendVerificationEmail
        // There is no need to send test email to ethereal during testing.
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = { signUp: { errors: null, created: true } };
        const response = await mutate({
          mutation: signUpMutation,
          variables: {
            createUserData: {
              username: fakeUser.username,
              password: fakeUser.password,
            },
          },
        });

        expect(response.data).toEqual(expected);
      });

      describe('email', () => {
        it('should fail when email isnt formated correctly', async () => {
          const expected = [
            {
              field: 'email',
              constraints: {
                isEmail: 'email must be an email',
              },
            },
          ];
          const response = await mutate({
            mutation: signUpMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben.com',
                username: 'benbenben',
              },
            },
          });

          expect(response.errors).toEqual(expected);
        });
      });

      describe('username', () => {
        it('should fail when trying to add user with a username that is already taken', async () => {
          await testUtils
            .getConnection()
            .getRepository(User)
            .create(fakeUser)
            .save();

          const expected = [
            {
              field: 'username',
              constraints: {
                isUsernameUnique: 'That username is already taken',
              },
            },
          ];
          const response = await mutate({
            mutation: signUpMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
              },
            },
          });

          expect(response.errors).toEqual(expected);
        });

        it('should fail when username is less than 3 characters', async () => {
          const expected = [
            {
              field: 'username',
              constraints: {
                minLength: 'Username must be between 3 and 20 characters',
              },
            },
          ];
          const response = await mutate({
            mutation: signUpMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
                username: 'be',
              },
            },
          });
          expect(response.errors).toEqual(expected);
        });

        it('should fail when username is greater than 20 characters', async () => {
          const expected = [
            {
              field: 'username',
              constraints: {
                maxLength: 'Username must be between 3 and 20 characters',
              },
            },
          ];
          const response = await mutate({
            mutation: signUpMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                email: 'ben2@ben.com',
                username: 'thisisaverylongpassword',
              },
            },
          });
          expect(response.errors).toEqual(expected);
        });
      });

      it('should fail when password is less than 8 characters', async () => {
        const expected = [
          {
            field: 'password',
            constraints: {
              minLength: 'Password must be at least 8 characters long',
            },
          },
        ];
        const response = await mutate({
          mutation: signUpMutation,
          variables: {
            createUserData: {
              email: 'ben2@ben.com',
              username: 'benbenben',
              password: 'ben',
            },
          },
        });

        expect(response.errors).toEqual(expected);
      });
    });
  });
});
