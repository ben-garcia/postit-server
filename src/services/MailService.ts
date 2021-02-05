import { Transporter } from 'nodemailer';
import { Inject, Service } from 'typedi';

/**
 * This service sends emails to users for
 *
 * Registeration
 * Resend registration email
 * Change email
 * Change password
 * Stripe payment confirmation
 * Paypal payment confirmation
 */
@Service()
class MailService {
  private transporter: Transporter;

  /**
   * Contructor injection via typedi's Inject decorator
   *
   * transporter is the name of the service, which is used
   * when setting it's value by calling Container.set.
   */
  constructor(@Inject('transporter') transporter: Transporter) {
    this.transporter = transporter;
  }

  /**
   * Send an email to get the user to verify their email address.
   */
  async sendVerificationEmail(
    email: string,
    username: string,
    base64String: string
  ) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const sendMailOptions = {
      from: 'Postit <foo@example.com>',
      to: `${email}`,
      subject: 'Verify your Postit email address',
      text: `Hi there,
					   Your email address ${email} has been added to your
						 ${username} Postit account. But wait, we’re not done yet...

						 To finish verifying your email address and securing your account, click the
						 button below.

						${clientUrl}/verification/${base64String}
			`,
      html: `
					<div style="width: 100%; height: 100%">
						<div style="line-height: 18px;
											  font-family: Helvetica, Arial, sans-serif;
										    margin: 0 auto;
											  width: 45%;">
							<div style="display: flex; justify-content: space-between;">
								<span style="font-size: 30px">postit</span>	
								<a style="text-decoration: none" href="${clientUrl}/user/${username}"><span style="color: #7A9299; font-size: 10px">u/${username}</span></a>
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
								href="${clientUrl}/verification/${base64String}"
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
    const info = await this.transporter.sendMail(sendMailOptions);
    const previewUrl = info.response.substring(
      info.response.lastIndexOf('=') + 1,
      info.response.length - 1
    );

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line
			console.log(`https://ethereal.email/message/${previewUrl}`);
    }
  }
}

export default MailService;
