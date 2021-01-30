import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';

import { IsEmailUnique, IsUsernameUnique } from '../decorators';
import { UserService } from '../services';
import { User } from '../entities';

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
 * This class defines the queries and mutations associated with
 * the auth controller.
 */
@Resolver()
@Service()
class AuthResolver {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Query(() => [User])
  getAllUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  /**
   * Checks if there is a user with the same email.
   */
  @Query(() => Boolean)
  async isEmailUnique(
    @Arg('email', () => String) email: string
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } });
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
  async isUsernameUnique(
    @Arg('username', () => String) username: string
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { username } });
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
      await this.userService.create(createUserData);
      return true;
    } catch (e) {
      // eslint-disable-next-line
			console.log('register mutation error: ', e);
      return false;
    }
  }
}

export default AuthResolver;
