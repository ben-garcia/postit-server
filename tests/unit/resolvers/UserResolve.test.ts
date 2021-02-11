import { UserResolver } from '../../../src/resolvers';

describe('UserResolver unit', () => {
  let userResolver: UserResolver;

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

    userResolver = new UserResolver(
      new (MockUserService as any)(mockUserRepository)
    );
  });

  it('should define a module', () => {
    expect(userResolver).toBeDefined();
  });

  describe('getAllUsers query', () => {
    it('should call getAll method from userService', async () => {
      await userResolver.getAllUsers();

      expect(userResolver.userService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('isUsernameUnique query', () => {
    it('should call getByUsername method from userService', async () => {
      const username = 'benben';

      await userResolver.isUsernameUnique({ username });

      expect(userResolver.userService.getByUsername).toHaveBeenCalledTimes(1);
      expect(userResolver.userService.getByUsername).toHaveBeenCalledWith(
        username
      );
    });
  });
});
