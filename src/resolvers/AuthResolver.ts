import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { IsUsernameUnique } from '../decorators';
import {
  GeneralPreferencesService,
  NotificationPreferencesService,
  JwtService,
  MailService,
  ProfileService,
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
 * This class defines the queries and mutations associated with
 * the auth controller.
 */
@Resolver()
@Service()
class AuthResolver {
  public generalPreferencesService: GeneralPreferencesService;
  public notificationPreferencesService: NotificationPreferencesService;
  public jwtService: JwtService;
  public mailService: MailService;
  public profileService: ProfileService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    generalPreferencesService: GeneralPreferencesService,
    notificationPreferencesService: NotificationPreferencesService,
    jwtService: JwtService,
    mailService: MailService,
    profileService: ProfileService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.generalPreferencesService = generalPreferencesService;
    this.notificationPreferencesService = notificationPreferencesService;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.profileService = profileService;
    this.redisService = redisService;
    this.userService = userService;
  }

  /**
   * Mutation the create a user in the database.
   */
  @Mutation(() => Boolean)
  async register(
    @Arg('createUserData', () => RegisterInput) createUserData: RegisterInput,
    @Ctx() { res }: MyContext
  ): Promise<boolean> {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ?? false,
        signed: true,
      };
      const { email, username } = createUserData;
      const profile = await this.profileService.create();
      const generalPreferences = await this.generalPreferencesService.create();
      const notificationPreferences = await this.notificationPreferencesService.create();

      await this.userService.create({
        ...createUserData,
        generalPreferences,
        notificationPreferences,
        profile,
      });
      await this.mailService.sendVerificationEmail(
        email,
        username,
        createToken()
      );

      // get token to send to the client via cookies.
      const [accessToken, refreshToken] = this.jwtService.createTokens({
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
