import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Args,
  ArgsType,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

import { IsEmailUnique, IsUsernameUnique } from '../decorators';
import { User } from '../entities';
import { MailService, UserService } from '../services';
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
  public mailService: MailService;
  public userService: UserService;

  constructor(mailService: MailService, userService: UserService) {
    this.mailService = mailService;
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
    @Arg('createUserData', () => RegisterInput) createUserData: RegisterInput
  ): Promise<Boolean> {
    try {
      const { email, username } = createUserData;

      await this.userService.create(createUserData);
      await this.mailService.sendVerificationEmail(
        email,
        username,
        createToken()
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
