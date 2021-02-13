import { UserService } from '../../../src/services';

describe('UserService', () => {
  let userService: UserService;
  let mockEmailNotificationPreferencesRepository: any;
  let mockGeneralPreferencesRepository: any;
  let mockNotificationPreferencesRepository: any;
  let mockProfileRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockGeneralPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockNotificationPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockEmailNotificationPreferencesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockProfileRepository = {
      create: jest.fn(),
      save: jest.fn(),
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

    userService = new UserService(
      new (MockEmailNotificationPreferencesService as any)(
        mockEmailNotificationPreferencesRepository
      ),
      new (MockGeneralPreferencesService as any)(
        mockGeneralPreferencesRepository
      ),
      new (MockNotificationPreferencesService as any)(
        mockNotificationPreferencesRepository
      ),
      new (MockProfileService as any)(mockProfileRepository),
      mockUserRepository
    );
  });

  it('should be a module', () => {
    expect(userService).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should call the findOne method from the model', async () => {
      const email = 'ben@ben.com';
      const expected = {
        where: { email },
      };

      await userService.getByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expected);
    });
  });

  describe('getById', () => {
    it('should call the findOne method from the model', async () => {
      const id = 1;

      await userService.getById(id);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('getByUsername', () => {
    it('should call the findOne method from the model', async () => {
      const username = 'benben';
      const expected = {
        where: { username },
      };

      await userService.getByUsername(username);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expected);
    });
  });

  describe('create', () => {
    it('should call the create method from profileService, generalPreferencesService, notificationPreferencesService, emailNotificationPreferencesService, model and save method from the model', async () => {
      const user: any = {
        email: 'test@test.com',
        generalPreferences: {
          id: 2,
        },
        notificationPreferences: {
          id: 3,
        },
        profile: {
          id: 1,
        },
        emailNotificationPreferences: {
          id: 4,
        },
        password: 'benbenben',
        username: 'benben',
      };

      await userService.create(user);

      expect(userService.profileService.create).toHaveBeenCalledTimes(1);
      expect(
        userService.generalPreferencesService.create
      ).toHaveBeenCalledTimes(1);
      expect(
        userService.notificationPreferencesService.create
      ).toHaveBeenCalledTimes(1);
      expect(
        userService.emailNotificationPreferencesService.create
      ).toHaveBeenCalledTimes(1);

      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).toHaveBeenCalledWith(user);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
