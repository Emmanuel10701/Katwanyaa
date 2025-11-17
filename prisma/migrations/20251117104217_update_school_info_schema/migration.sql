-- CreateTable
CREATE TABLE `student_councils` (
    `id` VARCHAR(191) NOT NULL,
    `position` ENUM('President', 'DeputyPresident', 'SchoolCaptain', 'DeputyCaptain', 'AcademicsSecretary', 'SportsSecretary', 'EntertainmentSecretary', 'CleaningSecretary', 'MealsSecretary', 'BellRinger', 'DisciplineSecretary', 'HealthSecretary', 'LibrarySecretary', 'TransportSecretary', 'EnvironmentSecretary', 'SpiritualSecretary', 'TechnologySecretary', 'Assistant') NOT NULL,
    `department` ENUM('Presidency', 'Academics', 'Sports', 'Entertainment', 'Cleaning', 'Meals', 'Discipline', 'Health', 'Library', 'Transport', 'Environment', 'Spiritual', 'Technology', 'General') NOT NULL,
    `studentId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('Active', 'Inactive', 'Graduated') NOT NULL DEFAULT 'Active',
    `image` VARCHAR(191) NULL,
    `achievements` VARCHAR(191) NULL,
    `responsibilities` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_councils_studentId_position_department_key`(`studentId`, `position`, `department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `fromForm` VARCHAR(191) NOT NULL,
    `toForm` VARCHAR(191) NOT NULL,
    `fromStream` VARCHAR(191) NOT NULL,
    `toStream` VARCHAR(191) NOT NULL,
    `promotedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `promotedBy` VARCHAR(191) NOT NULL DEFAULT 'System',

    INDEX `PromotionHistory_studentId_idx`(`studentId`),
    INDEX `PromotionHistory_promotedAt_idx`(`promotedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_councils` ADD CONSTRAINT `student_councils_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionHistory` ADD CONSTRAINT `PromotionHistory_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
