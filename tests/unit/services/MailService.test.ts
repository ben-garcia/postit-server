import { MailService } from '../../../src/services';

describe('MailService', () => {
  let mailService: MailService;
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockReturnValue({
        response: {
          length: jest.fn(),
          lastIndexOf: jest.fn(),
          substring: jest.fn(),
        },
      }),
    };

    mailService = new MailService(mockTransporter);
  });

  it('should be a module', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call the sendMail method of the transporter', async () => {
      const expected = {
        from: '"Fred Foo 👻" <foo@example.com>',
        to: 'bar@example.com, baz@example.com',
        subject: 'Hello ✔',
        text: 'Hello world?',
        html: '<b>Hello world?</b>',
      };

      await mailService.sendEmail();

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expected);
    });
  });
});
