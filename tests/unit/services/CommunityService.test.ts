import { CommunityService } from '../../../src/services';

describe('CommunityService', () => {
  let communityService: CommunityService;
  let mockCommunityRepository: any;

  beforeEach(() => {
    mockCommunityRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    communityService = new CommunityService(mockCommunityRepository);
  });

  it('should be a module', () => {
    expect(communityService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create method from community model and save method from the model', async () => {
      const community: any = {
        name: 'testname',
        description: 'testing',
        isNsfw: false,
        type: 'public',
      };
      const user: any = { email: 'ben@ben.com', username: 'ben' };

      await communityService.create(community, user);

      expect(communityService.communityRepository.create).toHaveBeenCalledTimes(
        1
      );
      expect(
        communityService.communityRepository.create
      ).toHaveBeenNthCalledWith(1, { creator: user, ...community });
    });
  });
});
