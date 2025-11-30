-- CreateTable
CREATE TABLE `Slide` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` TEXT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `type` ENUM('NEWS', 'PRODUCT', 'PROMOTION', 'ANNOUNCEMENT') NOT NULL DEFAULT 'NEWS',
    `linkUrl` VARCHAR(500) NULL,
    `linkText` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `backgroundColor` VARCHAR(20) NULL,
    `textColor` VARCHAR(20) NULL,
    `buttonColor` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Slide_isActive_order_idx`(`isActive`, `order`),
    INDEX `Slide_startDate_endDate_idx`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
