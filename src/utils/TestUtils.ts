import { Connection } from 'typeorm';
import { Community, User } from '../entities';

type Entities = 'communities' | 'users';

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
    if (tables.includes('communities')) {
      await this.getConnection()
        .getRepository(Community)
        .query('DELETE FROM communities');
    }
    if (tables.includes('users')) {
      await this.getConnection().getRepository(User).query('DELETE FROM users');
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
