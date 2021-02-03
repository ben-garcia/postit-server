import * as JWT from 'jsonwebtoken';
import { Inject, Service } from 'typedi';

interface Payload {
  email: string;
  username: string;
}

/**
 * This Service is responsible for:
 *
 * creating jwt access and refresh tokens.
 * revoking refresh token.
 */
@Service()
class AuthService {
  private jwt: typeof JWT;

  constructor(@Inject('jwt') jwt: typeof JWT) {
    this.jwt = jwt;
  }

  /**
   * Create access token using payload that expires in 15 minutes.
   *
   * Create refresh token using access token that expires in 1 year.
   */
  createTokens(payload: Payload): [string, string] {
    const jwtSecret = process.env.JWT_SECRET || 'thisisasecret';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'secretrefresh';
    const accessToken = this.jwt.sign(payload, jwtSecret, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign(
      { ...payload, accessToken },
      jwtRefreshSecret,
      {
        expiresIn: '1y',
      }
    );

    return [accessToken, refreshToken];
  }
}

export default AuthService;
