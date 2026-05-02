package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Integer id;
    private String fullName;
    private String phone;
    private String addressDetail;
    private String city;
    private String district;
    private String ward;

    private String cityCode;
    private String districtCode;
    private String wardCode;

    private String fullAddress;

    private Boolean isDefault;
}