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
      schema,
      context: () => ({ res: { cookie: jest.fn() } }),
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
        const expected = 'Username must be between 3 and 20 characters';
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'b',
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.minLength).toEqual(expected);
      });

      it('should fail when username greater than 20 characters', async () => {
        const expected = 'Username must be between 3 and 20 characters';
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'benjskfajalkjfksajdfjalsfdkjsa',
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.maxLength).toEqual(expected);
      });
    });
  });
});
