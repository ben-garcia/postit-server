import { Connection, getRepository } from 'typeorm';
import { Container } from 'typedi';

import { createTestConnection, graphqlExecution } from '../../src/utils';
import { User } from '../../src/entities';

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConnection();
  Container.set('userRepository', getRepository(User));
});

afterAll(async () => {
  await conn.close();
});

const registerMutation = `
	mutation Register($createUserData: RegisterInput!) {
		register(createUserData: $createUserData)
	}
`;

describe('AuthResolver', () => {
  describe('Mutations', () => {
    it('register a user', async () => {
      const user = {
        email: 'ben@ben.com',
        username: 'benben',
        password: 'benben',
      };

      const response = await graphqlExecution({
        source: registerMutation,
        variableValues: {
          createUserData: user,
        },
      });

      expect(response).toMatchObject({
        data: {
          register: true,
        },
      });

      const dbUser = await User.findOne({ where: { email: user.email } });
      expect(dbUser).toBeDefined();
      expect(dbUser!.hasValidated).toBeFalsy();
      expect(dbUser!.username).toBe(user.username);
      expect(dbUser!.email).toBe(user.email);
      expect(dbUser!.password).not.toBe(user.password);
    });
  });
});
