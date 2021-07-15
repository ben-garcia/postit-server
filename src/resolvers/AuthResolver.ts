import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { IsUsernameUnique } from '../decorators';
import {
  BcryptService,
  JwtService,
  MailService,
  RedisService,
  UserService,
} from '../services';
import { MyContext } from '../types';
import { createToken } from '../utils';

/**
 * This class represents the properties needed to create a User.
 *
 * Instead of passing 3 arguments to the signUp mutation, this class
 * is used to define the object with those same arguments.
 *
 * Contraints
 * email must be email addresss.
 * username must be between 3 - 20 in legnth.
 * password must contain at least 6 characters
 */
@InputType()
class SignUpInput {
  @Field({ nullable: true })
  @IsEmail()
  email?: string;

  @Field()
  @MinLength(3, { message: 'Username must be between 3 and 20 characters' })
  @MaxLength(20, { message: 'Username must be between 3 and 20 characters' })
  @IsUsernameUnique({ message: 'That username is already taken' })
  username: string;

  @Field()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

@InputType()
class LogInInput {
  @Field()
  @MinLength(3, { message: 'Username must be between 3 and 20 characters' })
  @MaxLength(20, { message: 'Username must be between 3 and 20 characters' })
  username: string;

  @Field()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

/**
 * This class represents the possible validation error.
 *
 */
@ObjectType()
class AuthErrorConstraints {
  @Field(() => String, { nullable: true })
  isEmail?: string;

  @Field(() => String, { nullable: true })
  maxLength?: string;

  @Field(() => String, { nullable: true })
  minLength?: string;
}

/**
 * This class represents the format for a signup error
 */
@ObjectType()
class AuthErrors {
  @Field(() => AuthErrorConstraints)
  constraints: AuthErrorConstraints;

  @Field()
  field: string;
}

/**
 * This class represents the response for the signUp method.
 */
@ObjectType()
class SignUpResponse {
  @Field(() => [AuthErrors], { nullable: true })
  errors?: AuthErrors[];

  @Field(() => Boolean, { nullable: true })
  created?: boolean;
}

@ObjectType()
class LogInResponse {
  @Field(() => [AuthErrors], { nullable: true })
  errors?: AuthErrors[];

  @Field(() => Boolean, { nullable: true })
  success?: boolean;
}

/**
 * This class defines the queries and mutations associated with
 * the auth controller.
 */
@Resolver()
@Service()
class AuthResolver {
  public bcryptService: BcryptService;
  public jwtService: JwtService;
  public mailService: MailService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    bcryptService: BcryptService,
    jwtService: JwtService,
    mailService: MailService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.bcryptService = bcryptService;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.redisService = redisService;
    this.userService = userService;
  }

  /**
   * Mutation to login the user
   */
  @Mutation(() => LogInResponse)
  async logIn(
    @Arg('logInData', () => LogInInput) logInData: LogInInput,
    @Ctx() { res }: MyContext
  ): Promise<LogInResponse> {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ?? false,
        signed: true,
      };
      const { password, username } = logInData;
      const user = await this.userService.getByUsername(username);

      // don't give too much information
      if (!user) {
        return { success: false };
      }

      const valid = await this.bcryptService.validatePassword(
        password,
        user.password
      );

      // don't give too much information
      if (!valid) {
        return { success: false };
      }

      // get token to send to the client via cookies.
      const [accessToken, refreshToken] = this.jwtService.createTokens({
        email: user?.email,
        username,
      });

      res.cookie('session-access-token', accessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      res.cookie('session-refresh-token', refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      // save the refresh token to redis.
      await this.redisService.add(
        `${username}:refreshToken`,
        60 * 60 * 24 * 365, // 1 year
        refreshToken
      );

      return { success: true };
    } catch (e) {
      // eslint-disable-next-line
			console.log('logIn mutation error: ', e);

      return { success: false };
    }
  }

  /**
   * Mutation the create a user in the database.
   */
  @Mutation(() => SignUpResponse)
  async signUp(
    @Arg('createUserData', () => SignUpInput) createUserData: SignUpInput,
    @Ctx() { res }: MyContext
  ): Promise<SignUpResponse> {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ?? false,
        signed: true,
      };
      const { email, username } = createUserData;

      await this.userService.create(createUserData);

      // only send an email verification is the user
      // provides an email address.
      if (email) {
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
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      res.cookie('session-refresh-token', refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      // save the refresh token to redis.
      await this.redisService.add(
        `${username}:refreshToken`,
        60 * 60 * 24 * 365, // 1 year
        refreshToken
      );

      res.status(201);

      return { created: true };
    } catch (e) {
      // eslint-disable-next-line
			console.log('signUp mutation error: ', e);

      res.status(500);

      return { created: false };
    }
  }
}

export default AuthResolver;
