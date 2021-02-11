import { MinLength, MaxLength } from 'class-validator';
import { Service } from 'typedi';
import { Args, ArgsType, Field, Query, Resolver } from 'type-graphql';

import { IsUsernameUnique } from '../decorators';
import { User } from '../entities';
import { UserService } from '../services';

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
 * the user controller.
 */
@Resolver()
@Service()
class UserResolver {
  public userService: UserService;

  constructor(userService: UserService) {
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
}

export default UserResolver;
