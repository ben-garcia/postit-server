import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';

import { User } from '../entities';

/**
 * This class represents the properties needed to create a User.
 *
 * Instead of passing 3 arguments to the register mutation, this class
 * is used to define the object with those same arguments.
 */
@InputType()
class RegisterInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

/**
 * This class defines the queries and mutations associated with
 * the auth controller.
 */
@Resolver()
class AuthResolver {
  @Query(() => String)
  hello(): String {
    return 'world!';
  }

  @Query(() => [User])
  getAllUsers(): Promise<User[]> {
    const users = User.find();
    return users;
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('createUserData', () => RegisterInput) createUserData: RegisterInput
  ): Promise<Boolean> {
    try {
      await User.create(createUserData).save();
      return true;
    } catch (e) {
      // eslint-disable-next-line
			console.log('register mutation error: ', e);
      return false;
    }
  }
}

export default AuthResolver;
