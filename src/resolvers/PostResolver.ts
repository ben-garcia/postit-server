import { MinLength, MaxLength, Matches } from 'class-validator';
import { Service } from 'typedi';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  UseMiddleware,
  Resolver,
} from 'type-graphql';

import { Post } from '../entities';
import { CommunityService, RedisService, UserService } from '../services';
import { isAuthenticated } from '../middleware';
import { MyContext } from '../types';
import PostService from '../services/PostService';

/**
 * This class represents the properties needed to create a Post.
 */
@InputType()
class CreatePostInput {
  @Field()
  @Matches(/link|self|video|videogif/, {
    message: 'Type must be 1 of 4 values(link, self, video, videogif)',
  })
  contentKind: 'link' | 'self' | 'video' | 'videogif';

  @Field()
  isNsfw: boolean;

  @Field()
  isSpoiler: boolean;

  @Field()
  isOriginalContent: boolean;

  @Field(() => String, { nullable: true })
  linkUrl: string;

  @Field(() => String, { nullable: true })
  richTextJson: string | null;

  @Field()
  @Matches(/community|profile/, {
    message: 'Type must be 1 of 2 values(community, profile)',
  })
  submitType: 'community' | 'profile';

  @Field()
  sendReplies: boolean;

  @Field()
  @MinLength(1, { message: 'Title must be between 1 and 300 characters' })
  @MaxLength(300, { message: 'Title must be between 1 and 300 characters' })
  title: string;
}

/**
 * This class represents the possible validation error.
 *
 */
@ObjectType()
class CreatePostErrorConstraints {
  @Field(() => String, { nullable: true })
  matches?: string;

  @Field(() => String, { nullable: true })
  maxLength?: string;

  @Field(() => String, { nullable: true })
  minLength?: string;
}

/**
 * This class represents the format for a create post error
 */
@ObjectType()
class CreatePostError {
  @Field(() => CreatePostErrorConstraints)
  constraints: CreatePostErrorConstraints;

  @Field()
  field: string;
}

/**
 * This class represents the response for the create post method.
 */
@ObjectType()
class CreatePostResponse {
  @Field(() => [CreatePostError], { nullable: true })
  errors?: CreatePostError[];

  @Field(() => Boolean, { nullable: true })
  created?: boolean;
}

@ObjectType()
class GetPostResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Post, { nullable: true })
  post?: Post;
}

/**
 * This class defines the queries and mutations associated with
 * the post controller.
 */
@Resolver()
@Service()
class PostResolver {
  public communityService: CommunityService;
  public postService: PostService;
  public redisService: RedisService;
  public userService: UserService;

  constructor(
    communityService: CommunityService,
    postService: PostService,
    redisService: RedisService,
    userService: UserService
  ) {
    this.communityService = communityService;
    this.postService = postService;
    this.redisService = redisService;
    this.userService = userService;
  }

  /**
   * Mutation the create a post in the database.
   */
  @Mutation(() => CreatePostResponse)
  @UseMiddleware(isAuthenticated)
  async createPost(
    @Arg('communityName', () => String)
    communityName: string,
    @Arg('createPostData', () => CreatePostInput)
    createPostData: CreatePostInput,
    @Ctx() { req, res }: MyContext
  ): Promise<CreatePostResponse> {
    try {
      const { username } = req;
      const user = await this.userService.getByUsername(username);
      const community = await this.communityService.getByName(communityName);

      if (!user || !community) {
        return { created: false };
      }

      const post = await this.postService.create(
        createPostData,
        community,
        user
      );

      // save to redis.
      await this.redisService.add(
        `${username}:posts`,
        60 * 30, // 30 min
        post
      );

      res.status(201);

      return { created: true };
    } catch (e) {
      // eslint-disable-next-line
      console.log('createPost mutation error: ', e);

      res.status(500);

      return { created: false };
    }
  }

  /**
   * Returns a post
   *
   * @param id the post id
   */
  @Query(() => GetPostResponse)
  async getPost(@Arg('id', () => Int) id: number): Promise<GetPostResponse> {
    try {
      const post = await this.postService.getById(id);

      if (post) {
        return { post };
      }

      return { error: 'There is no post with that id' };
    } catch (e) {
      // eslint-disable-next-line
      console.log('getPost query error: ', e);

      return { error: e.message };
    }
  }
}

export default PostResolver;
