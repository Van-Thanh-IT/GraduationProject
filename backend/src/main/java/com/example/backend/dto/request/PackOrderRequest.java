package com.example.backend.dto.request;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PackOrderRequest {
    // Hứng cục JSON: { "101": ["IMEI-ABC"], "102": ["SN-XYZ"] }
    private Map<Integer, List<String>> serials;
}