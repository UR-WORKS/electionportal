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
