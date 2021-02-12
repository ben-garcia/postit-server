import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { EmailNotificationPreferences } from '../entities';

/**
 * This service interacts with the 'email_notification_preferences' table
 */
@Service()
class EmailNotificationPreferencesService {
  private emailNotificationPreferencesRepository: Repository<EmailNotificationPreferences>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * emailNotificationPreferencesRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    @Inject('emailNotificationPreferencesRepository')
    emailNotificationPreferencesRepository: Repository<EmailNotificationPreferences>
  ) {
    this.emailNotificationPreferencesRepository = emailNotificationPreferencesRepository;
  }

  /**
   * Create a email notification preferences and save it the the database.
   */
  async create(): Promise<EmailNotificationPreferences> {
    const newEmailNotificationPreferences = this.emailNotificationPreferencesRepository.create();
    await this.emailNotificationPreferencesRepository.save(
      newEmailNotificationPreferences
    );

    return newEmailNotificationPreferences;
  }
}

export default EmailNotificationPreferencesService;
