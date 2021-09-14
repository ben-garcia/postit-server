import { PostService } from '../../../src/services';

describe('PostService', () => {
  let postService: PostService;
  let mockPostRepository: any;

  beforeEach(() => {
    mockPostRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    postService = new PostService(mockPostRepository);
  });

  it('should be a module', () => {
    expect(postService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create method from post model and save method from the model', async () => {
      const community: any = {
        name: 'testname',
        description: 'testing',
        isNsfw: false,
        type: 'public',
      };
      const post = {
        contentKind: 'self',
        isNsfw: false,
        isOriginalContent: false,
        isSpoiler: false,
        sendReplies: false,
        submitType: 'community',
        richTextJson: '2nd post text',
        title: '2nd post',
      };
      const creator: any = {
        id: 1,
        username: 'testuser',
      };

      await postService.create(post, community, creator);

      expect(postService.postRepository.create).toHaveBeenCalledTimes(1);
      expect(postService.postRepository.create).toHaveBeenNthCalledWith(1, {
        ...post,
        creator,
        community,
      });
    });
  });

  describe('getById', () => {
    it('should call the findOne method from post model', async () => {
      const id = 1;

      await postService.getById(id);

      expect(postService.postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postService.postRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id },
        relations: ['community', 'creator'],
      });
    });
  });
});
