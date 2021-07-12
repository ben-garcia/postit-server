import dotenv from 'dotenv';
import request from 'supertest';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import {
  EmailNotificationPreferences,
  GeneralPreferences,
  NotificationPreferences,
  Profile,
  User,
} from '../../../src/entities';
import { createTestConnection, TestUtils } from '../../../src/utils';

dotenv.config();

describe('UserResolver integration', () => {
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
  });

  beforeEach(async () => {
    await testUtils.clearTables('users');
  });

  afterAll(async () => {
    await testUtils.closeConnection();
  });

  describe('Queries', () => {
    describe('isUsernameUnique', () => {
      it('should return true to indicate there is no other user with the username', async () => {
        const expected = { data: { isUsernameUnique: true } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								isUsernameUnique(username:"ben")
							}
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      it('should return false to indicate there is a user with the username', async () => {
        await testUtils
          .getConnection()
          .getRepository(User)
          .create({
            username: 'ben',
            password: 'testinghere',
          })
          .save();

        const expected = { data: { isUsernameUnique: false } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								isUsernameUnique(username:"ben")
							}
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      describe('username', () => {
        it('should fail when username less than 3 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'username',
                constraints: {
                  minLength: 'Username must be between 3 and 20 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							query {
								isUsernameUnique(username:"be")
							}
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when username greater than 20 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'username',
                constraints: {
                  maxLength: 'Username must be between 3 and 20 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							query {
								isUsernameUnique(username:"thisusernameisover20acharacters")
							}
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });
    });
  });
});
