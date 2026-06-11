package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.dto.request.CreateUserRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.RoleName;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SecurityUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    // Các dependency được MOCK (Làm giả)
    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private CloudinaryUtil cloudinaryUtil;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    // Inject các Mock trên vào UserService
    @InjectMocks
    private UserService userService;

    // Dùng để mock các hàm static (như SecurityUtils)
    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    @BeforeEach
    void setUp() {
        // Mở mock static trước mỗi hàm test
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
    }

    @AfterEach
    void tearDown() {
        // Đóng mock static sau mỗi hàm test để không rò rỉ bộ nhớ
        mockedSecurityUtils.close();
    }

    /**
     * Quy tắc đặt tên: tenHam_DieuKien_KetQuaMongDoi
     */

    // TEST CASE 1: Test luồng thành công (Happy Path) có dính hàm Static
    @Test
    void getInfo_UserExists_ReturnsUserResponse() {
        // 1. Arrange (Chuẩn bị)
        String mockEmail = "test@techstore.com";
        User mockUser = new User();
        mockUser.setEmail(mockEmail);

        UserResponse mockResponse = new UserResponse();
        mockResponse.setEmail(mockEmail);

        // Giả lập SecurityUtils trả về email
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail).thenReturn(mockEmail);
        // Giả lập DB trả về user
        when(userRepository.findByEmail(mockEmail)).thenReturn(Optional.of(mockUser));
        // Giả lập Mapper
        when(userMapper.toUserResponse(mockUser)).thenReturn(mockResponse);

        // 2. Act (Thực thi)
        UserResponse result = userService.getInfo();

        // 3. Assert (Kiểm tra)
        assertNotNull(result);
        assertEquals(mockEmail, result.getEmail());
        // Đảm bảo các hàm này THỰC SỰ ĐƯỢC GỌI đúng 1 lần
        verify(userRepository, times(1)).findByEmail(mockEmail);
        verify(userMapper, times(1)).toUserResponse(mockUser);
    }

    // TEST CASE 2: Test luồng quăng lỗi (Exception Path)
    @Test
    void updateUserStatus_UserAlreadyTerminated_ThrowsException() {
        // 1. Arrange
        Integer userId = 1;
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setStatus(UserStatus.TERMINATED); // Cố tình setup status là TERMINATED

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // 2 & 3. Act & Assert (Kiểm tra xem có ném ra đúng lỗi không)
        CustomException exception = assertThrows(CustomException.class, () -> {
            userService.updateUserStatus(userId, UserStatus.ACTIVE);
        });

        assertEquals(ErrorCode.USER_ALREADY_TERMINATED, exception.getErrorCode());
        // Đảm bảo hàm save() KHÔNG BAO GIỜ được gọi
        verify(userRepository, never()).save(any(User.class));
    }

    // TEST CASE 3: Test luồng Logic phức tạp (Có validate, mã hóa pass, gán role mặc định)
    @Test
    void createStaffAccount_ValidRequestRoleNotExists_CreatesNewRoleAndSavesUser() {
        // 1. Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("staff@test.com");
        request.setPhone("0123456789");
        request.setPassword("123456");
        request.setConfirmPassword("123456");

        User mappedUser = new User();
        mappedUser.setEmail(request.getEmail());

        Role newRole = new Role();
        newRole.setName(RoleName.STAFF.name());

        // Vượt qua các hàm validate
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);

        // Giả lập Role STAFF chưa tồn tại trong DB -> Phải tạo mới
        when(roleRepository.findByName(RoleName.STAFF.name())).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(newRole);

        when(userMapper.toCreateStaff(request)).thenReturn(mappedUser);
        when(passwordEncoder.encode("123456")).thenReturn("hashedPassword");

        // 2. Act
        userService.createStaffAccount(request);

        // 3. Assert
        verify(userRepository, times(1)).save(mappedUser);
        assertEquals("hashedPassword", mappedUser.getPassword());
        assertEquals(UserStatus.ACTIVE, mappedUser.getStatus());
        // Kiểm tra xem Role đã được gán vào User chưa
        assertTrue(mappedUser.getRoles().contains(newRole));
    }
}