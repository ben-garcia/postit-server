import { UserService } from '../../../src/services';

describe('UserService', () => {
  let userService: UserService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    userService = new UserService(mockModel);
  });

  it('should be a module', () => {
    expect(userService).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should call the findOne method from the model', () => {
      const email = 'ben@ben.com';
      const expected = {
        where: { email },
      };

      userService.getByEmail(email);
      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockModel.findOne).toHaveBeenCalledWith(expected);
    });
  });

  describe('getById', () => {
    it('should call the findOne method from the model', () => {
      const id = 1;

      userService.getById(id);
      expect(mockModel.findOne).toHaveBeenCalledTimes(id);
      expect(mockModel.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('getByUsername', () => {
    it('should call the findOne method from the model', () => {
      const username = 'benben';
      const expected = {
        where: { username },
      };

      userService.getByUsername(username);
      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockModel.findOne).toHaveBeenCalledWith(expected);
    });
  });

  describe('create', () => {
    it('should call the create and save methods from the model', () => {
      const user = {
        email: 'test@test.com',
        password: 'benbenben',
        username: 'benben',
      };

      userService.create(user);
      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.create).toHaveBeenCalledWith(user);
      expect(mockModel.save).toHaveBeenCalledTimes(1);
    });
  });
});
