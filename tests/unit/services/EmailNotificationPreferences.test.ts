import { EmailNotificationPreferencesService } from '../../../src/services';

describe('EmailNotificationPreferencesService', () => {
  let emailNotificationPreferencesService: EmailNotificationPreferencesService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      save: jest.fn(),
    };

    emailNotificationPreferencesService = new EmailNotificationPreferencesService(
      mockModel
    );
  });

  it('should be a module', () => {
    expect(emailNotificationPreferencesService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create and save methods from the model', async () => {
      await emailNotificationPreferencesService.create();

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.save).toHaveBeenCalledTimes(1);
    });
  });
});
