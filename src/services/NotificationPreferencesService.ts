import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { NotificationPreferences } from '../entities';

/**
 * This service interacts with the 'notification_preferences' table
 */
@Service()
class NotificationPreferencesService {
  private notificationPreferencesRepository: Repository<NotificationPreferences>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * notificationPreferencesRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    @Inject('notificationPreferencesRepository')
    notificationPreferencesRepository: Repository<NotificationPreferences>
  ) {
    this.notificationPreferencesRepository = notificationPreferencesRepository;
  }

  /**
   * Create a notification preferences and save it the the database.
   */
  async create(): Promise<NotificationPreferences> {
    const newNotificationPreferences = this.notificationPreferencesRepository.create();
    await this.notificationPreferencesRepository.save(
      newNotificationPreferences
    );

    return newNotificationPreferences;
  }
}

export default NotificationPreferencesService;
