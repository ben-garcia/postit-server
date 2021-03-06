import { MinLength, MaxLength, Matches } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
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
  @MinLength(3, { message: 'Name must be between 3 and 21 characters' })
  @MaxLength(21, { message: 'Name must be between 3 and 21 characters' })
  @IsCommunityNameUnique({ message: 'That community name is already taken' })
  name: string;

  @Field()
  isNsfw: boolean;

  @Field()
  @Matches(/private|protected|public/)
  type: string;
}

/**
 * This class represents the possible validation error.
 *
 */
@ObjectType()
class CreateCommunityErrorConstraints {
  @Field(() => String, { nullable: true })
  isIn?: string;

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
    @Ctx() { req }: MyContext
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

      return { created: true };
    } catch (e) {
      // eslint-disable-next-line
			console.log('createCommunity mutation error: ', e);

      return { created: false };
    }
  }
}

export default CommunityResolver;
