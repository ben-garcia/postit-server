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

  if (!sessionRefreshToken) {
    // set the status to 401 when authentication fails
    // TODO find a way to get a 401 when formatting the response
    // as it currently sends a 400 with a formatted response
    res.status(401);
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({ error: { message: 'Unauthorized' } });
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
          username: decodedSessionRefreshToken.username,
        },
        jwtSecret
      );
      newRefreshToken = jwt.sign(
        {
          email: decodedSessionRefreshToken.email,
          username: decodedSessionRefreshToken.username,
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
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie('session-refresh-token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }

  req.username = decodedSessionRefreshToken.username;

  return next();
};

export default isAuthenticated;
