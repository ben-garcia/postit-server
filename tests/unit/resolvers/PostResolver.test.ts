import { PostResolver } from '../../../src/resolvers';

describe('PostResolver unit', () => {
  let postResolver: PostResolver;
  const mockUser = {
    email: 'fake@email.com',
    username: 'test',
  };
  const mockCommunity = {
    description: 'testingtesting',
    name: 'testingname',
    isNsfw: false,
    type: 'public' as 'public',
  };
  const mockPost: any = {
    contentKind: 'self',
    isNsfw: false,
    isOriginalContent: false,
    isSpoiler: false,
    sendReplies: false,
    submitType: 'community',
    linkUrl: null,
    richTextJson: '2nd post text',
    title: '2nd post',
  };

  beforeEach(() => {
    const mockCommunityRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const mockPostRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const mockIoRedis = {
      del: jest.fn(),
      setex: jest.fn(),
    };

    function MockRedisService(this: any, mockRedis: any) {
      this.redisClient = mockRedis;
      this.add = jest.fn();
      this.remove = jest.fn();
    }

    function MockCommunityService(
      this: any,
      mockRepository: typeof mockCommunityRepository
    ) {
      this.communityRepository = mockRepository;
      this.create = jest.fn();
      this.getByName = jest.fn().mockReturnValue(mockCommunity);
    }

    function MockPostService(
      this: any,
      mockRepository: typeof mockPostRepository
    ) {
      this.postRepository = mockRepository;
      this.create = jest.fn();
      /* this.create = jest.fn().mockReturnValue({
        ...mockPost,
        community: mockCommunity,
        creator: mockUser,
      }); */
      this.getById = jest.fn().mockReturnValue(mockPost);
    }

    function MockUserService(
      this: any,
      mockRepository: typeof mockUserRepository
    ) {
      this.getByUsername = jest.fn().mockReturnValue(mockUser);
      this.userRepository = mockRepository;
    }

    postResolver = new PostResolver(
      new (MockCommunityService as any)(mockCommunityRepository),
      new (MockPostService as any)(mockPostRepository),
      new (MockRedisService as any)(mockIoRedis),
      new (MockUserService as any)(mockUserRepository)
    );
  });

  it('should define a module', () => {
    expect(postResolver).toBeDefined();
  });

  describe('createPost mutation', () => {
    it('should call userService.getByUsername, communityService.getByName, postService.create and redisService.add', async () => {
      const mockContext: any = {
        req: {
          username: mockUser.username,
        },
        res: {
          cookie: jest.fn(),
          status: jest.fn(),
        },
      };

      await postResolver.createPost(mockCommunity.name, mockPost, mockContext);

      expect(postResolver.userService.getByUsername).toHaveBeenCalledTimes(1);
      expect(postResolver.userService.getByUsername).toHaveBeenCalledWith(
        mockUser.username
      );

      expect(postResolver.communityService.getByName).toHaveBeenCalledTimes(1);
      expect(postResolver.communityService.getByName).toHaveBeenCalledWith(
        mockCommunity.name
      );

      expect(postResolver.postService.create).toHaveBeenCalledTimes(1);
      expect(postResolver.redisService.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPost query', () => {
    it('should call postService.getById', async () => {
      postResolver.postService.getById = jest.fn().mockReturnValue(mockPost);

      await postResolver.getPost(1);

      expect(postResolver.postService.getById).toHaveBeenCalledTimes(1);
      expect(postResolver.postService.getById).toHaveBeenCalledWith(1);
    });
  });
});
