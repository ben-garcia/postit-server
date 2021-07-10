import { registerDecorator, ValidationOptions } from 'class-validator';

import { Community } from '../entities';

/**
 * Custom class-validator decorator.
 *
 * Used to check for a unique community name.
 */
function IsCommunityNameUnique(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isCommunityNameUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: async (name: string): Promise<boolean> => {
          try {
            const community = await Community.findOne({ where: { name } });
            if (community) {
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

export default IsCommunityNameUnique;
