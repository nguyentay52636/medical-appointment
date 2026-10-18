-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2025 at 05:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12



SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dat_lich_kham_benh`
--

DROP DATABASE IF EXISTS dat_lich_kham_benh;
CREATE DATABASE IF NOT EXISTS dat_lich_kham_benh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dat_lich_kham_benh;

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `id` int(11) NOT NULL,
  `appointment_code` varchar(50) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `bookable_slot_id` int(11) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','missed') DEFAULT 'pending',
  `reason_for_visit` text DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT 0,
  `payment_method` enum('offline','online') DEFAULT 'offline',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `vnp_txn_ref` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`id`, `appointment_code`, `patient_id`, `bookable_slot_id`, `status`, `reason_for_visit`, `note`, `price`, `payment_method`, `payment_status`, `vnp_txn_ref`, `created_at`, `updated_at`) VALUES
(1, 'APT001', 1, 1, 'confirmed', 'Khám tim mạch', NULL, 250000, 'offline', 'pending', NULL, '2025-11-26 15:55:40', '2025-11-26 15:55:40'),
(2, 'APT002', 1, 3, 'pending', 'Viêm họng', NULL, 200000, 'online', 'paid', NULL, '2025-11-26 15:55:40', '2025-11-26 15:55:40');

-- --------------------------------------------------------

--
-- Table structure for table `bookable_slot`
--

CREATE TABLE `bookable_slot` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('available','booked','off') DEFAULT 'available',
  `availability_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookable_slot`
--

INSERT INTO `bookable_slot` (`id`, `doctor_id`, `slot_date`, `start_time`, `end_time`, `status`, `availability_id`) VALUES
(1, 1, '2025-11-10', '08:00:00', '08:15:00', 'booked', 1),
(2, 1, '2025-11-10', '08:15:00', '08:30:00', 'available', 1),
(3, 2, '2025-11-11', '09:00:00', '09:15:00', 'booked', 3),
(4, 3, '2025-11-14', '14:00:00', '14:15:00', 'available', 4),
(5, 4, '2025-11-15', '08:30:00', '08:45:00', 'available', 5);

-- --------------------------------------------------------

--
-- Table structure for table `doctor`
--

CREATE TABLE `doctor` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `specialty_id` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `price_per_appointment` int(11) DEFAULT 0,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor`
--

