CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `senhaHash` VARCHAR(100) NOT NULL,
    `papel` ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `emailConfirmado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `codigos_verificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `codigo` CHAR(6) NOT NULL,
    `finalidade` ENUM('CONFIRMAR_EMAIL', 'RECUPERAR_SENHA') NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `usadoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `codigos_verificacao_usuarioId_finalidade_idx`(`usuarioId`, `finalidade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `veiculos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca` VARCHAR(60) NOT NULL,
    `modelo` VARCHAR(60) NOT NULL,
    `ano` INTEGER NOT NULL,
    `categoria` VARCHAR(30) NOT NULL,
    `placa` VARCHAR(8) NOT NULL,
    `cor` VARCHAR(30) NULL,
    `combustivel` VARCHAR(20) NULL,
    `lugares` INTEGER NOT NULL DEFAULT 5,
    `quilometragem` INTEGER NOT NULL DEFAULT 0,
    `precoDiaria` DECIMAL(10, 2) NOT NULL,
    `disponivel` BOOLEAN NOT NULL DEFAULT true,
    `imagemUrl` LONGTEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `veiculos_placa_key`(`placa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `locacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `veiculoId` INTEGER NOT NULL,
    `dataRetirada` DATE NOT NULL,
    `dataDevolucao` DATE NOT NULL,
    `devolvidoEm` DATETIME(3) NULL,
    `valorDiaria` DECIMAL(10, 2) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ATIVA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'ATIVA',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `locacoes_usuarioId_idx`(`usuarioId`),
    INDEX `locacoes_veiculoId_idx`(`veiculoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `codigos_verificacao` ADD CONSTRAINT `codigos_verificacao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `locacoes` ADD CONSTRAINT `locacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `locacoes` ADD CONSTRAINT `locacoes_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `veiculos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
