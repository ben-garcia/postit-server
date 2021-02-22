import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import { User } from '../entities';
import { createRedisClient, createTransporter } from '.';

export const injectProperties = async () => {
  Container.set('userRepository', getRepository(User));
  Container.set('transporter', await createTransporter());
  Container.set('jwt', jwt);
  Container.set('redisClient', createRedisClient());
};
