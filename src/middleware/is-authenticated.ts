import * as jwt from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';

import { MyContext } from '../types';

const isAuthenticated: MiddlewareFn<MyContext> = (
  { context: { req, res } },
  next
) => {
  const jwtSecret = process.env.JWT_SECRET || 'thisisasecret';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'secretrefresh';
  const {
    'session-access-token': sessionAccessToken,
    'session-refresh-token': sessionRefreshToken,
  } = req.signedCookies;
  let decodedSessionRefreshToken: any;

  try {
    if (sessionRefreshToken) {
      decodedSessionRefreshToken = jwt.verify(
        sessionRefreshToken,
        jwtRefreshSecret
      );
    }
  } catch (e) {
    // eslint-disable-next-line
    console.log('jwt.verify error: ', e);
  }

  console.log('refresh: ', decodedSessionRefreshToken);

  if (!sessionRefreshToken) {
    throw new Error('Unauthorized');
  }

  if (!sessionAccessToken && sessionRefreshToken) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ?? false,
      signed: true,
    };
    let newAccessToken;
    let newRefreshToken;

    try {
      newAccessToken = jwt.sign(
        {
          email: decodedSessionRefreshToken.email,
          usename: decodedSessionRefreshToken.usename,
        },
        jwtSecret
      );
      newRefreshToken = jwt.sign(
        {
          email: decodedSessionRefreshToken.email,
          usename: decodedSessionRefreshToken.usename,
          accessToken: newAccessToken,
          exp: decodedSessionRefreshToken.exp,
        },
        jwtRefreshSecret
      );
    } catch (e) {
      // eslint-disable-next-line
      console.log('jwt.sign error: ', e);
    }

    res.cookie('session-access-token', newAccessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 15, // 15 minutes
    });

    res.cookie('session-refresh-token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });

    return next();
  }
  // TODO add username to req object
  (req as any).username = decodedSessionRefreshToken.username;

  return next();
};

export default isAuthenticated;
