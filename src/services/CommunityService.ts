import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { Community, User } from '../entities';

interface CreateCommunityDTO {
  description: string;
  name: string;
  isNsfw: boolean;
  type: 'public' | 'protected' | 'private';
}

/**
 * This service queries the 'communities' table
 */
@Service()
class CommunityService {
  public communityRepository: Repository<Community>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * communityRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(
    @Inject('communityRepository') communityRepository: Repository<Community>
  ) {
    this.communityRepository = communityRepository;
  }

  /**
   * Create a community and save it the the database.
   *
   * @param community the info for the new community to create
   * @param user the creator of the new community
   */
  async create(community: CreateCommunityDTO, user: User): Promise<Community> {
    const newCommunity = this.communityRepository.create({
      ...community,
      creator: user,
    });

    await this.communityRepository.save(newCommunity);

    return newCommunity;
  }

  /**
   * Fetch a community by name
   */
  async getByName(name: string): Promise<Community | undefined> {
    return this.communityRepository.findOne({ where: { name } });
  }
}

export default CommunityService;
