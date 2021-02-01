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
   * Send an email.
   */
  async sendEmail() {
    const sendMailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
      subject: 'Hello ✔',
      text: 'Hello world?',
      html: '<b>Hello world?</b>',
    };
    const info = await this.transporter.sendMail(sendMailOptions);
    const previewUrl = info.response.substring(
      info.response.lastIndexOf('=') + 1,
      info.response.length - 1
    );
    // eslint-disable-next-line
    console.log(`https://ethereal.email/message/${previewUrl}`);
  }
}

export default MailService;
