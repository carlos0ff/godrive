DROP TABLE `codigos_verificacao`;

ALTER TABLE `usuarios` DROP COLUMN `papel`,
    DROP COLUMN `emailConfirmado`;

ALTER TABLE `veiculos` RENAME COLUMN `precoDiaria` TO `valorDiaria`;

ALTER TABLE `locacoes` RENAME COLUMN `dataRetirada` TO `dataInicio`,
    RENAME COLUMN `dataDevolucao` TO `dataPrevistaDevolucao`,
    RENAME COLUMN `devolvidoEm` TO `dataDevolucao`;

ALTER TABLE `locacoes` MODIFY `dataInicio` DATETIME(3) NOT NULL,
    MODIFY `dataPrevistaDevolucao` DATETIME(3) NOT NULL;

CREATE INDEX `locacoes_veiculoId_status_idx` ON `locacoes`(`veiculoId`, `status`);

DROP INDEX `locacoes_veiculoId_idx` ON `locacoes`;
