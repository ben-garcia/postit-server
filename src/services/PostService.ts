import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import { Community, Post, User } from '../entities';

interface CreatePostDTO {
  linkUrl?: string;
  title: string;
}

/**
 * This service queries the 'posts' table
 */
@Service()
class PostService {
  public postRepository: Repository<Post>;

  /**
   * Contructor injection via typedi's Inject decorator.
   *
   * postRepository is the name of the service, used later,
   * when setting it's value in the index file.
   */
  constructor(@Inject('postRepository') postRepository: Repository<Post>) {
    this.postRepository = postRepository;
  }

  /**
   * Create a post and save it the the database.
   *
   * @param post the info for the new post to create
   * @param community the community that the post belongs to
   * @param creator the user that created the post
   */
  async create(
    post: CreatePostDTO,
    community: Community,
    creator: User
  ): Promise<Post> {
    const newPost = this.postRepository.create({
      ...post,
      community,
      creator,
    });

    await this.postRepository.save(newPost);

    return newPost;
  }

  /**
   * Fetch a post by name
   */
  async getById(id: number): Promise<Post | undefined> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['community', 'creator'],
    });
  }
}

export default PostService;