INSERT INTO `doctor` (`id`, `full_name`, `email`, `password`, `phone_number`, `address`, `specialty_id`, `image_url`, `experience_years`, `price_per_appointment`, `bio`, `created_at`, `updated_at`, `lat`, `lng`) VALUES
(1, 'BS. Nguyễn Văn A', 'bs.a@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0901111222', '396D An Dương Vương,Phường 4,Quận 5,Thành Phố Hồ Chí Minh', 2, 'https://i.pravatar.cc/350?img=1', 12, 250000, 'Chuyên khoa tim mạch', '2025-11-26 15:55:39', '2025-11-26 16:05:56', 10.75955, 106.67806),
(2, 'BS. Trần Thị B', 'bs.b@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0902333444', '69 Nguyễn Khắc Nhu,Phường Cô Giang,Quận 1,Thành Phố Hồ Chí Minh', 1, 'https://i.pravatar.cc/350?img=2', 9, 200000, 'Khám nội tổng quát', '2025-11-26 15:55:39', '2025-11-26 16:05:07', 10.76378, 106.69293),
(3, 'BS. Lê Văn C', 'bs.c@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0904555666', '502 Phan Xích Long,Phường 4,Quận Phú Nhuận,Thành Phố Hồ Chí Minh', 3, 'https://i.pravatar.cc/350?img=4', 15, 300000, 'Tai Mũi Họng', '2025-11-26 15:55:39', '2025-11-26 16:04:07', 10.80301, 106.68216),
(4, 'BS. Phạm Thị D', 'bs.d@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0906777888', '26 Nguyễn Thái Bình,Phường 4,Quận Tân Bình,Thành Phố Hồ Chí Minh', 4, 'https://i.pravatar.cc/350?img=9', 6, 280000, 'Da liễu & thẩm mỹ', '2025-11-26 15:55:39', '2025-11-26 16:03:22', 10.79952, 106.65623),
(5, 'BS. Võ Thanh E', 'bs.e@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0908999000', '268 Tô Hiến Thành,Phường 15,Quận 10,Thành phố Hồ Chí Minh', 5, 'https://i.pravatar.cc/350?img=5', 10, 220000, 'Khám nhi', '2025-11-26 15:55:39', '2025-11-26 16:02:27', 10.77839, 106.66543);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_availability`
--

CREATE TABLE `doctor_availability` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_duration_minutes` int(11) NOT NULL DEFAULT 15,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_availability`
--

INSERT INTO `doctor_availability` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`, `slot_duration_minutes`, `active`) VALUES
(1, 1, 'Monday', '08:00:00', '11:00:00', 15, 1),
(2, 1, 'Wednesday', '13:00:00', '17:00:00', 15, 1),
(3, 2, 'Tuesday', '09:00:00', '12:00:00', 15, 1),
(4, 3, 'Friday', '14:00:00', '18:00:00', 15, 1),
(5, 4, 'Saturday', '08:30:00', '11:30:00', 15, 1),
(6, 5, 'Thursday', '08:00:00', '11:00:00', 15, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `doctor_id`, `patient_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 1, 'Lịch hẹn mới', 'Bệnh nhân Nguyễn Văn A đã đặt lịch khám vào 10/11', 0, '2025-11-26 15:55:40'),
(2, 1, 2, 'Lịch hủy', 'Bệnh nhân Trần Thị B đã hủy lịch khám vào 12/11', 0, '2025-11-26 15:55:40'),
(3, 1, 3, 'Nhắc nhở lịch khám', 'Bệnh nhân Lê Văn C có lịch khám vào 15/11', 0, '2025-11-26 15:55:40'),
(4, 1, NULL, 'Thông báo chung', 'Có thông báo mới cho bác sĩ 1', 0, '2025-11-26 15:55:40'),
(5, 2, 4, 'Lịch hẹn mới', 'Bệnh nhân Phạm Thị D đã đặt lịch khám vào 16/11', 0, '2025-11-26 15:55:40'),
(6, 2, NULL, 'Thông báo chung', 'Có thông báo mới cho bác sĩ 2', 0, '2025-11-26 15:55:40'),
(7, 3, 5, 'Lịch hủy', 'Bệnh nhân Nguyễn Thị E đã hủy lịch khám', 0, '2025-11-26 15:55:40'),
(8, 3, NULL, 'Thông báo quan trọng', 'Có thông báo quan trọng cho bác sĩ 3', 0, '2025-11-26 15:55:40');

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE `patient` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`id`, `full_name`, `email`, `password`, `phone_number`, `address`, `created_at`) VALUES
(1, 'Nguyễn Văn Long', 'long@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0912345678', 'Hà Nội', '2025-11-26 15:55:39'),
(2, 'Trần Thị Hương', 'huong@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0923456789', 'Hồ Chí Minh', '2025-11-26 15:55:39'),
(3, 'Lê Quang Minh', 'minh@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0934567890', 'Đà Nẵng', '2025-11-26 15:55:39'),
(4, 'Phạm Ngọc Lan', 'lan@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0965678901', 'Cần Thơ', '2025-11-26 15:55:39'),
(5, 'Đỗ Gia Huy', 'huy@example.com', '$2a$10$Bxz3QIpaI.LuWQ2yhlUHm.dC8GkH0BHf/CjbdQWEd4ohzaCGIpLKm', '0986789012', 'Hải Phòng', '2025-11-26 15:55:39');

-- --------------------------------------------------------

--
-- Table structure for table `specialty`
--

CREATE TABLE `specialty` (
  `id` int(11) NOT NULL,
  `specialty_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specialty`
--

INSERT INTO `specialty` (`id`, `specialty_name`, `description`) VALUES
(1, 'Nội khoa', 'Chẩn đoán và điều trị các bệnh lí bên trong cơ thể, không phẫu thuật.'),
(2, 'Tim mạch', 'Chuyên điều trị bệnh tim và hệ mạch máu.'),
(3, 'Tai Mũi Họng', 'Chẩn đoán và điều trị các bệnh tai, mũi, họng và vùng cổ.'),
(4, 'Da liễu', 'Khám và điều trị bệnh lý da, tóc, móng và dị ứng da.'),
(5, 'Nhi khoa', 'Chăm sóc sức khỏe trẻ em từ sơ sinh đến thiếu niên.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointment_code` (`appointment_code`),
  ADD UNIQUE KEY `vnp_txn_ref` (`vnp_txn_ref`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `bookable_slot_id` (`bookable_slot_id`);

--
-- Indexes for table `bookable_slot`
--
ALTER TABLE `bookable_slot`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_slot` (`doctor_id`,`slot_date`,`start_time`),
  ADD KEY `availability_id` (`availability_id`);

--
-- Indexes for table `doctor`
--
ALTER TABLE `doctor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `specialty_id` (`specialty_id`);

--
-- Indexes for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_avail` (`doctor_id`,`day_of_week`,`start_time`,`end_time`,`slot_duration_minutes`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `specialty`
--
ALTER TABLE `specialty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `specialty_name` (`specialty_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bookable_slot`
--
ALTER TABLE `bookable_slot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctor`
--
ALTER TABLE `doctor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `specialty`
--
ALTER TABLE `specialty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  ADD CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`bookable_slot_id`) REFERENCES `bookable_slot` (`id`);

--
-- Constraints for table `bookable_slot`
--
ALTER TABLE `bookable_slot`
  ADD CONSTRAINT `bookable_slot_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  ADD CONSTRAINT `bookable_slot_ibfk_2` FOREIGN KEY (`availability_id`) REFERENCES `doctor_availability` (`id`);

--
-- Constraints for table `doctor`
--
ALTER TABLE `doctor`
  ADD CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`specialty_id`) REFERENCES `specialty` (`id`);

--
-- Constraints for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD CONSTRAINT `doctor_availability_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL;
COMMIT;
