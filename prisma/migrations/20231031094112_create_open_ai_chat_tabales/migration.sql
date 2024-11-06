-- CreateTable
CREATE TABLE `OpenAiChatCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `human_name` VARCHAR(255) NOT NULL,
    `color` VARCHAR(255) NOT NULL,
    `prompt_prefix` MEDIUMTEXT NULL,
    `help_with` MEDIUMTEXT NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `image_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOpenAiChat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `total_words` BIGINT NOT NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,
    `openAiChatCategoryId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOpenAiChatMessages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `response` LONGTEXT NULL,
    `total_words` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `userOpenAiChatId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserOpenAiChat` ADD CONSTRAINT `UserOpenAiChat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOpenAiChat` ADD CONSTRAINT `UserOpenAiChat_openAiChatCategoryId_fkey` FOREIGN KEY (`openAiChatCategoryId`) REFERENCES `OpenAiChatCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOpenAiChatMessages` ADD CONSTRAINT `UserOpenAiChatMessages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOpenAiChatMessages` ADD CONSTRAINT `UserOpenAiChatMessages_userOpenAiChatId_fkey` FOREIGN KEY (`userOpenAiChatId`) REFERENCES `UserOpenAiChat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
