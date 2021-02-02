import { v4 as uuid } from 'uuid';

/**
 * Create a unique token.
 *
 * Used by the MailService when sending an email.
 */
export const createToken = (): string => {
  const uuidString = uuid();
  const anotherUuidString = uuid();
  const combinedString = `${uuidString}-${anotherUuidString}`;
  const base64String = Buffer.from(combinedString).toString('base64');
  // remove the final 2(==) characters
  const token = base64String.slice(1, base64String.length - 2);

  return token;
};
