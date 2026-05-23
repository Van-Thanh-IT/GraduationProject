package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.AddressRequest;
import com.example.backend.dto.response.client.AddressResponse;
import com.example.backend.entity.Address;
import com.example.backend.entity.User;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AddressMapper;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    private static final int MAX_ADDRESSES_PER_USER = 5;

    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses() {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(getCurrentUserId()).stream()
                .map(addressMapper::toAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        Integer userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        long totalAddresses = addressRepository.countByUserId(userId);

        if (totalAddresses >= MAX_ADDRESSES_PER_USER) {
            log.warn("User {} attempted to create more than {} addresses", userId, MAX_ADDRESSES_PER_USER);
            throw new CustomException(ErrorCode.ADDRESS_LIMIT_EXCEEDED);
        }

        boolean isFirstAddress = (totalAddresses == 0);
        boolean wantsDefault = Boolean.TRUE.equals(request.getIsDefault());

        if (isFirstAddress) {
            wantsDefault = true;
        }

        if (wantsDefault && !isFirstAddress) {
            addressRepository.clearDefaultAddress(userId);
        }

        Address address = addressMapper.toAddress(request);
        address.setUser(user);
        address.setIsDefault(wantsDefault);

        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Integer id, AddressRequest request) {
        Integer userId = getCurrentUserId();
        Address address = getMyAddressOrThrow(id, userId);

        boolean oldDefault = Boolean.TRUE.equals(address.getIsDefault());
        boolean newDefault = request.getIsDefault() != null ? request.getIsDefault() : oldDefault;

        if (newDefault && !oldDefault) {
            addressRepository.clearDefaultAddress(userId);
        }

        if (oldDefault && !newDefault) {
            throw new CustomException(ErrorCode.ADDRESS_DEFAULT_REQUIRED);
        }

        addressMapper.toUpdateAddress(request, address);
        address.setIsDefault(newDefault);

        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Integer id) {
        Integer userId = getCurrentUserId();
        Address address = getMyAddressOrThrow(id, userId);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            long totalAddresses = addressRepository.countByUserId(userId);
            if (totalAddresses > 1) {
                throw new CustomException(ErrorCode.ADDRESS_CANNOT_DELETE_DEFAULT);
            }
        }

        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Integer id) {
        Integer userId = getCurrentUserId();
        Address address = getMyAddressOrThrow(id, userId);

        if (!Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultAddress(userId);
            address.setIsDefault(true);
            addressRepository.save(address);
        }
    }

    private Integer getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    private Address getMyAddressOrThrow(Integer id, Integer userId) {
        return addressRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.ADDRESS_NOT_FOUND));
    }
}
