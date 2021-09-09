import { Service } from 'typedi';
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Community, User } from '../entities';
import {
  JwtService,
  MailService,
  RedisService,
  UserService,
} from '../services';
import { MyContext } from '../types';
import { createToken } from '.';

@InputType()
class TestSignUpInput {
  @Field({ nullable: true })
  email?: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

/**
 * Resolver used for 2e2 testing.
 */
@Resolver()
@Service()
class TestResolver {
  public jwtService: JwtService;
  public mailService: MailService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    jwtService: JwtService,
    mailService: MailService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.redisService = redisService;
    this.userService = userService;
  }

  @Mutation(() => Boolean)
  async clearDB(): Promise<Boolean> {
    try {
      await getRepository(Community).query('DELETE FROM communities');
      await getRepository(User).query('DELETE FROM users');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Mutation the create a user in the database.
   */
  @Mutation(() => Boolean)
  async testSignUp(
    @Arg('createUserData', () => TestSignUpInput)
    createUserData: TestSignUpInput,
    @Ctx() { res }: MyContext
  ): Promise<Boolean> {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ?? false,
        signed: true,
      };
      const { email, username } = createUserData;

      await this.userService.create(createUserData);

      // only send an email verification is the user
      // provides an email address and
      // not performing e2e tests.
      if (email && !process.env.CYPRESS_TEST) {
        await this.mailService.sendVerificationEmail(
          email,
          username,
          createToken()
        );
      }

      // get token to send to the client via cookies.
      const [accessToken, refreshToken] = this.jwtService.createTokens({
        email: email ?? undefined,
        username,
      });

      res.cookie('session-access-token', accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 15, // 15 minutes
      });

      res.cookie('session-refresh-token', refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      // save the refresh token to redis.
      await this.redisService.add(
        `${username}:refreshToken`,
        60 * 60 * 24 * 365, // 1 year
        refreshToken
      );

      return true;
    } catch (e) {
      // eslint-disable-next-line
      console.log('testSignUp mutation error: ', e);

      return false;
    }
  }
}

export default TestResolver;
