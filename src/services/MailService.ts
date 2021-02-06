import Email from 'email-templates';
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
  private emailTemplate: Email;
  private transporter: Transporter;

  /**
   * Contructor injection via typedi's Inject decorator
   *
   * transporter is the name of the service, which is used
   * when setting it's value by calling Container.set.
   */
  constructor(
    @Inject('emailTemplate') emailTemplate: Email,
    @Inject('transporter') transporter: Transporter
  ) {
    this.emailTemplate = emailTemplate;
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
    // build the template using html.hbs, text.hbs, subject.hbs, and style.css
    const { html, subject, text } = await this.emailTemplate.renderAll(
      'verification',
      {
        base64String,
        clientUrl,
        email,
        username,
      }
    );

    const sendMailOptions = {
      from: 'Postit <support@postit.com>',
      html,
      subject,
      text,
      to: email,
    };

    const info = await this.transporter.sendMail(sendMailOptions);

    if (process.env.NODE_ENV !== 'test') {
      const previewUrl = info.response.substring(
        info.response.lastIndexOf('=') + 1,
        info.response.length - 1
      );

      // eslint-disable-next-line
			console.log(`https://ethereal.email/message/${previewUrl}`);
    }
  }
}

export default MailService;
