import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import dotenv from 'dotenv';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import {
  EmailNotificationPreferences,
  GeneralPreferences,
  NotificationPreferences,
  Profile,
  User,
} from '../../../src/entities';
import {
  createTestConnection,
  createSchema,
  formatResponse,
  TestUtils,
} from '../../../src/utils';

dotenv.config();

describe('UserResolver integration', () => {
  let query: any;
  let testUtils: TestUtils;

  beforeAll(async () => {
    testUtils = new TestUtils(await createTestConnection());

    Container.set('userRepository', getRepository(User));
    Container.set(
      'emailNotificationPreferencesRepository',
      getRepository(EmailNotificationPreferences)
    );
    Container.set(
      'notificationPreferencesRepository',
      getRepository(NotificationPreferences)
    );
    Container.set(
      'generalPreferencesRepository',
      getRepository(GeneralPreferences)
    );
    Container.set('profileRepository', getRepository(Profile));

    const schema = await createSchema();
    const server = new ApolloServer({
      context: () => ({ res: { cookie: jest.fn() } }),
      // @ts-ignore
      formatResponse,
      schema,
    });

    const testServer = createTestClient(server);

    query = testServer.query;
  });

  beforeEach(async () => {
    await testUtils.clearTables('users');
  });

  afterAll(async () => {
    await testUtils.closeConnection();
  });

  describe('Queries', () => {
    const isUsernameUnique = `
			query IsUsernameUnique($username: String!) {
				isUsernameUnique(username: $username)
			}
		`;

    describe('isUsernameUnique', () => {
      it('should succeed when it meets the length requirements and isnt in the db', async () => {
        const expected = { isUsernameUnique: true };
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'benbenben',
          },
        });

        expect(response.data).toEqual(expected);
      });

      it('should fail when username less than 3 characters', async () => {
        const expected = [
          {
            field: 'username',
            constraints: {
              minLength: 'Username must be between 3 and 20 characters',
            },
          },
        ];
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'b',
          },
        });

        expect(response.errors).toEqual(expected);
      });

      it('should fail when username greater than 20 characters', async () => {
        const expected = [
          {
            field: 'username',
            constraints: {
              maxLength: 'Username must be between 3 and 20 characters',
            },
          },
        ];
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'benjskfajalkjfksajdfjalsfdkjsa',
          },
        });

        expect(response.errors).toEqual(expected);
      });
    });
  });
});
