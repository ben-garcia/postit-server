import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfile1613150231155 implements MigrationInterface {
  name = 'CreateProfile1613150231155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" SERIAL NOT NULL, "about" character varying(200), "activityVisibility" boolean NOT NULL DEFAULT true, "avatarUrl" character varying, "awardeeKarma" integer NOT NULL DEFAULT '0', "awarderKarma" integer NOT NULL DEFAULT '0', "bannerUrl" character varying, "canCreateCommunitites" boolean NOT NULL DEFAULT true, "coinCount" integer NOT NULL DEFAULT '0', "contentVisibility" boolean NOT NULL DEFAULT true, "commentKarma" integer NOT NULL DEFAULT '0', "displayName" character varying(30), "hasNightmode" boolean NOT NULL DEFAULT false, "hasPaypalSubscription" boolean NOT NULL DEFAULT false, "hasPremium" boolean NOT NULL DEFAULT false, "hasStripeSubscription" boolean NOT NULL DEFAULT false, "hasUnreadMail" boolean NOT NULL DEFAULT false, "hasUnreadModmail" boolean NOT NULL DEFAULT false, "hasVerifiedEmail" boolean NOT NULL DEFAULT false, "isModerator" boolean NOT NULL DEFAULT false, "isSuspended" boolean NOT NULL DEFAULT false, "postKarma" integer NOT NULL DEFAULT '0', "showNsfw" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "profileId" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_b1bda35cdb9a2c1b777f5541d87" UNIQUE ("profileId")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_b1bda35cdb9a2c1b777f5541d87"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileId"`);
    await queryRunner.query(`DROP TABLE "profile"`);
  }
}
