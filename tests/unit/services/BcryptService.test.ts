import { BcryptService } from '../../../src/services';

describe('BcryptService', () => {
  let bcryptService: BcryptService;
  let mockBcrypt: any;

  beforeEach(() => {
    mockBcrypt = {
      compare: jest.fn().mockReturnValueOnce(true),
    };

    bcryptService = new BcryptService(mockBcrypt);
  });

  it('should be a module', () => {
    expect(bcryptService).toBeDefined();
  });

  describe('validatePassword', () => {
    it('should call the bcrypt.compare method', async () => {
      const user = {
        password: 'bestpassword',
        username: 'ben',
      };
      const hashedPassword = 'hashedPassword';
      await bcryptService.validatePassword(user.password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
      expect(mockBcrypt.compare).toHaveBeenNthCalledWith(
        1,
        user.password,
        hashedPassword
      );
    });
  });
});
