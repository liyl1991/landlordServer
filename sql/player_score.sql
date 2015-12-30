/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50710
Source Host           : 127.0.0.1:3306
Source Database       : landlord

Target Server Type    : MYSQL
Target Server Version : 50710
File Encoding         : 65001

Date: 2015-12-30 13:52:38
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for player_score
-- ----------------------------
DROP TABLE IF EXISTS `player_score`;
CREATE TABLE `player_score` (
  `uid` varchar(64) NOT NULL,
  `player_name` varchar(64) NOT NULL,
  `score` int(11) NOT NULL,
  `play_times` int(11) DEFAULT '0' COMMENT '玩的次数',
  `run_away_times` int(11) DEFAULT '0' COMMENT '逃跑次数',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
