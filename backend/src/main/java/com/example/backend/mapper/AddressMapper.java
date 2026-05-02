package com.example.backend.mapper;

import com.example.backend.dto.response.AddressResponse;
import com.example.backend.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    @Mapping(target = "fullAddress", expression = "java(address.getAddressDetail() + \", \" + address.getWard() + \", \" + address.getDistrict() + \", \" + address.getCity())")
    AddressResponse toResponse(Address address);
}