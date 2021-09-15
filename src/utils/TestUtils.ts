import { Connection } from 'typeorm';

import { Community, Post, User } from '../entities';
import App from '../App';

type Entities = 'communities' | 'posts' | 'users';

/**
 * Provides helper methods for testing.
 */
class TestUtils {
  private connection: Connection;
  private app: App;

  /**
   * Setup the connection to the db.
   */
  constructor(connection: Connection) {
    this.connection = connection;
    this.app = new App();
  }

  /*
   * Clear the tables.
   */
  async clearTables(...tables: Entities[]): Promise<void> {
    if (tables.includes('posts')) {
      await this.getConnection().getRepository(Post).query('DELETE FROM posts');
    }

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
   * Getter method to return the app.
   */

  getApp() {
    return this.app.app;
  }

  /**
   * Getter method to return the connection to the db.
   */
  getConnection(): Connection {
    return this.connection;
  }
}

export default TestUtils;
