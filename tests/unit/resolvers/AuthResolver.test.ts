import { AuthResolver } from '../../../src/resolvers';

describe('AuthResolver unit', () => {
  let authResolver: AuthResolver;

  beforeEach(() => {
    const mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    function MockUserService(
      this: any,
      mockRepository: typeof mockUserRepository
    ) {
      this.create = jest.fn();
      this.getAll = jest.fn();
      this.getByEmail = jest.fn();
      this.getById = jest.fn();
      this.getByUsername = jest.fn();
      this.userRepository = mockRepository;
    }

    authResolver = new AuthResolver(
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
    it('should call the create method from userService', async () => {
      const createUserData = {
        email: 'ben@ben.com',
        password: 'benben',
        username: 'benben',
      };

      await authResolver.register(createUserData);

      expect(authResolver.userService.create).toHaveBeenCalledTimes(1);
      expect(authResolver.userService.create).toHaveBeenCalledWith(
        createUserData
      );
    });
  });
});
