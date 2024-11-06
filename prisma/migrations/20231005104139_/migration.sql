-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `user_name` VARCHAR(255) NULL,
    `unique_code` VARCHAR(255) NULL,
    `phone` VARCHAR(180) NULL,
    `photo` VARCHAR(500) NULL,
    `country` VARCHAR(180) NULL,
    `birth_date` DATETIME(3) NULL,
    `role` SMALLINT NOT NULL DEFAULT 2,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `is_subscribed` SMALLINT NOT NULL DEFAULT 0,
    `email_verified` SMALLINT NOT NULL DEFAULT 0,
    `phone_verified` SMALLINT NOT NULL DEFAULT 0,
    `gender` SMALLINT NOT NULL DEFAULT 1,
    `provider` VARCHAR(191) NULL,
    `provider_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_user_name_key`(`user_name`),
    UNIQUE INDEX `User_unique_code_key`(`unique_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NULL,
    `price` DECIMAL(19, 2) NOT NULL,
    `currency` VARCHAR(20) NOT NULL DEFAULT 'USD',
    `duration` SMALLINT NOT NULL DEFAULT 2,
    `type` SMALLINT NOT NULL DEFAULT 2,
    `total_words` BIGINT NOT NULL,
    `total_images` BIGINT NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 1,
    `soft_delete` BOOLEAN NOT NULL DEFAULT false,
    `image_url` VARCHAR(255) NULL,
    `total_purchase` BIGINT NOT NULL DEFAULT 0,
    `model_name` VARCHAR(191) NULL,
    `feature_description_lists` VARCHAR(191) NULL,
    `available_features` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPurchasedPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `total_words` BIGINT NOT NULL,
    `total_images` BIGINT NOT NULL,
    `used_words` BIGINT NOT NULL DEFAULT 0,
    `used_images` BIGINT NOT NULL DEFAULT 0,
    `available_features` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `payment_method` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_method` INTEGER NOT NULL,
    `price` DECIMAL(19, 2) NOT NULL DEFAULT 0,
    `packageId` INTEGER NULL,
    `userId` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TemplateCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `status` SMALLINT NOT NULL DEFAULT 1,
    `is_sub_category` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NULL,
    `prompt_input` TEXT NOT NULL,
    `prompt` TEXT NOT NULL,
    `color` VARCHAR(255) NULL,
    `icon_tag` VARCHAR(255) NULL,
    `package_type` INTEGER NOT NULL DEFAULT 1,
    `template_type` INTEGER NULL DEFAULT 1,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TemplateField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field_name` VARCHAR(255) NOT NULL,
    `input_field_name` VARCHAR(255) NOT NULL,
    `type` INTEGER NOT NULL,
    `description` LONGTEXT NULL,
    `template_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MyDocuments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `prompt` LONGTEXT NOT NULL,
    `result` LONGTEXT NULL,
    `template_id` INTEGER NULL,
    `total_used_words` BIGINT NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MyImages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prompt` LONGTEXT NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `image_name` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `templateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MyUploads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fieldname` VARCHAR(255) NOT NULL,
    `originalname` VARCHAR(255) NOT NULL,
    `mimetype` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminSettings_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `refreshToken` LONGTEXT NOT NULL,
    `family` VARCHAR(191) NOT NULL,
    `browserInfo` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserTokens_family_key`(`family`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserVerificationCodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `type` SMALLINT NOT NULL DEFAULT 1,
    `expired_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserVerificationCodes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavouriteTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `template_id` INTEGER NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` SMALLINT NOT NULL DEFAULT 0,
    `question` TEXT NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GeneratedCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `prompt` LONGTEXT NOT NULL,
    `result` LONGTEXT NULL,
    `total_used_words` BIGINT NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TextTranslateDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `text` LONGTEXT NOT NULL,
    `language` VARCHAR(255) NOT NULL,
    `prompt` LONGTEXT NOT NULL,
    `result` LONGTEXT NULL,
    `total_used_words` BIGINT NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrustedOrganization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `image_url` TEXT NOT NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPurchasedPackage` ADD CONSTRAINT `UserPurchasedPackage_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPurchasedPackage` ADD CONSTRAINT `UserPurchasedPackage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentTransaction` ADD CONSTRAINT `PaymentTransaction_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentTransaction` ADD CONSTRAINT `PaymentTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `TemplateCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TemplateField` ADD CONSTRAINT `TemplateField_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MyDocuments` ADD CONSTRAINT `MyDocuments_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `Template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MyDocuments` ADD CONSTRAINT `MyDocuments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MyImages` ADD CONSTRAINT `MyImages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MyImages` ADD CONSTRAINT `MyImages_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MyUploads` ADD CONSTRAINT `MyUploads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTokens` ADD CONSTRAINT `UserTokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserVerificationCodes` ADD CONSTRAINT `UserVerificationCodes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteTemplate` ADD CONSTRAINT `FavouriteTemplate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteTemplate` ADD CONSTRAINT `FavouriteTemplate_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneratedCode` ADD CONSTRAINT `GeneratedCode_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TextTranslateDocument` ADD CONSTRAINT `TextTranslateDocument_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
