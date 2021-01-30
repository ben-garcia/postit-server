import { ApolloServer } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { Connection, getRepository } from 'typeorm';
import { Container } from 'typedi';

import { createSchema, createTestConnection } from '../../src/utils';
import { User } from '../../src/entities';

let connection: Connection;

beforeAll(async () => {
  connection = await createTestConnection();
  Container.set('userRepository', getRepository(User));
});

afterAll(async () => {
  await connection.close();
});

const registerMutation = `
	mutation Register($createUserData: RegisterInput!) {
		register(createUserData: $createUserData)
	}
`;

describe('AuthResolver', () => {
  let mutate: any;
  let query: any;

  beforeAll(async () => {
    const schema = await createSchema();
    const server = new ApolloServer({ schema });
    const testServer = createTestClient(server);

    mutate = testServer.mutate;
    query = testServer.query;
  });

  describe('Mutations', () => {
    describe('register', () => {
      const fakeUser = {
        email: 'ben@ben.com',
        username: 'benben',
        password: 'benben',
      };

      it('should succesfully create a user', async () => {
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
        it('should fail when trying to add user with an email that is already taken', async () => {
          const expected = 'That email is already taken';
          const response = await mutate({
            mutation: registerMutation,
            variables: {
              createUserData: {
                ...fakeUser,
                username: 'benbenben',
              },
            },
          });
          const errors =
            response.errors[0].extensions.exception.validationErrors;

          expect(errors.length).toBe(1);
          expect(errors[0].constraints.isEmailUnique).toEqual(expected);
        });

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
        const expected = 'That email is already taken';
        const response = await query({
          query: isEmailUniqueQuery,
          variables: {
            email: 'ben@ben.com',
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
        const expected = 'That username is already taken';
        const response = await query({
          query: isUsernameUnique,
          variables: {
            username: 'benben',
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

        expect(errors.length).toBe(2);
        expect(errors[0].constraints.maxLength).toEqual(expected);
      });
    });
  });
});
