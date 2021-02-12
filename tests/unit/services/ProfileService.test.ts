import { ProfileService } from '../../../src/services';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      save: jest.fn(),
    };

    profileService = new ProfileService(mockModel);
  });

  it('should be a module', () => {
    expect(profileService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create and save methods from the model', async () => {
      await profileService.create();

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.save).toHaveBeenCalledTimes(1);
    });
  });
});
