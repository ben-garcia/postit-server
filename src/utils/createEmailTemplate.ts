import Email from 'email-templates';
import { join, resolve } from 'path';

/**
 * Instantiate an instance email template.
 *
 * Configured with express-handlebars and
 * to inject inline styles using style.css
 */
export const createEmailTemplate = (): Email => {
  // @ts-ignore
  return new Email({
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: join(__dirname, '..', 'emails', 'verification'),
      },
    },
    juiceSettings: {
      tableElements: ['TABLE'],
    },
    // get a preview using firefox.
    // used when ethereal email site has a 500 error.
    /*
      preview: {
        open: {
          app: 'firefox',
          wait: false,
        },
      },
      message: {
        from: 'from@email.com',
        to: 'to@email.com',
      },
      transport: this.transporter,
			*/
    views: {
      options: {
        extension: 'hbs',
      },
      root: resolve('src', 'emails'),
    },
  });
};
