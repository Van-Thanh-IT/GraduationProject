package com.example.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;


import com.example.backend.entity.Role;
import com.example.backend.entity.User;


@DataJpaTest // Kích hoạt môi trường test Database
@ActiveProfiles("test") // Gọi file application-test.yaml
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    // TestEntityManager là công cụ chuẩn của Spring để thao tác DB trong test
    // Nó an toàn và độc lập hơn so với việc gọi trực tiếp userRepository.save()
    @Autowired
    private TestEntityManager entityManager;

    private Role userRole;

    @BeforeEach
    void setUp() {
        // Chuẩn bị dữ liệu mẫu TRƯỚC MỖI bài test
        userRole = new Role();
        userRole.setName("USER");
        entityManager.persist(userRole); // Lưu Role vào DB ảo

        User testUser = new User();
        testUser.setEmail("test@techstore.com");
        testUser.setPhone("0987654321");
        testUser.setUsername("Nguyen Van A");
        testUser.setCreatedAt(LocalDateTime.now());
        // Giả sử class User của bạn có hàm addRole hoặc setRoles
        testUser.getRoles().add(userRole);

        entityManager.persist(testUser); // Lưu User vào DB ảo
        entityManager.flush(); // Ép Spring xả dữ liệu xuống DB ngay lập tức


        System.out.println("Đã lưu User vào DB!");

    }

    // ==========================================
    // TEST 1: TEST HÀM MẶC ĐỊNH SẴN CỦA JPA
    // ==========================================
    @Test
    void findByEmail_WhenEmailExists_ShouldReturnUser() {
        // Act: Gọi hàm cần test
        Optional<User> foundUser = userRepository.findByEmail("test@techstore.com");

        // Assert: Dùng AssertJ để kiểm tra cho dễ đọc (gần giống tiếng Anh)
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("Nguyen Van A");
    }

    @Test
    void findByEmail_WhenEmailDoesNotExist_ShouldReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("notfound@mail.com");

        // Assert
        assertThat(foundUser).isEmpty();
    }

    @Test
    void existsByPhone_WhenPhoneExists_ShouldReturnTrue() {
        // Act
        boolean exists = userRepository.existsByPhone("0987654321");

        // Assert
        assertThat(exists).isTrue();
    }

    // ==========================================
    // TEST 2: TEST HÀM @QUERY CUSTOM (CỰC KỲ QUAN TRỌNG)
    // ==========================================
    @Test
    void countByCreatedAtBetween_ShouldReturnCorrectCount() {
        // Mốc thời gian: Từ hôm qua đến ngày mai
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(1);

        // Arrange: Tạo thêm 1 user ở ngoài khoảng thời gian để test độ chính xác
        User oldUser = new User();
        oldUser.setUsername("vanthanh");
        oldUser.setEmail("old@mail.com");
        oldUser.setCreatedAt(LocalDateTime.now().minusDays(10)); // 10 ngày trước
        oldUser.getRoles().add(userRole);
        entityManager.persist(oldUser);
        entityManager.flush();

        // Act
        long count = userRepository.countByCreatedAtBetween(start, end);

        // Assert: Chỉ đếm được 1 người (là testUser tạo trong setUp), bỏ qua oldUser
        assertThat(count).isEqualTo(1);
    }
}