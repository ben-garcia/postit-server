import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { GeneralPreferences } from '../entities';

/**
 * This service interacts with the 'general_preferences' table
 */
@Service()
class GeneralPreferencesService {
  private generalPreferencesRepository: Repository<GeneralPreferences>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * generalPreferencesRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    @Inject('generalPreferencesRepository')
    generalPreferencesRepository: Repository<GeneralPreferences>
  ) {
    this.generalPreferencesRepository = generalPreferencesRepository;
  }

  /**
   * Create a general preferences and save it the the database.
   */
  async create(): Promise<GeneralPreferences> {
    const newGeneralPreferences = this.generalPreferencesRepository.create();
    await this.generalPreferencesRepository.save(newGeneralPreferences);

    return newGeneralPreferences;
  }
}

export default GeneralPreferencesService;
