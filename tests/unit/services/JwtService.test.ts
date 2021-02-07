import { JwtService } from '../../../src/services';

describe('JwtService', () => {
  let jwtService: JwtService;
  let mockJwt: any;

  beforeEach(() => {
    mockJwt = {
      sign: jest
        .fn()
        .mockReturnValueOnce('mockvalue1')
        .mockReturnValueOnce('mockvalue2'),
    };

    jwtService = new JwtService(mockJwt);
  });

  it('should be a module', () => {
    expect(jwtService).toBeDefined();
  });

  describe('createTokens', () => {
    it('should call the jwt.sign method twice', () => {
      const jwtSecret = 'thisisasecret';
      const jwtRefreshSecret = 'secretrefresh';
      const user = {
        email: 'user@mail.com',
        username: 'useruser',
      };

      const [accessToken] = jwtService.createTokens(user);

      expect(mockJwt.sign).toHaveBeenCalledTimes(2);
      expect(mockJwt.sign).toHaveBeenNthCalledWith(1, user, jwtSecret, {
        expiresIn: '15m',
      });
      expect(mockJwt.sign).toHaveBeenNthCalledWith(
        2,
        { ...user, accessToken },
        jwtRefreshSecret,
        {
          expiresIn: '1y',
        }
      );
    });
  });
});
