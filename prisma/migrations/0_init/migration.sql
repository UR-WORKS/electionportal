-- CreateTable
CREATE TABLE `candidate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `abbrev` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `candidate_name_key`(`name`),
    UNIQUE INDEX `candidate_abbrev_key`(`abbrev`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constituency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Constituency_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `panchayath` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `constituencyId` INTEGER NOT NULL,

    INDEX `Panchayat_constituencyId_fkey`(`constituencyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `panchayathId` INTEGER NOT NULL,
    `totalVoters` INTEGER NOT NULL DEFAULT 0,

    INDEX `Booth_panchayatId_fkey`(`panchayathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'MANDAL_ADMIN', 'PANCHAYATH_ADMIN', 'BOOTH_ADMIN') NOT NULL,
    `candidateId` INTEGER NULL,
    `constituencyId` INTEGER NULL,
    `panchayathId` INTEGER NULL,
    `boothId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_boothId_fkey`(`boothId`),
    INDEX `User_constituencyId_fkey`(`constituencyId`),
    INDEX `User_panchayatId_fkey`(`panchayathId`),
    INDEX `User_partyId_fkey`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serialNumber` INTEGER NOT NULL,
    `boothId` INTEGER NOT NULL,

    INDEX `Voter_boothId_fkey`(`boothId`),
    UNIQUE INDEX `Voter_serialNumber_boothId_key`(`serialNumber`, `boothId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votermark` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voterId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `markedBy` INTEGER NOT NULL,
    `hasVoted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VoterMark_markedBy_fkey`(`markedBy`),
    INDEX `VoterMark_partyId_fkey`(`candidateId`),
    UNIQUE INDEX `VoterMark_voterId_candidateId_key`(`voterId`, `candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `panchayath` ADD CONSTRAINT `panchayath_constituencyId_fkey` FOREIGN KEY (`constituencyId`) REFERENCES `constituency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booth` ADD CONSTRAINT `booth_panchayathId_fkey` FOREIGN KEY (`panchayathId`) REFERENCES `panchayath`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_constituencyId_fkey` FOREIGN KEY (`constituencyId`) REFERENCES `constituency`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_panchayathId_fkey` FOREIGN KEY (`panchayathId`) REFERENCES `panchayath`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_boothId_fkey` FOREIGN KEY (`boothId`) REFERENCES `booth`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `voter` ADD CONSTRAINT `voter_boothId_fkey` FOREIGN KEY (`boothId`) REFERENCES `booth`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votermark` ADD CONSTRAINT `votermark_voterId_fkey` FOREIGN KEY (`voterId`) REFERENCES `voter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votermark` ADD CONSTRAINT `votermark_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votermark` ADD CONSTRAINT `votermark_markedBy_fkey` FOREIGN KEY (`markedBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

