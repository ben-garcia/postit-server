import { NotificationPreferencesService } from '../../../src/services';

describe('NotificationPreferencesService', () => {
  let notificationPreferencesService: NotificationPreferencesService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      save: jest.fn(),
    };

    notificationPreferencesService = new NotificationPreferencesService(
      mockModel
    );
  });

  it('should be a module', () => {
    expect(notificationPreferencesService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create and save methods from the model', async () => {
      await notificationPreferencesService.create();

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.save).toHaveBeenCalledTimes(1);
    });
  });
});
