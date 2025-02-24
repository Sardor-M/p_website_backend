import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1740373711722 implements MigrationInterface {
    name = 'InitialMigration1740373711722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP CONSTRAINT "PK_dd2add25eac93daefc93da9d387"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN "readTime"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD "readTime" character varying(70) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN "readTime"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD "readTime" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP CONSTRAINT "PK_dd2add25eac93daefc93da9d387"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id")`);
    }

}
