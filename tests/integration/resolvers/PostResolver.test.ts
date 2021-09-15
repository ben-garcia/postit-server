import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import { RedisService } from '../../../src/services';
import {
  createRedisClient,
  createTestConnection,
  createTransporter,
  TestUtils,
} from '../../../src/utils';
import { Community, Post, User } from '../../../src/entities';

dotenv.config();

describe('PostResolver integration', () => {
  let testUtils: TestUtils;

  beforeAll(async () => {
    testUtils = new TestUtils(await createTestConnection());

    Container.set('redisClient', createRedisClient());
    Container.set('userRepository', getRepository(User));
    Container.set('postRepository', getRepository(Post));
    Container.set('communityRepository', getRepository(Community));
    Container.set('transporter', await createTransporter());
    Container.set('jwt', jwt);
    Container.set('bcrypt', bcrypt);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await testUtils.clearTables('posts');
  });

  afterAll(async () => {
    await testUtils.clearTables('communities', 'users');
    await testUtils.closeConnection();
  });
  let sessionCookie: string;
  const fakeUser = {
    email: 'test@user.com',
    username: 'testuser',
    password: 'password',
  };
  const fakeCommunity = {
    name: 'test',
    isNsfw: false,
    type: 'public',
  };

  describe('Queries', () => {
    beforeAll(async () => {
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
						}
					}
				`,
        })
        .set('Accept', 'application/json');

      // eslint-disable-next-line prefer-destructuring
      sessionCookie = response.header['set-cookie'];

      await request(testUtils.getApp())
        .post('/graphql')
        .send({
          query: `
          mutation {
							createCommunity(
								createCommunityData: {
									isNsfw: ${fakeCommunity.isNsfw}
									name: "${fakeCommunity.name}"
									type: "${fakeCommunity.type}"
								}
							) {
								created
						}
					}

        `,
        })
        .set('Cookie', sessionCookie)
        .set('Accept', 'application/json');
    });

    describe('getPost', () => {
      const fakePost = {
        contentKind: 'self',
        isNsfw: false,
        isOriginalContent: false,
        isSpoiler: false,
        sendReplies: false,
        submitType: 'community',
        linkUrl: null,
        richTextJson: 'test post',
        title: 'testing',
      };
      beforeEach(async () => {
        await testUtils
          .getConnection()
          .getRepository(Post)
          .create(fakePost as Partial<Post>)
          .save();
      });

      it('should succesfully return the post', async () => {
        const expected = {
          data: {
            getPost: {
              post: fakePost,
            },
          },
        };

        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								getPost(id: 1) {
									post {
                    contentKind
                    isNsfw
                    isOriginalContent
                    isSpoiler
                    sendReplies
                    submitType
                    linkUrl
                    richTextJson
                    title
									}
								}
							}
						`,
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });

      it('should return error with message indicate there is no post with that id', async () => {
        const expected = {
          data: {
            getPost: { error: 'There is no post with that id' },
          },
        };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							query {
								getPost(id: 100) {
									error
								}
							}
						`,
          })
          .set('Cookie', sessionCookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toEqual(expected);
      });
    });
  });

  describe('Mutations', () => {
    describe('createPost', () => {
      const fakePost = {
        contentKind: 'self',
        isNsfw: false,
        isOriginalContent: false,
        isSpoiler: false,
        sendReplies: false,
        submitType: 'community',
        linkUrl: null,
        richTextJson: 'test post',
        title: 'testing',
      };

      it('should succesfully create a post', async () => {
        // Mock the implementation of the RedisService.add
        // @ts-ignore
        jest.spyOn(RedisService.prototype, 'add').mockImplementation(() => ({
          setex: jest.fn(),
        }));

        const expected = {
          data: { createPost: { errors: null, created: true } },
        };
        const response = await request(testUtils.getApp())
          .post('/graphql')
          .send({
            query: `
							mutation {
								createPost(
                  communityName: "${fakeCommunity.name}"
									createPostData: {
                    contentKind: "${fakePost.contentKind}",
                    isNsfw: ${fakePost.isNsfw},
                    isOriginalContent: ${fakePost.isOriginalContent},
                    isSpoiler: ${fakePost.isSpoiler},
                    sendReplies: ${fakePost.sendReplies},
                    submitType: "${fakePost.submitType}",
                    richTextJson: "${fakePost.richTextJson}",
                    title: "${fakePost.title}",
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
								createPost(
                  communityName: "${fakeCommunity.name}"
									createPostData: {
                    contentKind: "${fakePost.contentKind}",
                    isNsfw: ${fakePost.isNsfw},
                    isOriginalContent: ${fakePost.isOriginalContent},
                    isSpoiler: ${fakePost.isSpoiler},
                    sendReplies: ${fakePost.sendReplies},
                    submitType: "${fakePost.submitType}",
                    richTextJson: "${fakePost.richTextJson}",
                    title: "${fakePost.title}",
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

      describe('title', () => {
        it('should fail when title is empty string', async () => {
          const expected = {
            errors: [
              {
                field: 'title',
                constraints: {
                  minLength: 'Title must be between 1 and 300 characters',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							mutation {
								createPost(
                  communityName: "${fakeCommunity.name}"
									createPostData: {
                    contentKind: "${fakePost.contentKind}",
                    isNsfw: ${fakePost.isNsfw},
                    isOriginalContent: ${fakePost.isOriginalContent},
                    isSpoiler: ${fakePost.isSpoiler},
                    sendReplies: ${fakePost.sendReplies},
                    submitType: "${fakePost.submitType}",
                    richTextJson: "${fakePost.richTextJson}",
                    title: "",
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

      describe('contentKind', () => {
        it('should fail when field doesnt match(link, self, video, videogif)', async () => {
          const expected = {
            errors: [
              {
                field: 'contentKind',
                constraints: {
                  matches:
                    'Type must be 1 of 4 values(link, self, video, videogif)',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							mutation {
								createPost(
                  communityName: "${fakeCommunity.name}"
									createPostData: {
                    contentKind: "invalid",
                    isNsfw: ${fakePost.isNsfw},
                    isOriginalContent: ${fakePost.isOriginalContent},
                    isSpoiler: ${fakePost.isSpoiler},
                    sendReplies: ${fakePost.sendReplies},
                    submitType: "${fakePost.submitType}",
                    richTextJson: "${fakePost.richTextJson}",
                    title: "${fakePost.title}",
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

      describe('submitType', () => {
        it('should fail when field doesnt match(community, profile)', async () => {
          const expected = {
            errors: [
              {
                field: 'submitType',
                constraints: {
                  matches: 'Type must be 1 of 2 values(community, profile)',
                },
              },
            ],
          };
          const response = await request(testUtils.getApp())
            .post('/graphql')
            .send({
              query: `
							mutation {
								createPost(
                  communityName: "${fakeCommunity.name}"
									createPostData: {
                    contentKind: "${fakePost.contentKind}",
                    isNsfw: ${fakePost.isNsfw},
                    isOriginalContent: ${fakePost.isOriginalContent},
                    isSpoiler: ${fakePost.isSpoiler},
                    sendReplies: ${fakePost.sendReplies},
                    submitType: "invalid",
                    richTextJson: "${fakePost.richTextJson}",
                    title: "${fakePost.title}",
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
