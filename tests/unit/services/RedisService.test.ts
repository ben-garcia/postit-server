import { RedisService } from '../../../src/services';

describe('RedisService', () => {
  let redisService: RedisService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      del: jest.fn(),
      setex: jest.fn(),
    };

    redisService = new RedisService(mockModel);
  });

  it('should be a module', () => {
    expect(redisService).toBeDefined();
  });

  describe('remove', () => {
    it('should call the del method from the model', () => {
      const key = 'user';
      redisService.remove(key);
      expect(mockModel.del).toHaveBeenCalledTimes(1);
      expect(mockModel.del).toHaveBeenCalledWith(key);
    });
  });

  describe('add', () => {
    it('should call the setex method from the model', () => {
      const expiresIn = 60 * 60; // 1 hour

      const refreshToken = 'refreshtoken';
      const refreshTokenValue = 'refreshtokentosave';

      redisService.add(refreshToken, expiresIn, refreshTokenValue);

      expect(mockModel.setex).toHaveBeenCalledTimes(1);
      expect(mockModel.setex).toHaveBeenCalledWith(
        refreshToken,
        expiresIn,
        JSON.stringify(refreshTokenValue)
      );
    });
  });
});
