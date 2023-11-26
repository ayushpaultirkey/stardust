CREATE DATABASE `stardust`;

CREATE TABLE `star-node` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `source` TEXT NOT NULL,
    `group` BIGINT NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB;

ALTER TABLE `star-node` ADD `crawled` BOOLEAN NOT NULL AFTER `group`;
ALTER TABLE `star-node` ADD `isroot` BOOLEAN NOT NULL AFTER `crawled`;

CREATE TABLE `star-link` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `source` TEXT NOT NULL,
    `target` TEXT NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE PROCEDURE `createlink`(IN `_source` TEXT, IN `_target` TEXT)
NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER
INSERT INTO `star-link` (`source`, `target`)
SELECT * FROM ( SELECT _source AS t_source, _target AS t_target ) AS tmp
WHERE NOT EXISTS (
    SELECT `source`, `target` FROM `star-link` WHERE source = _source AND target = _target
) LIMIT 1;

CREATE PROCEDURE `createnode`(IN `_source` TEXT)
NOT DETERMINISTIC CONTAINS SQL SQL SECURITY DEFINER
INSERT INTO `star-node` (`source`)
SELECT * FROM (SELECT _source AS t_source) AS tmp
WHERE NOT EXISTS (
    SELECT `source` FROM `star-link` WHERE source = _source
) LIMIT 1;

DROP TABLE `star-node`;
DROP TABLE `star-link`;