package com.example.backend.service;


import com.example.backend.dto.request.AddressRequest;
import com.example.backend.dto.response.AddressResponse;
import com.example.backend.entity.Address;
import com.example.backend.entity.User;
import com.example.backend.mapper.AddressMapper; // Bổ sung import
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    // 1. TIÊM MAPPER VÀO ĐÂY
    private final AddressMapper addressMapper;

    public List<AddressResponse> getMyAddresses() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);

        // DÙNG MAPPER RẤT NGẮN GỌN
        return addresses.stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        boolean isFirstAddress = addressRepository.countByUserId(userId) == 0;
        boolean wantsDefault = request.getIsDefault() != null && request.getIsDefault();

        if (isFirstAddress) wantsDefault = true;
        if (wantsDefault && !isFirstAddress) addressRepository.clearDefaultAddress(userId);

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressDetail(request.getAddressDetail())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .cityCode(request.getCityCode())
                .districtCode(request.getDistrictCode())
                .wardCode(request.getWardCode())
                .isDefault(wantsDefault)
                .build();

        // DÙNG MAPPER TRẢ VỀ LUÔN
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Integer id, AddressRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();

        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ hoặc bạn không có quyền!"));

        boolean wantsDefault = request.getIsDefault() != null && request.getIsDefault();

        if (wantsDefault && !address.getIsDefault()) {
            addressRepository.clearDefaultAddress(userId);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressDetail(request.getAddressDetail());
        address.setCity(request.getCity());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setCityCode(request.getCityCode());
        address.setDistrictCode(request.getDistrictCode());
        address.setWardCode(request.getWardCode());

        if (address.getIsDefault() && !wantsDefault) {
            throw new RuntimeException("Không thể bỏ địa chỉ mặc định. Hãy chọn một địa chỉ khác làm mặc định thay thế!");
        }

        address.setIsDefault(wantsDefault);

        // DÙNG MAPPER
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (address.getIsDefault()) {
            throw new RuntimeException("Không thể xóa địa chỉ đang được đặt làm mặc định!");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (!address.getIsDefault()) {
            addressRepository.clearDefaultAddress(userId);
            address.setIsDefault(true);
            addressRepository.save(address);
        }
    }
}