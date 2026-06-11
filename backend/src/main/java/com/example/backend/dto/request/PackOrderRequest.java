package com.example.backend.dto.request;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class PackOrderRequest {
    private Map<Integer, List<String>> serials;
}
