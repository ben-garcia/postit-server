import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

import { IsEmailUnique, IsUsernameUnique } from '../decorators';
import { User } from '../entities';
import {
  AuthService,
  MailService,
  RedisService,
  UserService,
} from '../services';
import { MyContext } from '../types';
import { createToken } from '../utils';

/**
 * This class represents the properties needed to create a User.
 *
 * Instead of passing 3 arguments to the register mutation, this class
 * is used to define the object with those same arguments.
 *
 * Contraints
 * email must be email addresss.
 * username must be between 3 - 20 in legnth.
 * password must contain at least 6 characters
 */
@InputType()
class RegisterInput {
  @Field()
  @IsEmail()
  @IsEmailUnique({ message: 'That email is already taken' })
  email: string;

  @Field()
  @MinLength(3, { message: 'Username must be between 3 and 20 characters' })
  @MaxLength(20, { message: 'Username must be between 3 and 20 characters' })
  @IsUsernameUnique({ message: 'That username is already taken' })
  username: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

/**
 * Validates email argument passed in to isEmailUnique.
 *
 * Must be a valid email address
 * Must be unique, there can be no user in the db with that
 * same email.
 */
@ArgsType()
class EmailArg {
  @Field()
  @IsEmail()
  @IsEmailUnique({ message: 'That email is already taken' })
  email: string;
}

/**
 * Validates email argument passed in to isUsernameUnique.
 *
 * Must be a valid username.
 * Must be between 3 - 20 characters in length.
 * Must be unique, there can be no user in the db with that
 * same email.
 */
@ArgsType()
class UsernameArg {
  @Field()
  @MinLength(3, { message: 'Username must be between 3 and 20 characters' })
  @MaxLength(20, { message: 'Username must be between 3 and 20 characters' })
  @IsUsernameUnique({ message: 'That username is already taken' })
  username: string;
}

/**
 * This class defines the queries and mutations associated with
 * the auth controller.
 */
@Resolver()
@Service()
class AuthResolver {
  public authService: AuthService;
  public mailService: MailService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    authService: AuthService,
    mailService: MailService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.authService = authService;
    this.mailService = mailService;
    this.redisService = redisService;
    this.userService = userService;
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[] | undefined> {
    try {
      const users = await this.userService.getAll();
      return users;
    } catch (e) {
      // eslint-disable-next-line
			console.log('AuthResolver.getAllUsers error: ', e);
      return undefined;
    }
  }

  /**
   * Checks if there is a user with the same email and
   * that email is valid.
   */
  @Query(() => Boolean)
  async isEmailUnique(@Args() { email }: EmailArg): Promise<boolean> {
    try {
      const user = await this.userService.getByEmail(email);
      if (user) {
        return false;
      }
      return true;
    } catch (e) {
      // eslint-disable-next-line
      console.log('isEmailUnique error: ', e);
      return false;
    }
  }

  /**
   * Checks if there is a user with the same username.
   */
  @Query(() => Boolean)
  async isUsernameUnique(@Args() { username }: UsernameArg): Promise<boolean> {
    try {
      const user = await this.userService.getByUsername(username);
      if (user) {
        return false;
      }
      return true;
    } catch (e) {
      // eslint-disable-next-line
			console.log('isUsernameUnique error: ', e);
      return false;
    }
  }

  /**
   * Mutation the create a user in the database.
   */
  @Mutation(() => Boolean)
  async register(
    @Arg('createUserData', () => RegisterInput) createUserData: RegisterInput,
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

      await this.mailService.sendVerificationEmail(
        email,
        username,
        createToken()
      );

      // get token to send to the client via cookies.
      const [accessToken, refreshToken] = this.authService.createTokens({
        email,
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
			console.log('register mutation error: ', e);

      return false;
    }
  }
}

export default AuthResolver;
