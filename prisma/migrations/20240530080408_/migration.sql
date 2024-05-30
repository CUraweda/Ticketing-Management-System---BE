-- AlterTable
ALTER TABLE `events` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;
