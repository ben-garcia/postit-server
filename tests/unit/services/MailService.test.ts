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

  describe('sendVerificationEmail', () => {
    it('should call the sendMail method of the transporter', async () => {
      const email = 'bar@example.com';
      const username = 'bar';
      const expected = {
        from: 'Postit <foo@example.com>',
        to: `${email}`,
        subject: 'Verify your Postit email address',
        text: `Hi there,
					   Your email address ${email} has been added to your
						 ${username} Postit account. But wait, we’re not done yet...

						 To finish verifying your email address and securing your account, click the
						 button below.`,
        html: `
					<div style="width: 100%; height: 100%">
						<div style="line-height: 18px;
											  font-family: Helvetica, Arial, sans-serif;
										    margin: 0 auto;
											  width: 45%;">
							<div style="display: flex; justify-content: space-between;">
								<span style="font-size: 30px">postit</span>	
								<span style="color: #7A9299; font-size: 10px">u/${username}</span>
							</div>
							<br />
							<br />
							<p style="color: #000">
								<div>
									Hi there,
								</div>
								<br />
								<div>
									Your email address ${email} has been added to your
									<br />
									${username} Postit account. But wait, we’re not done yet...
								</div>
								<br />
								<div>
									To finish verifying your email address and securing your account, click the
									<br />
									button below.
								</div>
							</p>
							<div style="display: flex; justify-content: center; margin-top: 30px;">
							<a
								href="#"
								style="background: #0079D3;
											 border-radius: 4px;
											 font-size: 12px;
											 font-weight: 700;
											 padding: 8px;
											 text-align: center;
											 text-decoration: none;"
							>
								<span style="color: #FFF; padding: 0 22px;">
									Verify Email Address
								</span>
							</a>
						</div>
					</div>
			`,
      };

      await mailService.sendVerificationEmail(email, username);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expected);
    });
  });
});
