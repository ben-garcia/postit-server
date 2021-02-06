import { MailService } from '../../../src/services';

describe('MailService', () => {
  let mailService: MailService;
  let mockTransporter: any;
  let mockEmailTemplate: any;
  const email = 'bar@example.com';
  const username = 'bar';
  const subject = 'Verify your Postit email address';
  const base64String = 'jksjlfjlaksjkslajfksafj';
  const text = `Postit		u/${username} [http://localhost:3000/user/${username}]

Hi there,

Your email address ${email} has been added to your
${username} Postit account. But wait, we’re not done yet...

To finish verifying your email address and securing your account, click the
button below.

Verify Email Address
[http://localhost:3000/verification/${base64String}]
`;
  const html = `<!DOCTYPE html>
<html>
	<head>
		<title>Email Verification</title>
		
	</head>
	<body>
		<div class="container" style="height: 100%; width: 100%;">
			<div class="container__inner" style="font-family: Helvetica, Arial, sans-serif; line-height: 18px; margin: 0 auto; width: 45%;">
				<div class="top-nav" style="display: flex; justify-content: space-between;">
					<span class="text-lg" style="font-size: 30px;">postit</span>	
					<a class="no-underline" href="http://localhost:3000/user/${username}" style="text-decoration: none;">
						<span class="color-gray text-sm" style="font-size: 10px; color: #7a9299;">
							u/${username}
						</span>
					</a>
				</div>
				<br>
				<br>
				<div class="color-black" style="color: #000;">
					<p>Hi there,</p>
					<p>
						Your email address ${email} has been added to your
						<br>
						${username} Postit account. But wait, we’re not done yet...
					</p>
					<p>
						To finish verifying your email address and securing your account, click the
						<br>
						button below.
					</p>
				</div>
				<div class="button-container" style="display: flex; justify-content: center; margin-top: 30px;">
					<a href="http://localhost:3000/verification/jksjlfjlaksjkslajfksafj" class="button no-underline" style="text-decoration: none; background: #0079d3; border-radius: 4px; font-size: 12px; font-weight: 700; padding: 8px; text-align: center;">
						<span class="button__text color-white" style="color: #fff; padding: 0 22px;">
							Verify Email Address
						</span>
					</a>
			</div>
		</div>
	</div></body>
</html>

`;

  beforeAll(() => {
    mockEmailTemplate = {
      renderAll: jest.fn().mockImplementation(() => ({
        html,
        subject,
        text,
      })),
    };

    mockTransporter = {
      sendMail: jest.fn().mockReturnValue({
        response: {
          length: jest.fn(),
          lastIndexOf: jest.fn(),
          substring: jest.fn(),
        },
      }),
    };

    mailService = new MailService(mockEmailTemplate, mockTransporter);
  });

  it('should be a module', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call the transporter.sendMail and emailTemplate.renderAll', async () => {
      const sendMailExpectedArgs = {
        from: 'Postit <support@postit.com>',
        html,
        subject: 'Verify your Postit email address',
        to: email,
        text,
      };
      const clientUrl = 'http://localhost:3000';
      const renderAllExpectedArgs = {
        base64String,
        clientUrl,
        email,
        username,
      };

      await mailService.sendVerificationEmail(email, username, base64String);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        sendMailExpectedArgs
      );

      expect(mockEmailTemplate.renderAll).toHaveBeenCalledTimes(1);
      expect(mockEmailTemplate.renderAll).toHaveBeenCalledWith(
        'verification',
        renderAllExpectedArgs
      );
    });

    it('should match text snapshot', () => {
      expect(text).toMatchSnapshot();
    });

    it('should match html snapshot', () => {
      expect(html).toMatchSnapshot();
    });
  });
});
