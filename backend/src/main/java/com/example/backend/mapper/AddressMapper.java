package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.AddressRequest;
import com.example.backend.dto.response.client.AddressResponse;
import com.example.backend.entity.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    @Mapping(
            target = "fullAddress",
            expression =
                    "java(address.getAddressDetail() + \", \" + address.getWard() + \", \" + address.getDistrict() + \", \" + address.getCity())")
    AddressResponse toAddressResponse(Address address);

    Address toAddress(AddressRequest request);

    @Mapping(target = "isDefault", ignore = true)
    void toUpdateAddress(AddressRequest request, @MappingTarget Address address);
}
