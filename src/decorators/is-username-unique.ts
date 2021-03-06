import { registerDecorator, ValidationOptions } from 'class-validator';

import { User } from '../entities';

/**
 * Custom class-validator decorator.
 *
 * Used to check for a unique username.
 */
function IsUsernameUnique(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isUsernameUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: async (username: string): Promise<boolean> => {
          try {
            const user = await User.findOne({ where: { username } });
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

export default IsUsernameUnique;
