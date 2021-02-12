import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGeneralPreferences1613159429140
  implements MigrationInterface {
  name = 'CreateGeneralPreferences1613159429140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "general_preferences" ("id" SERIAL NOT NULL, "autoplayMedia" boolean NOT NULL DEFAULT true, "blurNsfw" boolean NOT NULL DEFAULT true, "chatRequestsFrom" character varying NOT NULL DEFAULT 'Everyone', "communityContentSort" character varying NOT NULL DEFAULT 'Hot', "markdownIsDefault" boolean NOT NULL DEFAULT false, "privateMessageFrom" character varying NOT NULL DEFAULT 'Everyone', "openPostInNewTab" boolean NOT NULL DEFAULT false, "reduceAnimations" boolean NOT NULL DEFAULT false, "rememberPerCommunity" boolean NOT NULL DEFAULT true, "useCommunityThemes" boolean NOT NULL DEFAULT true, "viewNsfw" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5218afa9fa7e1d3fe5001518537" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "generalPreferencesId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_8b62effac430da766381fd11eea" UNIQUE ("generalPreferencesId")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_8b62effac430da766381fd11eea" FOREIGN KEY ("generalPreferencesId") REFERENCES "general_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_8b62effac430da766381fd11eea"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_8b62effac430da766381fd11eea"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "generalPreferencesId"`
    );
    await queryRunner.query(`DROP TABLE "general_preferences"`);
  }
}
