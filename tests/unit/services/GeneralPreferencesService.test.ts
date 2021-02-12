import { GeneralPreferencesService } from '../../../src/services';

describe('GeneralPreferencesService', () => {
  let generalPreferencesService: GeneralPreferencesService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      save: jest.fn(),
    };

    generalPreferencesService = new GeneralPreferencesService(mockModel);
  });

  it('should be a module', () => {
    expect(generalPreferencesService).toBeDefined();
  });

  describe('create', () => {
    it('should call the create and save methods from the model', async () => {
      await generalPreferencesService.create();

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.save).toHaveBeenCalledTimes(1);
    });
  });
});
