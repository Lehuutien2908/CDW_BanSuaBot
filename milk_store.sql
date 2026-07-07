/*
 Navicat Premium Dump SQL

 Source Server         : abc
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : localhost:3306
 Source Schema         : milk_store

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 04/07/2026 10:57:05
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for brands
-- ----------------------------
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `country` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKpnhnc9urm6fro7oseu9vka70q`(`slug` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of brands
-- ----------------------------
INSERT INTO `brands` VALUES (1, 'Nhật Bản', 'Meiji', 'meiji');
INSERT INTO `brands` VALUES (2, 'Việt Nam', 'Colosbaby', 'colosbaby');
INSERT INTO `brands` VALUES (3, 'Việt Nam', 'Nutifood', 'nutifood');
INSERT INTO `brands` VALUES (4, 'Việt Nam', 'Meta Care', 'meta-care');
INSERT INTO `brands` VALUES (5, 'Hoa Kỳ', 'Enfamil - Enfagrow', 'enfamil-enfagrow');
INSERT INTO `brands` VALUES (6, 'Pháp', 'Aptamil', 'aptamil');
INSERT INTO `brands` VALUES (7, 'Hoa Kỳ', 'Abbott', 'abbott');

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NULL DEFAULT NULL,
  `variant_id` bigint NULL DEFAULT NULL,
  `user_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK5yyw1o0dor9gmxfra1dqvn4qa`(`variant_id` ASC) USING BTREE,
  INDEX `FK709eickf3kc0dujx3ub9i7btf`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FK5yyw1o0dor9gmxfra1dqvn4qa` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK709eickf3kc0dujx3ub9i7btf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKoul14ho7bctbefv8jywp5v3i2`(`slug` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, 'Sữa Bột Công Thức', 'sua-bot-cong-thuc');
INSERT INTO `categories` VALUES (2, 'Sữa cho bé 0-6 tháng', 'sua-cho-be-0-6th');
INSERT INTO `categories` VALUES (3, 'Sữa cho mẹ bầu', 'sua-cho-me-bau');
INSERT INTO `categories` VALUES (4, 'Sữa cho người lớn', 'sua-cho-nguoi-lon');
INSERT INTO `categories` VALUES (5, 'Sữa cho bé 6-12 tháng', 'sua-cho-be-6-12th');
INSERT INTO `categories` VALUES (6, 'Sữa cho bé 1-3 tuổi', 'sua-cho-be-1-3t');
INSERT INTO `categories` VALUES (7, 'Sữa cho bé trên 3 tuổi', 'sua-cho-be-tren-3t');

-- ----------------------------
-- Table structure for order_details
-- ----------------------------
DROP TABLE IF EXISTS `order_details`;
CREATE TABLE `order_details`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NULL DEFAULT NULL,
  `unit_price` double NULL DEFAULT NULL,
  `order_id` bigint NULL DEFAULT NULL,
  `variant_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKjyu2qbqt8gnvno9oe9j2s2ldk`(`order_id` ASC) USING BTREE,
  INDEX `FK63mqrfva3vf2gx2sublm4m51w`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `FK63mqrfva3vf2gx2sublm4m51w` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKjyu2qbqt8gnvno9oe9j2s2ldk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_details
-- ----------------------------

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_date` datetime(6) NULL DEFAULT NULL,
  `receiver_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `receiver_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `shipping_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `total_price` double NULL DEFAULT NULL,
  `user_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK32ql8ubntj5uh44ph9659tiih`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NULL DEFAULT NULL,
  `payment_date` datetime(6) NULL DEFAULT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `payment_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `order_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK81gagumt0r8y3rmudcgpbk42l`(`order_id` ASC) USING BTREE,
  CONSTRAINT `FK81gagumt0r8y3rmudcgpbk42l` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------

-- ----------------------------
-- Table structure for product_variants
-- ----------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` double NULL DEFAULT NULL,
  `stock` int NULL DEFAULT NULL,
  `weight` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `product_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKosqitn4s405cynmhb87lkvuau`(`product_id` ASC) USING BTREE,
  CONSTRAINT `FKosqitn4s405cynmhb87lkvuau` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variants
-- ----------------------------
INSERT INTO `product_variants` VALUES (1, 385000, 50, '850', 1);
INSERT INTO `product_variants` VALUES (2, 385000, 30, '850', 2);
INSERT INTO `product_variants` VALUES (3, 520000, 82, '800', 3);
INSERT INTO `product_variants` VALUES (4, 495000, 50, '900', 4);
INSERT INTO `product_variants` VALUES (5, 250000, 25, '900', 5);
INSERT INTO `product_variants` VALUES (6, 584000, 50, '800', 6);
INSERT INTO `product_variants` VALUES (7, 682000, 50, '800', 7);
INSERT INTO `product_variants` VALUES (8, 570000, 50, '800', 8);
INSERT INTO `product_variants` VALUES (9, 495000, 50, '900', 9);
INSERT INTO `product_variants` VALUES (10, 220000, 50, '350', 10);
INSERT INTO `product_variants` VALUES (11, 645000, 50, '800', 11);
INSERT INTO `product_variants` VALUES (12, 620000, 50, '800', 12);
INSERT INTO `product_variants` VALUES (13, 620000, 50, '800', 13);
INSERT INTO `product_variants` VALUES (14, 275000, 50, '400', 14);
INSERT INTO `product_variants` VALUES (15, 565000, 50, '800', 14);
INSERT INTO `product_variants` VALUES (16, 535000, 50, '800', 15);
INSERT INTO `product_variants` VALUES (17, 650000, 50, '800', 16);
INSERT INTO `product_variants` VALUES (18, 600000, 50, '800', 17);
INSERT INTO `product_variants` VALUES (19, 345000, 50, '850', 18);
INSERT INTO `product_variants` VALUES (20, 345000, 50, '850', 19);
INSERT INTO `product_variants` VALUES (21, 340000, 50, '800', 20);
INSERT INTO `product_variants` VALUES (22, 510000, 50, '830', 21);
INSERT INTO `product_variants` VALUES (23, 510000, 50, '830', 22);
INSERT INTO `product_variants` VALUES (24, 540000, 50, '830', 23);
INSERT INTO `product_variants` VALUES (25, 575000, 50, '830', 24);
INSERT INTO `product_variants` VALUES (26, 590000, 50, '830', 25);
INSERT INTO `product_variants` VALUES (27, 895000, 50, '900', 26);
INSERT INTO `product_variants` VALUES (28, 865000, 50, '900', 27);
INSERT INTO `product_variants` VALUES (29, 850000, 50, '900', 28);
INSERT INTO `product_variants` VALUES (30, 810000, 50, '900', 29);
INSERT INTO `product_variants` VALUES (31, 750000, 50, '800', 30);
INSERT INTO `product_variants` VALUES (32, 865000, 50, '800', 31);
INSERT INTO `product_variants` VALUES (33, 865000, 50, '800', 32);
INSERT INTO `product_variants` VALUES (34, 375000, 50, '850', 33);
INSERT INTO `product_variants` VALUES (35, 320000, 50, '900', 34);
INSERT INTO `product_variants` VALUES (36, 415000, 50, '380', 35);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `brand_id` bigint NULL DEFAULT NULL,
  `category_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKostq1ec3toafnjok09y9l7dox`(`slug` ASC) USING BTREE,
  INDEX `FKa3a4mpsfdf4d2y6r8ra3sc8mv`(`brand_id` ASC) USING BTREE,
  INDEX `FKog2rp4qthbtt2lfyhfo32lsw9`(`category_id` ASC) USING BTREE,
  CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 'Sữa Grow Plus +1 đỏ Nutifood', 'grow-plus+1-red', 3, 6);
INSERT INTO `products` VALUES (2, 'Sữa Grow Plus Đỏ 2+', 'grow-plus-2+-red', 3, 7);
INSERT INTO `products` VALUES (3, 'Sữa Grow Plus Vàng Sữa Non 0+', 'grow-plus-vang-0+', 3, 5);
INSERT INTO `products` VALUES (4, 'Sữa Enplus Gold', 'enplus-gold-900g', 3, 4);
INSERT INTO `products` VALUES (5, 'Sữa Grow Plus xanh 1+', 'grow-plus-xanh-1+', 3, 6);
INSERT INTO `products` VALUES (6, 'Sữa Meiji Premium 1-3', 'meiji-premium-1-3', 1, 6);
INSERT INTO `products` VALUES (7, 'Sữa Meiji Premium 0-1', 'meiji-premiun-0-6th', 1, 2);
INSERT INTO `products` VALUES (8, 'Sữa Meiji 0-1', 'meiji-0-6th', 1, 2);
INSERT INTO `products` VALUES (9, 'Sữa Meiji Kids Formula', 'meiji-kids-formula', 1, 7);
INSERT INTO `products` VALUES (10, 'Sữa Meiji Mama Milk Nhật Bản', 'meiji-mama-milk', 1, 3);
INSERT INTO `products` VALUES (11, 'Sữa ColosBaby Lactoferrin 0+', 'colosbaby-lactoferrin-0', 2, 5);
INSERT INTO `products` VALUES (12, 'Sữa ColosBaby Lactoferrin 1+', 'colosbaby-lactoferrin-1', 2, 6);
INSERT INTO `products` VALUES (13, 'Sữa ColosBaby Lactoferrin 2+', 'colosbaby-lactoferrin-2', 2, 7);
INSERT INTO `products` VALUES (14, 'Sữa ColosBaby D3K2 0+', 'colosbaby-d3k2-0+', 2, 5);
INSERT INTO `products` VALUES (15, 'Sữa Colosbaby D3K2 số 1+', 'colosbaby-d3k2-1+', 2, 6);
INSERT INTO `products` VALUES (16, 'Sữa Metacare Opti C-Section 0+', 'meta-care-opti-c-section-0+', 4, 2);
INSERT INTO `products` VALUES (17, 'Sữa Metacare Opti C-Section 1+', 'meta-care-opti-c-section-1+', 4, 6);
INSERT INTO `products` VALUES (18, 'Sữa MetaCare Opti 1+', 'meta-care-opti-1+', 4, 6);
INSERT INTO `products` VALUES (19, 'Sữa Meta Care Opti 2+', 'meta-care-opti-2+', 4, 7);
INSERT INTO `products` VALUES (20, 'Sữa Meta Care số 0', 'meta-care-0', 4, 5);
INSERT INTO `products` VALUES (21, 'Sữa Enfamama A+ DHA hương vani cho mẹ bầu & cho con bú', 'enfamama-dha-vani', 5, 3);
INSERT INTO `products` VALUES (22, 'Sữa Enfamama Sôcôla 830g cho mẹ bầu, cho con bú', 'enfamama-dha-socola', 5, 3);
INSERT INTO `products` VALUES (23, 'Sữa Enfagrow A+ 3 MFGM Pro & DHA', 'enfagrow-a-3-mfgm-pro-dha', 5, 6);
INSERT INTO `products` VALUES (24, 'Sữa Enfamil A+ 2 830g MFGM Pro + DHA', 'enfagrow-a-2-mfgm-pro-dha', 5, 5);
INSERT INTO `products` VALUES (25, 'Sữa Enfamil A+ 1 DHA+ MFGM Pro', 'enfagrow-a-1-mfgm-pro-dha', 5, 2);
INSERT INTO `products` VALUES (26, 'Sữa Aptamil Úc số 1 Profutura', 'aptamil-uc-1-profutura', 6, 2);
INSERT INTO `products` VALUES (27, 'Sữa Aptamil Úc số 2 Profutura', 'aptamil-uc-2-profutura', 6, 5);
INSERT INTO `products` VALUES (28, 'Sữa Aptamil Úc số 3 Profutura', 'aptamil-uc-3-profutura', 6, 6);
INSERT INTO `products` VALUES (29, 'Sữa Aptamil Úc số 4 Profutura', 'aptamil-uc-4-profutura', 6, 7);
INSERT INTO `products` VALUES (30, 'Sữa Aptamil Advanced số 1 800g nội địa Anh', 'aptamil-advanced-1-anh', 6, 2);
INSERT INTO `products` VALUES (31, 'Sữa Ensure Gold StrengthPro Mới', 'ensure-gold-strength-pro-moi', 7, 4);
INSERT INTO `products` VALUES (32, 'Sữa Ensure Gold Ít Ngọt Vani 800g Abbott Hoa Kỳ', 'ensure-gold-it-ngot-vani', 7, 4);
INSERT INTO `products` VALUES (33, 'Sữa Abbott Grow 2+', 'abbott-grow-2', 7, 7);
INSERT INTO `products` VALUES (34, 'Sữa Abbott Grow 3', 'abbott-grow-3', 7, 6);
INSERT INTO `products` VALUES (35, 'Sữa Ensure Gold StrengthPro 380g hương Vani của Abbott', 'ensure-gold-strength-pro-vani', 7, 4);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKofx66keruapi6vyqpv6f2or37`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'ROLE_ADMIN');
INSERT INTO `roles` VALUES (3, 'ROLE_EMPLOYEE');
INSERT INTO `roles` VALUES (2, 'ROLE_USER');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `enabled` bit(1) NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `provider` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `provider_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  `verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK6dotkott2kjsp8vw4d0m25fb7`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, NULL, NULL, '22130290@st.hcmuaf.edu.vn', b'1', 'Lê Hữu Tiền', 'abc', '', '', NULL, NULL, NULL);
INSERT INTO `users` VALUES (11, NULL, NULL, '22129232@st.hcmuaf.edu.vn', b'1', 'Trương Nhật Phương', 'tnp0602', NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for users_roles
-- ----------------------------
DROP TABLE IF EXISTS `users_roles`;
CREATE TABLE `users_roles`  (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
  INDEX `FKj6m8fwv7oqv74fcehir1a9ffy`(`role_id` ASC) USING BTREE,
  CONSTRAINT `FK2o0jvgh89lemvvo17cbqvdxaa` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKj6m8fwv7oqv74fcehir1a9ffy` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_roles
-- ----------------------------
INSERT INTO `users_roles` VALUES (1, 1);
INSERT INTO `users_roles` VALUES (11, 2);

-- ----------------------------
-- Table structure for variant_images
-- ----------------------------
DROP TABLE IF EXISTS `variant_images`;
CREATE TABLE `variant_images`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `is_primary` bit(1) NULL DEFAULT b'0',
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_variant_images_variant_id`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `FK_variant_images_variant_id` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 64 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_520_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of variant_images
-- ----------------------------
INSERT INTO `variant_images` VALUES (1, 'https://suabottot.com/wp-content/uploads/2024/01/sua-growplus-1.jpg', b'1', 1);
INSERT INTO `variant_images` VALUES (2, 'https://suabottot.com/wp-content/uploads/2024/01/sua-growplus-2.jpg', b'1', 2);
INSERT INTO `variant_images` VALUES (3, 'https://suabottot.com/wp-content/uploads/2022/03/sua-grow-plus-vang-0-768x768.jpg', b'1', 3);
INSERT INTO `variant_images` VALUES (4, 'https://suabottot.com/wp-content/uploads/2022/01/sua-enplus-gold-768x768.jpg', b'1', 4);
INSERT INTO `variant_images` VALUES (5, 'https://suabottot.com/wp-content/uploads/2024/11/sua-nutifood-growplus-xanh-1.0-768x768.jpg', b'1', 5);
INSERT INTO `variant_images` VALUES (6, 'https://suabottot.com/wp-content/uploads/2026/03/sua-meiji-premium-1-3-768x768.jpg', b'1', 6);
INSERT INTO `variant_images` VALUES (7, 'https://suabottot.com/wp-content/uploads/2025/06/sua-meiji-premium-0-1-768x767.jpg', b'1', 7);
INSERT INTO `variant_images` VALUES (8, 'https://suabottot.com/wp-content/uploads/2023/06/sua-meiji-0-1-768x768.jpg', b'1', 8);
INSERT INTO `variant_images` VALUES (9, 'https://suabottot.com/wp-content/uploads/2023/06/sua-meiji-3-10-768x768.jpg', b'1', 9);
INSERT INTO `variant_images` VALUES (10, 'https://suabottot.com/wp-content/uploads/2019/07/sua-meiji-mama-768x768.jpg', b'1', 10);
INSERT INTO `variant_images` VALUES (11, 'https://suabottot.com/wp-content/uploads/2026/01/sua-colosbaby-lactoferrin-0-vitadairy.jpg', b'1', 11);
INSERT INTO `variant_images` VALUES (12, 'https://suabottot.com/wp-content/uploads/2026/01/sua-colosbaby-lactoferrin-1-vitadairy-768x768.jpg', b'1', 12);
INSERT INTO `variant_images` VALUES (13, 'https://suabottot.com/wp-content/uploads/2026/03/sua-colosbaby-lactoferrin-2-vitadairy-768x768.jpg', b'1', 13);
INSERT INTO `variant_images` VALUES (14, 'https://suabottot.com/wp-content/uploads/2023/12/sua-colosbaby-d3k2-400g-z-768x768.jpg', b'1', 14);
INSERT INTO `variant_images` VALUES (15, 'https://suabottot.com/wp-content/uploads/2023/12/sua-colosbaby-d3k2-400g-z-768x768.jpg', b'1', 15);
INSERT INTO `variant_images` VALUES (16, 'https://suabottot.com/wp-content/uploads/2023/12/sua-colosbaby-d3k2-1-768x768.jpg', b'1', 16);
INSERT INTO `variant_images` VALUES (17, 'https://suabottot.com/wp-content/uploads/2026/05/sua-metacare-opti-section-so-2.jpg', b'1', 17);
INSERT INTO `variant_images` VALUES (18, 'https://suabottot.com/wp-content/uploads/2026/05/sua-metacare-opti-section-so-1.jpg', b'1', 18);
INSERT INTO `variant_images` VALUES (19, 'https://suabottot.com/wp-content/uploads/2022/08/sua-metacare-opti-1.jpg', b'1', 19);
INSERT INTO `variant_images` VALUES (20, 'https://suabottot.com/wp-content/uploads/2022/08/sua-metacare-opti-2.jpg', b'1', 20);
INSERT INTO `variant_images` VALUES (21, 'https://suabottot.com/wp-content/uploads/2023/01/sua-metacare-0.jpg', b'1', 21);
INSERT INTO `variant_images` VALUES (22, 'https://suabottot.com/wp-content/uploads/2022/01/sua-enfamama-vani.jpg', b'1', 22);
INSERT INTO `variant_images` VALUES (23, 'https://suabottot.com/wp-content/uploads/2022/01/sua-enfamama-socola.jpg', b'1', 23);
INSERT INTO `variant_images` VALUES (24, 'https://suabottot.com/wp-content/uploads/2023/01/sua-engrow-3.jpg', b'1', 24);
INSERT INTO `variant_images` VALUES (25, 'https://suabottot.com/wp-content/uploads/2023/01/sua-enfamil-2-4.jpg', b'1', 25);
INSERT INTO `variant_images` VALUES (26, 'https://suabottot.com/wp-content/uploads/2023/01/sua-enfamil-1.jpg', b'1', 26);
INSERT INTO `variant_images` VALUES (27, 'https://suabottot.com/wp-content/uploads/2022/02/sua-aptamil-uc-1-768x768.jpg', b'1', 27);
INSERT INTO `variant_images` VALUES (28, 'https://suabottot.com/wp-content/uploads/2022/02/sua-aptamil-uc-2-768x768.jpg', b'1', 28);
INSERT INTO `variant_images` VALUES (29, 'https://suabottot.com/wp-content/uploads/2022/02/sua-aptamil-uc-3.jpg', b'1', 29);
INSERT INTO `variant_images` VALUES (30, 'https://suabottot.com/wp-content/uploads/2022/02/sua-aptamil-uc-4-768x768.jpg', b'1', 30);
INSERT INTO `variant_images` VALUES (31, 'https://suabottot.com/wp-content/uploads/2021/09/sua-aptamil-advanced-1.jpg', b'1', 31);
INSERT INTO `variant_images` VALUES (32, 'https://suabottot.com/wp-content/uploads/2023/01/sua-ensure-gold.jpg', b'1', 32);
INSERT INTO `variant_images` VALUES (33, 'https://suabottot.com/wp-content/uploads/2023/01/sua-ensure-gold-it-ngot.jpg', b'1', 33);
INSERT INTO `variant_images` VALUES (34, 'https://suabottot.com/wp-content/uploads/2022/01/sua-abbott-grow-2.jpg', b'1', 34);
INSERT INTO `variant_images` VALUES (35, 'https://suabottot.com/wp-content/uploads/2019/06/sua-abbott-grow-3-1.jpg', b'1', 35);
INSERT INTO `variant_images` VALUES (36, 'https://suabottot.com/wp-content/uploads/2022/01/sua-ensure-gold-400g.jpg', b'1', 36);

SET FOREIGN_KEY_CHECKS = 1;
