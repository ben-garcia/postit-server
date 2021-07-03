import * as Bcrypt from 'bcrypt';
import { Inject, Service } from 'typedi';

/**
 * This Service is responsible for:
 *
 * creating comparing the hashed password in the db
 * with the password in the request when attempting to log in.
 */
@Service()
class BcryptService {
  private bcrypt: typeof Bcrypt;

  constructor(@Inject('bcrypt') bcrypt: typeof Bcrypt) {
    this.bcrypt = bcrypt;
  }

  /**
   * Verify if the password match
   *
   * @param passwordToCheck the password in the request
   * @param userPassword the hashed password associated with the user
   */
  async validatePassword(
    passwordToCheck: string,
    userPassword: string
  ): Promise<boolean> {
    return this.bcrypt.compare(passwordToCheck, userPassword);
  }
}

export default BcryptService;
