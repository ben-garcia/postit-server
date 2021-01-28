import { registerDecorator, ValidationOptions } from 'class-validator';

import User from '../entities/User';

/**
 * Custom class-validator decorator.
 *
 * Used to check for a unique email.
 */
export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isEmailUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: async (email: string): Promise<boolean> => {
          try {
            const user = await User.findOne({ where: { email } });
            if (user) {
              return false;
            }
            return true;
          } catch (e) {
            return false;
          }
        },
      },
    });
  };
}
