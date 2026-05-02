package com.example.backend.service;

import com.example.backend.dto.request.GoshipDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoshipService {

    private final RestTemplate restTemplate;
    private final tools.jackson.databind.ObjectMapper objectMapper; // Jackson dùng để parse JSON

    @Value("${spring.goship.api.url}")
    private String baseUrl;

    @Value("${spring.goship.api.token}")
    private String token;

    // Cấu hình Shop
    @Value("${spring.goship.shop.name}") private String shopName;
    @Value("${spring.goship.shop.phone}") private String shopPhone;
    @Value("${spring.goship.shop.address}") private String shopAddress;
    @Value("${spring.goship.shop.city}") private String shopCityCode;
    @Value("${spring.goship.shop.district}") private String shopDistrictCode;
    @Value("${spring.goship.shop.ward}") private String shopWardCode;

    // ==========================================
    // HÀM TIỆN ÍCH: TẠO HEADER AUTHENTICATION
    // ==========================================
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }

    // ==========================================
    // 1. LẤY DANH SÁCH TỈNH / THÀNH PHỐ
    // ==========================================
    public Map<String, Object> getCities() {
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/cities", HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }

    public Map<String, Object> getDistrictsByCity(String cityCode) {
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/cities/" + cityCode + "/districts", HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }

    public Map<String, Object> getWardsByDistrict(String districtCode) {
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/districts/" + districtCode + "/wards", HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }

    // ==========================================
    // TÍNH PHÍ VẬN CHUYỂN (CHUẨN ENTERPRISE DÙNG DTO)
    // ==========================================
    public List<JsonNode> calculateShippingFee(GoshipDto.FeeRequest request) {
        try {
            // 1. Lắp ráp dữ liệu gửi đi (Dùng Builder cực kỳ rõ ràng)
            GoshipDto.RatePayload payload = GoshipDto.RatePayload.builder()
                    .shipment(GoshipDto.RatePayload.Shipment.builder()
                            // Địa chỉ Shop (Lấy từ biến @Value)
                            .addressFrom(GoshipDto.RatePayload.Address.builder()
                                    .city(shopCityCode)
                                    .district(shopDistrictCode)
                                    .ward(shopWardCode)
                                    .build())

                            // Địa chỉ Khách (Lấy từ Request)
                            .addressTo(GoshipDto.RatePayload.Address.builder()
                                    .city(request.getCity())
                                    .district(request.getDistrict())
                                    .ward(request.getWard())
                                    .build())

                            // Thông tin gói hàng
                            .parcel(GoshipDto.RatePayload.Parcel.builder()
                                    .cod(request.getCod())
                                    .amount(request.getAmount())
                                    .weight(request.getWeight())
                                    .width(10)
                                    .height(10)
                                    .length(10)
                                    .build())
                            .build())
                    .build();

            // 2. Gọi API Goship (RestTemplate tự động parse Object Payload thành JSON)
            HttpEntity<GoshipDto.RatePayload> entity = new HttpEntity<>(payload, createHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(baseUrl + "/rates", entity, String.class);

            // 3. Đọc kết quả và lọc ra GHN
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode dataArray = rootNode.path("data");

            List<JsonNode> availableRates = new ArrayList<>();

            if (dataArray.isArray()) {
                for (JsonNode rateNode : dataArray) {
                    availableRates.add(rateNode);
                }
            }
            return availableRates;
        } catch (Exception e) {
            log.error("Lỗi tính phí Goship: {}", e.getMessage());
            throw new RuntimeException("Không thể tính phí vận chuyển!");
        }
    }

    // ==========================================
    // 3. TẠO VẬN ĐƠN (GOSHIP)
    // ==========================================
    public Map<String, Object> createShipment(Map<String, Object> data) {
        try {
            log.info("Bắt đầu tạo đơn Goship với data: {}", data);

            Map<String, Object> payload = new HashMap<>();
            Map<String, Object> shipment = new HashMap<>();

            shipment.put("rate", data.get("rate_id"));
            shipment.put("payer", 0); // 0: Người nhận trả phí, 1: Shop trả

            shipment.put("address_from", Map.of(
                    "name", shopName,
                    "phone", shopPhone,
                    "street", shopAddress,
                    "city", shopCityCode,
                    "district", shopDistrictCode,
                    "ward", shopWardCode
            ));

            shipment.put("address_to", Map.of(
                    "name", data.get("name"),
                    "phone", data.get("phone"),
                    "street", data.get("address_detail"),
                    "city", data.get("city"),
                    "district", data.get("district"),
                    "ward", data.get("ward")
            ));

            shipment.put("parcel", Map.of(
                    "cod", Integer.parseInt(data.get("cod").toString()),
                    "amount", Integer.parseInt(data.get("amount").toString()),
                    "weight", 220,
                    "width", 1,
                    "height", 1,
                    "length", 1,
                    "metadata", "Hàng dễ vỡ, vui lòng nhẹ tay."
            ));

            payload.put("shipment", shipment);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, createHeaders());
            ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/shipments", entity, Map.class);

            return response.getBody();

        } catch (HttpClientErrorException e) {
            // Bắt lỗi 4xx (Ví dụ: truyền sai rate_id, thiếu trường...)
            log.error("Lỗi 4xx từ Goship: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi tạo đơn Goship: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi tạo đơn Goship: {}", e.getMessage());
            throw new RuntimeException("Lỗi tạo đơn Goship!");
        }
    }

    // ==========================================
    // 4. HỦY VẬN ĐƠN
    // ==========================================
    public Map<String, Object> cancelShipment(String shipmentId) {
        Map<String, Object> result = new HashMap<>();
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/shipments/" + shipmentId, HttpMethod.DELETE, entity, Map.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("API Goship từ chối hủy đơn: {}", e.getResponseBodyAsString());
            result.put("success", false);
            result.put("message", "Lỗi từ Goship: " + e.getResponseBodyAsString());
            return result;
        } catch (Exception e) {
            log.error("Lỗi kết nối Goship khi hủy đơn: {}", e.getMessage());
            result.put("success", false);
            result.put("message", "Lỗi kết nối Goship");
            return result;
        }
    }
}