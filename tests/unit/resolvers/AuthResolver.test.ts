import { AuthResolver } from '../../../src/resolvers';
import { createToken } from '../../../src/utils/createToken';

jest.mock('../../../src/utils/createToken');

describe('AuthResolver unit', () => {
  let authResolver: AuthResolver;

  beforeEach(() => {
    const mockGeneralPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockJwt = {
      sign: jest.fn(),
    };
    const mockNotificationPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockEmailNotificationPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockProfileRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const mockTransporter = {
      sendVerificationEmail: jest.fn(),
    };
    const mockIoRedis = {
      del: jest.fn(),
      setex: jest.fn(),
    };

    function MockGeneralPreferencesService(
      this: any,
      mockRepository: typeof mockGeneralPreferencesRepository
    ) {
      this.create = jest.fn().mockReturnValue({
        id: 2,
      });
      this.generalPreferencesRepository = mockRepository;
    }

    function MockJwtService(this: any, jwt: typeof mockJwt) {
      this.createTokens = jest.fn();
      this.jwt = jwt;
    }

    function MockNotificationPreferencesService(
      this: any,
      mockRepository: typeof mockNotificationPreferencesRepository
    ) {
      this.create = jest.fn().mockReturnValue({
        id: 3,
      });
      this.notificationPreferencesRepository = mockRepository;
    }

    function MockEmailNotificationPreferencesService(
      this: any,
      mockRepository: typeof mockEmailNotificationPreferencesRepository
    ) {
      this.create = jest.fn().mockReturnValue({
        id: 4,
      });
      this.emailNotificationPreferencesRepository = mockRepository;
    }

    function MockMailService(this: any, transporter: typeof mockTransporter) {
      this.sendVerificationEmail = jest.fn();
      this.transporter = transporter;
    }

    function MockRedisService(this: any, mockRedis: any) {
      this.redisClient = mockRedis;
      this.add = jest.fn();
      this.remove = jest.fn();
    }

    function MockProfileService(
      this: any,
      mockRepository: typeof mockProfileRepository
    ) {
      this.create = jest.fn().mockReturnValue({
        id: 1,
      });
      this.getAll = jest.fn();
      this.profileRepository = mockRepository;
    }

    function MockUserService(
      this: any,
      mockRepository: typeof mockUserRepository
    ) {
      this.create = jest.fn().mockReturnValue({
        email: 'test@test.com',
        username: 'testtest',
        password: 'testtesttest',
      });
      this.getAll = jest.fn();
      this.getByEmail = jest.fn();
      this.getById = jest.fn();
      this.getByUsername = jest.fn();
      this.userRepository = mockRepository;
    }

    authResolver = new AuthResolver(
      new (MockGeneralPreferencesService as any)(
        mockGeneralPreferencesRepository
      ),
      new (MockNotificationPreferencesService as any)(
        mockNotificationPreferencesRepository
      ),
      new (MockEmailNotificationPreferencesService as any)(
        mockEmailNotificationPreferencesRepository
      ),
      new (MockJwtService as any)(mockJwt),
      new (MockMailService as any)(mockTransporter),
      new (MockProfileService as any)(mockProfileRepository),
      new (MockRedisService as any)(mockIoRedis),
      new (MockUserService as any)(mockUserRepository)
    );
  });

  it('should define a module', () => {
    expect(authResolver).toBeDefined();
  });

  describe('register mutation', () => {
    const fakeToken = 'thisisthefaketoken';

    // @ts-ignore
    createToken.mockImplementationOnce(() => fakeToken);

    it('should call generalPreferencesService.create, notificationPreferencesService.create, emailNotificationPreferencesService.create mailService.sendVerificationEmail, profileService.create, userService.create, jwtService.createTokens, res.cookie and redisService.add', async () => {
      const createUserData = {
        email: 'ben@ben.com',
        password: 'benben',
        username: 'benben',
      };
      const expectedCookieOptions = {
        httpOnly: true,
        secure: false,
        signed: true,
      };
      const mockContext: any = {
        res: {
          cookie: jest.fn(),
        },
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const expectedCreateUserParams = {
        ...createUserData,
        emailNotificationPreferences: { id: 4 },
        generalPreferences: { id: 2 },
        notificationPreferences: { id: 3 },
        profile: { id: 1 },
      };

      authResolver.jwtService.createTokens = jest
        .fn()
        .mockReturnValue([accessToken, refreshToken]);

      await authResolver.register(createUserData, mockContext);

      expect(
        authResolver.mailService.sendVerificationEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        authResolver.mailService.sendVerificationEmail
      ).toHaveBeenCalledWith(
        createUserData.email,
        createUserData.username,
        fakeToken
      );

      expect(authResolver.profileService.create).toHaveBeenCalledTimes(1);

      expect(
        authResolver.generalPreferencesService.create
      ).toHaveBeenCalledTimes(1);

      expect(
        authResolver.notificationPreferencesService.create
      ).toHaveBeenCalledTimes(1);

      expect(
        authResolver.emailNotificationPreferencesService.create
      ).toHaveBeenCalledTimes(1);

      expect(authResolver.userService.create).toHaveBeenCalledTimes(1);
      expect(authResolver.userService.create).toHaveBeenCalledWith(
        expectedCreateUserParams
      );

      expect(authResolver.jwtService.createTokens).toHaveBeenCalledTimes(1);
      expect(authResolver.jwtService.createTokens).toHaveBeenCalledWith({
        email: createUserData.email,
        username: createUserData.username,
      });

      expect(mockContext.res.cookie).toHaveBeenCalledTimes(2);
      expect(mockContext.res.cookie).toHaveBeenNthCalledWith(
        1,
        'session-access-token',
        accessToken,
        {
          ...expectedCookieOptions,
          maxAge: 60 * 60 * 15,
        }
      );
      expect(mockContext.res.cookie).toHaveBeenNthCalledWith(
        2,
        'session-refresh-token',
        refreshToken,
        {
          ...expectedCookieOptions,
          maxAge: 60 * 60 * 24 * 365,
        }
      );

      expect(authResolver.redisService.add).toHaveBeenCalledTimes(1);
      expect(authResolver.redisService.add).toHaveBeenCalledWith(
        `${createUserData.username}:refreshToken`,
        60 * 60 * 24 * 365, // 1 year
        refreshToken
      );
    });
  });
});
