import { AuthResolver } from '../../../src/resolvers';
import { createToken } from '../../../src/utils/createToken';

jest.mock('../../../src/utils/createToken');

describe('AuthResolver unit', () => {
  let authResolver: AuthResolver;

  beforeEach(() => {
    const mockJwt = {
      sign: jest.fn(),
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

    function MockAuthService(this: any, jwt: typeof mockJwt) {
      this.createTokens = jest.fn();
      this.jwt = jwt;
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
      new (MockAuthService as any)(mockJwt),
      new (MockMailService as any)(mockTransporter),
      new (MockRedisService as any)(mockIoRedis),
      new (MockUserService as any)(mockUserRepository)
    );
  });

  it('should define a module', () => {
    expect(authResolver).toBeDefined();
  });

  describe('getAllUsers query', () => {
    it('should call getAll method from userService', async () => {
      await authResolver.getAllUsers();

      expect(authResolver.userService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('isEmailUnique query', () => {
    it('should call getByEmail method from userService', async () => {
      const email = 'ben@ben.com';

      await authResolver.isEmailUnique({ email });

      expect(authResolver.userService.getByEmail).toHaveBeenCalledTimes(1);
      expect(authResolver.userService.getByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('isUsernameUnique query', () => {
    it('should call getByUsername method from userService', async () => {
      const username = 'benben';

      await authResolver.isUsernameUnique({ username });

      expect(authResolver.userService.getByUsername).toHaveBeenCalledTimes(1);
      expect(authResolver.userService.getByUsername).toHaveBeenCalledWith(
        username
      );
    });
  });

  describe('register mutation', () => {
    const fakeToken = 'thisisthefaketoken';

    // @ts-ignore
    createToken.mockImplementationOnce(() => fakeToken);

    it('should call mailService.sendVerificationEmail, userService.create, authService.createTokens, res.cookie and redisService.add', async () => {
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

      authResolver.authService.createTokens = jest
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

      expect(authResolver.userService.create).toHaveBeenCalledTimes(1);
      expect(authResolver.userService.create).toHaveBeenCalledWith(
        createUserData
      );

      expect(authResolver.authService.createTokens).toHaveBeenCalledTimes(1);
      expect(authResolver.authService.createTokens).toHaveBeenCalledWith({
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
