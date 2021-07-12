import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import { MailService, RedisService } from '../../../src/services';
import {
  createEmailTemplate,
  createRedisClient,
  createTestConnection,
  createTransporter,
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
  let testUtils: TestUtils;

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
    Container.set('bcrypt', bcrypt);
    Container.set('redisClient', createRedisClient());
    Container.set('emailTemplate', createEmailTemplate());
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
      const fakeUser = {
        email: 'ben@ben.com',
        username: 'benben',
        password: 'benbenben',
      };

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

        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = { data: { signUp: { errors: null, created: true } } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							mutation {
								signUp(
									createUserData: {
										email: "${fakeUser.email}"
										username: "${fakeUser.username}"
										password: "${fakeUser.password}"
									}
								) {
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
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body).toEqual(expected);
        expect(
          response.header['set-cookie'][0].startsWith('session-access-token')
        ).toBe(true);
        expect(
          response.header['set-cookie'][1].startsWith('session-refresh-token')
        ).toBe(true);
      });

      it('should succesfully create a user without an email', async () => {
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

        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = { data: { signUp: { errors: null, created: true } } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							mutation {
								signUp(
									createUserData: {
										username: "${fakeUser.username}"
										password: "${fakeUser.password}"
									}
								) {
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
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body).toEqual(expected);
        expect(
          response.header['set-cookie'][0].startsWith('session-access-token')
        ).toBe(true);
        expect(
          response.header['set-cookie'][1].startsWith('session-refresh-token')
        ).toBe(true);
      });

      describe('email', () => {
        it('should fail when email isnt formated correctly', async () => {
          const expected = {
            errors: [
              {
                field: 'email',
                constraints: {
                  isEmail: 'email must be an email',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									signUp(
										createUserData: {
											email: "invalid.com"
											username: "${fakeUser.username}"
											password: "${fakeUser.password}"
										}
									) {
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });

      describe('username', () => {
        it('should fail when trying to add user with a username that is already taken', async () => {
          await testUtils
            .getConnection()
            .getRepository(User)
            .create(fakeUser)
            .save();

          const expected = {
            errors: [
              {
                field: 'username',
                constraints: {
                  isUsernameUnique: 'That username is already taken',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									signUp(
										createUserData: {
											email: "${fakeUser.email}"
											username: "${fakeUser.username}"
											password: "${fakeUser.password}"
										}
									) {
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when username is less than 3 characters', async () => {
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
								mutation {
									signUp(
										createUserData: {
											username: "be"
											password: "${fakeUser.password}"
										}
									) {
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when username is greater than 20 characters', async () => {
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
								mutation {
									signUp(
										createUserData: {
											username: "usernameislongerthan20charcters"
											password: "${fakeUser.password}"
										}
									) {
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });

      describe('password', () => {
        it('should fail when password is less than 8 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'password',
                constraints: {
                  minLength: 'Password must be at least 8 characters long',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									signUp(
										createUserData: {
											username: "${fakeUser.username}"
											password: "invalid"
										}
									) {
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });
    });

    describe('logIn', () => {
      const fakeUser = {
        username: 'benben',
        password: 'benbenben',
      };

      beforeEach(async () => {
        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        await testUtils
          .getConnection()
          .getRepository(User)
          .create(fakeUser)
          .save();
      });

      it('should succesfully log in', async () => {
        const expected = { data: { logIn: { success: true } } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
								mutation {
									logIn(
										logInData: {
											username: "${fakeUser.username}"
											password: "${fakeUser.password}"
										}
									) {
										success
									}
								}
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      describe('username', () => {
        it('should fail when username is less than 3 characters', async () => {
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
								mutation {
									logIn(
										logInData: {
											username: "be"
											password: "${fakeUser.password}"
										}
									) {
										success
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when username is greater than 20 characters', async () => {
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
								mutation {
									logIn(
										logInData: {
											username: "thisisaninvalidusernamegreaterthan20chars"
											password: "${fakeUser.password}"
										}
									) {
										success
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
						`,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });

      describe('password', () => {
        it('should fail when password is less than 8 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'password',
                constraints: {
                  minLength: 'Password must be at least 8 characters long',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									logIn(
										logInData: {
											username: "${fakeUser.username}"
											password: "invalid"
										}
									) {
										success
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
