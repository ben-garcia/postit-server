import { CommunityResolver } from '../../../src/resolvers';

describe('CommunityResovler unit', () => {
  let communityResolver: CommunityResolver;
  const mockUser = {
    email: 'fake@email.com',
    username: 'test',
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
    }

    function MockUserService(
      this: any,
      mockRepository: typeof mockUserRepository
    ) {
      this.getByUsername = jest.fn().mockReturnValue(mockUser);
      this.userRepository = mockRepository;
    }

    communityResolver = new CommunityResolver(
      new (MockCommunityService as any)(mockCommunityRepository),
      new (MockRedisService as any)(mockIoRedis),
      new (MockUserService as any)(mockUserRepository)
    );
  });

  it('should define a module', () => {
    expect(communityResolver).toBeDefined();
  });

  describe('createCommunity mutation', () => {
    it('should call userService.getByUsername, communityService.create, redisService.add', async () => {
      const mockContext: any = {
        req: {
          username: mockUser.username,
        },
        res: {
          cookie: jest.fn(),
        },
      };
      const mockCommunity = {
        description: 'testingtesting',
        name: 'testingname',
        isNsfw: false,
        type: 'public',
      };

      communityResolver.communityService.create = jest
        .fn()
        .mockReturnValue(mockCommunity);

      await communityResolver.createCommunity(mockCommunity, mockContext);

      expect(communityResolver.userService.getByUsername).toHaveBeenCalledTimes(
        1
      );
      expect(communityResolver.userService.getByUsername).toHaveBeenCalledWith(
        mockUser.username
      );

      expect(communityResolver.communityService.create).toHaveBeenCalledTimes(
        1
      );
      expect(communityResolver.communityService.create).toHaveBeenCalledWith(
        mockCommunity,
        mockUser
      );

      expect(communityResolver.redisService.add).toHaveBeenCalledTimes(1);
      expect(communityResolver.redisService.add).toHaveBeenCalledWith(
        `${mockUser.username}:communities`,
        60 * 30, // 1 year
        mockCommunity
      );
    });
  });
});
