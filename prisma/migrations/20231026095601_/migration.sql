-- CreateTable
CREATE TABLE `GeneratedTranscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result` LONGTEXT NULL,
    `total_used_words` BIGINT NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GeneratedTranscription` ADD CONSTRAINT `GeneratedTranscription_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
