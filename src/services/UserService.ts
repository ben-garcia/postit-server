import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { User } from '../entities';

/**
 * This service queries the 'users' table
 */
@Service()
class UserService {
  private userRepository: Repository<User>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * userRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(@Inject('userRepository') userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  /**
   * Fetch all users.
   */
  async getAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }
}

export default UserService;
