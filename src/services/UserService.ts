import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import {
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Profile,
  User,
} from '../entities';
import {
  EmailNotificationPreferencesService,
  GeneralPreferencesService,
  NotificationPreferencesService,
  ProfileService,
} from '.';

interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
}

/**
 * This service queries the 'users' table
 */
@Service()
class UserService {
  public emailNotificationPreferencesService: EmailNotificationPreferencesService;
  public generalPreferencesService: GeneralPreferencesService;
  public notificationPreferencesService: NotificationPreferencesService;
  public profileService: ProfileService;
  public userRepository: Repository<User>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * userRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    emailNotificationPreferencesService: EmailNotificationPreferencesService,
    generalPreferencesService: GeneralPreferencesService,
    notificationPreferencesService: NotificationPreferencesService,
    profileService: ProfileService,
    @Inject('userRepository') userRepository: Repository<User>
  ) {
    this.emailNotificationPreferencesService = emailNotificationPreferencesService;
    this.generalPreferencesService = generalPreferencesService;
    this.notificationPreferencesService = notificationPreferencesService;
    this.profileService = profileService;
    this.userRepository = userRepository;
  }

  /**
   * Create a user(along with a corresponding generalPreferences,
   * notificationPreferences, emailNotificationPreferences, profile)
   * and save it the the database.
   */
  async create(user: CreateUserDTO): Promise<User> {
    const profile = await this.profileService.create();
    const generalPreferences = await this.generalPreferencesService.create();
    const notificationPreferences = await this.notificationPreferencesService.create();
    const emailNotificationPreferences = await this.emailNotificationPreferencesService.create();
    const newUser = this.userRepository.create({
      ...user,
      emailNotificationPreferences,
      generalPreferences,
      notificationPreferences,
      profile,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  /**
   * Fetch all users.
   */
  async getAll(): Promise<User[] | undefined> {
    return this.userRepository.find({
      relations: [
        'emailNotificationPreferences',
        'generalPreferences',
        'notificationPreferences',
        'profile',
      ],
    });
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
