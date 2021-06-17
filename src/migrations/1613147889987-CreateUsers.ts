import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1613147889987 implements MigrationInterface {
  name = 'CreateUsers1613147889987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying, "username" character varying(20) NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
