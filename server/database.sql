-- 创建数据库
CREATE DATABASE IF NOT EXISTS baby_growth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE baby_growth;

-- 用户信息表
CREATE TABLE IF NOT EXISTS user_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) UNIQUE NOT NULL COMMENT '用户ID',
    username VARCHAR(100) NOT NULL COMMENT '用户名',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    gender ENUM('男', '女', '保密') DEFAULT '保密' COMMENT '性别',
    birthday DATE COMMENT '生日',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    password VARCHAR(255) COMMENT '密码（加密存储）',
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_userId (userId),
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户信息表';

-- 插入测试数据
INSERT INTO
    user_info (
        userId,
        username,
        nickname,
        gender,
        birthday,
        phone,
        email
    )
VALUES (
        'user123',
        '测试用户',
        '小宝',
        '男',
        '2020-01-01',
        '13800138000',
        'test@example.com'
    ),
    (
        'user456',
        '示例用户',
        '小明',
        '女',
        '2019-05-15',
        '13900139000',
        'example@example.com'
    )
ON DUPLICATE KEY UPDATE
    updateTime = CURRENT_TIMESTAMP;
