import { Connection } from 'typeorm';
import { User } from '../entities';

type Entities = 'users';

/**
 * Provides helper methods for testing.
 */
class TestUtils {
  private connection: Connection;

  /**
   * Setup the connection to the db.
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /*
   * Clear the tables.
   */
  async clearTables(...tables: Entities[]): Promise<void> {
    if (tables.includes('users')) {
      await this.getConnection().getRepository(User).clear();
    }
  }

  /**
   * Closes the db connection.
   */
  async closeConnection(): Promise<void> {
    await this.connection.close();
  }

  /**
   * Getter method to return the connection to the db.
   */
  getConnection(): Connection {
    return this.connection;
  }
}

export default TestUtils;
