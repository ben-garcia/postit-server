import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPreferences1613167596109
  implements MigrationInterface {
  name = 'CreateNotificationPreferences1613167596109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" ("id" SERIAL NOT NULL, "announcements" boolean NOT NULL DEFAULT true, "awardsReceived" boolean NOT NULL DEFAULT true, "cakeDay" boolean NOT NULL DEFAULT true, "chatMessages" boolean NOT NULL DEFAULT true, "chatsPostsActivity" boolean NOT NULL DEFAULT true, "chatRequests" boolean NOT NULL DEFAULT true, "commentReplies" boolean NOT NULL DEFAULT true, "commentsActivity" boolean NOT NULL DEFAULT true, "commentsOnPosts" boolean NOT NULL DEFAULT true, "inboxMessages" boolean NOT NULL DEFAULT true, "modNotifications" boolean NOT NULL DEFAULT true, "newFollowers" boolean NOT NULL DEFAULT true, "newPostFlair" boolean NOT NULL DEFAULT true, "newUserFlair" boolean NOT NULL DEFAULT true, "pinnedPosts" boolean NOT NULL DEFAULT true, "threadsActivity" boolean NOT NULL DEFAULT true, "upvotesOnComments" boolean NOT NULL DEFAULT true, "upvotesOnPosts" boolean NOT NULL DEFAULT true, "usernameMentions" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notificationPreferencesId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_a72d11b59941531f90acc875435" UNIQUE ("notificationPreferencesId")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a72d11b59941531f90acc875435" FOREIGN KEY ("notificationPreferencesId") REFERENCES "notification_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a72d11b59941531f90acc875435"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_a72d11b59941531f90acc875435"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notificationPreferencesId"`
    );
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
  }
}
