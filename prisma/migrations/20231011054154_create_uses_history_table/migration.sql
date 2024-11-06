-- CreateTable
CREATE TABLE `UsesHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uses_type` SMALLINT NOT NULL,
    `title` TEXT NOT NULL,
    `uses_word` BIGINT NULL DEFAULT 0,
    `uses_image` BIGINT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsesHistory` ADD CONSTRAINT `UsesHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
