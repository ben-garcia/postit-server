import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { Profile, User } from '../entities';

interface CreateUserDTO {
  email: string;
  profile: Profile;
  username: string;
  password: string;
}

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
   * Create a user and save it the the database.
   */
  async create(user: CreateUserDTO): Promise<User> {
    const newUser = this.userRepository.create(user);
    await this.userRepository.save(newUser);

    return newUser;
  }

  /**
   * Fetch all users.
   */
  async getAll(): Promise<User[] | undefined> {
    return this.userRepository.find({ relations: ['profile'] });
  }

  /**
   * Fetch a user by email
   */
  async getByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Fetch a user by id
   */
  async getById(id: number | string): Promise<User | undefined> {
    return this.userRepository.findOne(id);
  }

  /**
   * Fetch a user by username
   */
  async getByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }
}

export default UserService;
