import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProfile1613150231155 implements MigrationInterface {
    name = 'CreateProfile1613150231155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "profile"."about" IS NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "about" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "profile"."displayName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "displayName" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "displayName" SET DEFAULT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "profile"."displayName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "about" SET DEFAULT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "profile"."about" IS NULL`);
    }

}
