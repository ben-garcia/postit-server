import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import {
  createEmailTemplate,
  createRedisClient,
  createTestConnection,
  createTransporter,
  createSchema,
  TestUtils,
} from '../../../src/utils';
import { User } from '../../../src/entities';

dotenv.config();

describe('AuthResolver integration', () => {
  let query: any;
  let testUtils: TestUtils;
  const fakeUser = {
    email: 'ben@ben.com',
    username: 'benben',
    password: 'benben',
  };

  beforeAll(async () => {
    testUtils = new TestUtils(await createTestConnection());

    Container.set('userRepository', getRepository(User));
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

    query = testServer.query;
  });

  beforeEach(async () => {
    await testUtils.clearTables('users');
  });

  afterAll(async () => {
    await testUtils.closeConnection();
  });

  describe('Queries', () => {
    const isEmailUniqueQuery = `
			query IsEmailUnique($email: String!) {
			  isEmailUnique(email: $email)
		  }
		`;
    const isUsernameUnique = `
			query IsUsernameUnique($username: String!) {
				isUsernameUnique(username: $username)
			}
		`;

    describe('isEmailUnique', () => {
      it('should succeed when its a valid email and it isnt in the db', async () => {
        const expected = { isEmailUnique: true };
        const response = await query({
          query: isEmailUniqueQuery,
          variables: {
            email: 'ben2@ben.com',
          },
        });

        expect(response.data).toEqual(expected);
      });

      it('should fail when email exists in the db', async () => {
        await testUtils
          .getConnection()
          .getRepository(User)
          .create(fakeUser)
          .save();

        const expected = 'That email is already taken';
        const response = await query({
          query: isEmailUniqueQuery,
          variables: {
            email: fakeUser.email,
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.isEmailUnique).toEqual(expected);
      });

      it('should fail when email is invalid', async () => {
        const expected = 'email must be an email';
        const response = await query({
          query: isEmailUniqueQuery,
          variables: {
            email: 'ben.com',
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.isEmail).toEqual(expected);
      });
    });

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

      it('should fail when username exists in the db', async () => {
        await testUtils
          .getConnection()
          .getRepository(User)
          .create(fakeUser)
          .save();

        const expected = 'That username is already taken';
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: fakeUser.username,
          },
        });
        const errors = response.errors[0].extensions.exception.validationErrors;

        expect(errors.length).toBe(1);
        expect(errors[0].constraints.isUsernameUnique).toEqual(expected);
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
