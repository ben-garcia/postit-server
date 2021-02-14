import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailNotificationPreferences1613170625610
  implements MigrationInterface {
  name = 'CreateEmailNotificationPreferences1613170625610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_notification_preferences" ("id" SERIAL NOT NULL, "inboxMessages" boolean NOT NULL DEFAULT true, "chatRequests" boolean NOT NULL DEFAULT true, "commentReplies" boolean NOT NULL DEFAULT true, "commentUpvotes" boolean NOT NULL DEFAULT true, "newFollowers" boolean NOT NULL DEFAULT true, "postComments" boolean NOT NULL DEFAULT true, "postUpvotes" boolean NOT NULL DEFAULT true, "usernameMentions" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a4878edf858722ac8964e48860d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "emailNotificationPreferencesId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_20707f561a60067d12edb5d185d" UNIQUE ("emailNotificationPreferencesId")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_20707f561a60067d12edb5d185d" FOREIGN KEY ("emailNotificationPreferencesId") REFERENCES "notification_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_20707f561a60067d12edb5d185d"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_20707f561a60067d12edb5d185d"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "emailNotificationPreferencesId"`
    );
    await queryRunner.query(`DROP TABLE "email_notification_preferences"`);
  }
}
