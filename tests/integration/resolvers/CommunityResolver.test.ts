import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import { RedisService } from '../../../src/services';
import {
  createEmailTemplate,
  createRedisClient,
  createTestConnection,
  createTransporter,
  TestUtils,
} from '../../../src/utils';
import {
  Community,
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Profile,
  User,
} from '../../../src/entities';

dotenv.config();

describe('CommunityResolver integration', () => {
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
    Container.set('communityRepository', getRepository(Community));
    Container.set('transporter', await createTransporter());
    Container.set('jwt', jwt);
    Container.set('bcrypt', bcrypt);
    Container.set('redisClient', createRedisClient());
    Container.set('emailTemplate', createEmailTemplate());
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await testUtils.clearTables('communities');
  });

  afterAll(async () => {
    await testUtils.clearTables('users');
    await testUtils.closeConnection();
  });
  let sessionCookie: string;

  describe('Queries', () => {
    beforeAll(async () => {
      const response = await request(testUtils.getApp())
        .post('/graphql')
        .send({
          query: `
					mutation {
						signUp(
							createUserData: {
								email: "test@user.com"
								username: "testuser"
								password: "password"
							}
						) {
							created
						}
					}
				`,
        })
        .set('Accept', 'application/json');

      // eslint-disable-next-line prefer-destructuring
      sessionCookie = response.header['set-cookie'];
    });

    describe('isUsernameUnique', () => {
      it('should fail when cookies arent sent', async () => {
        const expected = {
          errors: [
            {
              message: 'Unauthorized',
            },
          ],
        };

        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								isCommunityNameUnique(name: "reactjs")
							}
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body).toEqual(expected);
      });

      it('should return true to indicate there is no other community with the name', async () => {
        const expected = { data: { isCommunityNameUnique: true } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								isCommunityNameUnique(name: "reactjs")
							}
						`,
          })
          .set('Cookie', sessionCookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      it('should return false to indicate there is a community with the name', async () => {
        await testUtils
          .getConnection()
          .getRepository(Community)
          .create({
            name: 'test',
            isNsfw: false,
            type: 'public',
          })
          .save();

        const expected = { data: { isCommunityNameUnique: false } };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								isCommunityNameUnique(name: "test")
							}
						`,
          })
          .set('Cookie', sessionCookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      describe('name', () => {
        it('should fail when name is empty string', async () => {
          const expected = {
            errors: [
              {
                field: 'name',
                constraints: {
                  minLength: 'Name must be between 3 and 21 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								query {
									isCommunityNameUnique(name: "t")
								}							 
							`,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when field is greater than 21 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'name',
                constraints: {
                  maxLength: 'Name must be between 3 and 21 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								query {
									isCommunityNameUnique(name: "namehastoomanycharacters")
							}
							`,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });
    });
  });

  describe('Mutations', () => {
    describe('createCommunity', () => {
      const testCommunity = {
        name: 'test',
        isNsfw: false,
        type: 'public',
      };

      it('should succesfully create a community', async () => {
        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = {
          data: { createCommunity: { errors: null, created: true } },
        };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							mutation {
								createCommunity(
									createCommunityData: {
										name: "${testCommunity.name}"
										isNsfw: ${testCommunity.isNsfw}
										type: "${testCommunity.type}"
									}
								) {
									created
									errors {
										constraints {
											matches
											maxLength
											minLength
										}
									}
								}
							}	
						`,
          })
          .set('Cookie', sessionCookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body).toEqual(expected);
      });

      it('should fail when cookie isnt sent', async () => {
        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = {
          errors: [
            {
              message: 'Unauthorized',
            },
          ],
        };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							mutation {
								createCommunity(
									createCommunityData: {
										name: "${testCommunity.name}"
										isNsfw: ${testCommunity.isNsfw}
										type: "${testCommunity.type}"
									}
								) {
									created
									errors {
										constraints {
											matches
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

      describe('name', () => {
        it('should fail when trying to add community with a name that is already taken', async () => {
          await (testUtils as any)
            .getConnection()
            .getRepository(Community)
            .create(testCommunity)
            .save();

          const expected = {
            errors: [
              {
                field: 'name',
                constraints: {
                  isCommunityNameUnique: 'That community name is already taken',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									createCommunity(
										createCommunityData: {
											name: "${testCommunity.name}"
											isNsfw: ${testCommunity.isNsfw}
											type: "${testCommunity.type}"
										}
									) {
										created
										errors {
											constraints {
												matches
												maxLength
												minLength
											}
										}
									}
								}	
						`,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when name is empty string', async () => {
          const expected = {
            errors: [
              {
                field: 'name',
                constraints: {
                  minLength: 'Name must be between 1 and 21 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									createCommunity(
										createCommunityData: {
											name: ""
											isNsfw: ${testCommunity.isNsfw}
											type: "${testCommunity.type}"
										}
									) {
										created
										errors {
											constraints {
												matches
												maxLength
												minLength
											}
										}
									}
								}
						 `,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });

        it('should fail when username is greater than 21 characters', async () => {
          const expected = {
            errors: [
              {
                field: 'name',
                constraints: {
                  maxLength: 'Name must be between 1 and 21 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
								mutation {
									createCommunity(
										createCommunityData: {
											name: "thisisverylongcommunityname"
											isNsfw: ${testCommunity.isNsfw}
											type: "${testCommunity.type}"
										}
									) {
										created
										errors {
											constraints {
												matches
												maxLength
												minLength
											}
										}
									}
								}		
							`,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });

      describe('type', () => {
        it('should fail when field doesnt match(private, protected, public)', async () => {
          const expected = {
            errors: [
              {
                field: 'type',
                constraints: {
                  matches:
                    'Type must be 1 of 3 values(private, protected, public)',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							mutation {
								createCommunity(
									createCommunityData: {
										name: "${testCommunity.name}"
										isNsfw: ${testCommunity.isNsfw}
										type: "invalid"
									}
								) {
									created
									errors {
										constraints {
											matches
											maxLength
											minLength
										}
									}
								}
							}		
							`,
            })
            .set('Cookie', sessionCookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);

          expect(response.body).toEqual(expected);
        });
      });
    });
  });
});
