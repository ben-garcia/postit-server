import { MinLength, MaxLength, Matches } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  UseMiddleware,
  Resolver,
} from 'type-graphql';

import { IsCommunityNameUnique } from '../decorators';
import { CommunityService, RedisService, UserService } from '../services';
import { isAuthenticated } from '../middleware';
import { MyContext } from '../types';

/**
 * This class represents the properties needed to create a Community.
 */
@InputType()
class CreateCommunityInput {
  @Field()
  @MinLength(1, { message: 'Description must be between 1 and 500 characters' })
  @MaxLength(500, {
    message: 'Description must be between 1 and 500 characters',
  })
  description: string;

  @Field()
  @MinLength(1, { message: 'Name must be between 1 and 21 characters' })
  @MaxLength(21, { message: 'Name must be between 1 and 21 characters' })
  @IsCommunityNameUnique({ message: 'That community name is already taken' })
  name: string;

  @Field()
  isNsfw: boolean;

  @Field()
  @Matches(/private|protected|public/, {
    message: 'Type must be 1 of 3 values(private, protected, public)',
  })
  type: string;
}

/**
 * This class represents the possible validation error.
 *
 */
@ObjectType()
class CreateCommunityErrorConstraints {
  @Field(() => String, { nullable: true })
  matches?: string;

  @Field(() => String, { nullable: true })
  maxLength?: string;

  @Field(() => String, { nullable: true })
  minLength?: string;
}

/**
 * This class represents the format for a create community error
 */
@ObjectType()
class CreateCommunityError {
  @Field(() => CreateCommunityErrorConstraints)
  constraints: CreateCommunityErrorConstraints;

  @Field()
  field: string;
}

/**
 * This class represents the response for the create community method.
 */
@ObjectType()
class CreateCommunityResponse {
  @Field(() => [CreateCommunityError], { nullable: true })
  errors?: CreateCommunityError[];

  @Field(() => Boolean, { nullable: true })
  created?: boolean;
}

/**
 * Validates name argument passed in to isUsernameUnique.
 *
 * Must be a valid username.
 * Must be between 3 - 20 characters in length.
 * Must be unique, there can be no user in the db with that
 * same email.
 */
@ArgsType()
class NameArg {
  @Field()
  @MinLength(3, { message: 'Name must be between 3 and 21 characters' })
  @MaxLength(21, { message: 'Name must be between 3 and 21 characters' })
  name: string;
}

/**
 * This class defines the queries and mutations associated with
 * the community controller.
 */
@Resolver()
@Service()
class CommunityResolver {
  public communityService: CommunityService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    communityService: CommunityService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.communityService = communityService;
    this.redisService = redisService;
    this.userService = userService;
  }

  /**
   * Mutation the create a community in the database.
   */
  @Mutation(() => CreateCommunityResponse)
  @UseMiddleware(isAuthenticated)
  async createCommunity(
    @Arg('createCommunityData', () => CreateCommunityInput)
    createCommunityData: CreateCommunityInput,
    @Ctx() { req, res }: MyContext
  ): Promise<CreateCommunityResponse> {
    try {
      const { username } = req;
      const user = await this.userService.getByUsername(username);

      if (!user) {
        throw new Error('Unauthorized');
      }

      const community = await this.communityService.create(
        createCommunityData as any,
        user
      );

      // save to redis.
      await this.redisService.add(
        `${username}:communities`,
        60 * 30, // 30 min
        community
      );

      res.status(201);

      return { created: true };
    } catch (e) {
      // eslint-disable-next-line
			console.log('createCommunity mutation error: ', e);

      res.status(500);

      return { created: false };
    }
  }

  /**
   * Checks if there is a community with the same name exists in the db.
   */
  @Query(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async isCommunityNameUnique(@Args() { name }: NameArg): Promise<boolean> {
    try {
      const community = await this.communityService.getByName(name);
      if (community) {
        return false;
      }
      return true;
    } catch (e) {
      // eslint-disable-next-line
			console.log('isCommunityNameUnique error: ', e);
      return false;
    }
  }
}

export default CommunityResolver;
