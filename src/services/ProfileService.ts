import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { Profile } from '../entities';

/**
 * This service interacts with the 'profile' table
 */
@Service()
class ProfileService {
  private profileRepository: Repository<Profile>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * userRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    @Inject('profileRepository') profileRepository: Repository<Profile>
  ) {
    this.profileRepository = profileRepository;
  }

  /**
   * Create a profile and save it the the database.
   */
  async create(): Promise<Profile> {
    const newProfile = this.profileRepository.create();
    await this.profileRepository.save(newProfile);

    return newProfile;
  }
}

export default ProfileService;
