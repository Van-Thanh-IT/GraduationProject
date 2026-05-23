package com.example.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.backend.dto.request.GoshipDto;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoshipService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.goship.api.url}")
    private String baseUrl;

    @Value("${spring.goship.api.token}")
    private String token;

    @Value("${spring.goship.shop.name}")
    private String shopName;

    @Value("${spring.goship.shop.phone}")
    private String shopPhone;

    @Value("${spring.goship.shop.address}")
    private String shopAddress;

    @Value("${spring.goship.shop.city}")
    private String shopCityCode;

    @Value("${spring.goship.shop.district}")
    private String shopDistrictCode;

    @Value("${spring.goship.shop.ward}")
    private String shopWardCode;

    private static final int DEFAULT_WIDTH = 10;
    private static final int DEFAULT_HEIGHT = 10;
    private static final int DEFAULT_LENGTH = 10;
    private static final int DEFAULT_WEIGHT = 220;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }

    public Map<String, Object> getCities() {
        return executeGetRequest("/cities");
    }

    public Map<String, Object> getDistrictsByCity(String cityCode) {
        return executeGetRequest("/cities/" + cityCode + "/districts");
    }

    public Map<String, Object> getWardsByDistrict(String districtCode) {
        return executeGetRequest("/districts/" + districtCode + "/wards");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> executeGetRequest(String endpoint) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(baseUrl + endpoint, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Lỗi khi lấy dữ liệu địa lý từ Goship [{}]: {}", endpoint, e.getMessage());
            throw new CustomException(
                    ErrorCode.GOSHIP_API_ERROR, "Không thể tải dữ liệu địa lý từ máy chủ vận chuyển.");
        }
    }

    public List<Map<String, Object>> calculateShippingFee(GoshipDto.FeeRequest request) {
        try {
            int weight = request.getWeight() != null && request.getWeight() > 0 ? request.getWeight() : DEFAULT_WEIGHT;

            GoshipDto.RatePayload payload = GoshipDto.RatePayload.builder()
                    .shipment(GoshipDto.RatePayload.Shipment.builder()
                            .addressFrom(GoshipDto.RatePayload.Address.builder()
                                    .city(shopCityCode)
                                    .district(shopDistrictCode)
                                    .ward(shopWardCode)
                                    .build())
                            .addressTo(GoshipDto.RatePayload.Address.builder()
                                    .city(request.getCity())
                                    .district(request.getDistrict())
                                    .ward(request.getWard())
                                    .build())
                            .parcel(GoshipDto.RatePayload.Parcel.builder()
                                    .cod(request.getCod())
                                    .amount(request.getAmount())
                                    .weight(weight)
                                    .width(DEFAULT_WIDTH)
                                    .height(DEFAULT_HEIGHT)
                                    .length(DEFAULT_LENGTH)
                                    .build())
                            .build())
                    .build();

            HttpEntity<GoshipDto.RatePayload> entity = new HttpEntity<>(payload, createHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(baseUrl + "/rates", entity, String.class);

            return parseRatesResponse(response.getBody());

        } catch (HttpClientErrorException e) {
            log.error("Goship từ chối tính phí: {}", e.getResponseBodyAsString());
            throw new CustomException(ErrorCode.GOSHIP_REJECTED, "Dữ liệu địa chỉ không hợp lệ.");
        } catch (Exception e) {
            log.error("Lỗi hệ thống tính phí Goship: ", e);
            throw new CustomException(ErrorCode.GOSHIP_API_ERROR, "Hệ thống vận chuyển đang bận.");
        }
    }

    private List<Map<String, Object>> parseRatesResponse(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode dataArray = rootNode.path("data");

            List<Map<String, Object>> availableRates = new ArrayList<>();

            if (dataArray.isArray()) {
                for (JsonNode rateNode : dataArray) {
                    Map<String, Object> rateMap = objectMapper.convertValue(rateNode, new TypeReference<>() {});
                    availableRates.add(rateMap);
                }
            }
            return availableRates;
        } catch (Exception e) {
            log.error("Lỗi parse JSON", e);
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> createShipment(Map<String, Object> data) {
        try {
            log.info("Bắt đầu tạo đơn Goship với rate_id: {}", data.get("rate_id"));

            // Tối ưu hóa việc tạo cấu trúc Map lồng nhau để code dễ đọc và tránh typo
            Map<String, Object> addressFrom = Map.of(
                    "name",
                    shopName,
                    "phone",
                    shopPhone,
                    "street",
                    shopAddress,
                    "city",
                    shopCityCode,
                    "district",
                    shopDistrictCode,
                    "ward",
                    shopWardCode);

            Map<String, Object> addressTo = Map.of(
                    "name",
                    data.get("name"),
                    "phone",
                    data.get("phone"),
                    "street",
                    data.get("address_detail"),
                    "city",
                    data.get("city"),
                    "district",
                    data.get("district"),
                    "ward",
                    data.get("ward"));

            Map<String, Object> parcel = Map.of(
                    "cod",
                    Integer.parseInt(data.get("cod").toString()),
                    "amount",
                    Integer.parseInt(data.get("amount").toString()),
                    "weight",
                    DEFAULT_WEIGHT,
                    "width",
                    DEFAULT_WIDTH,
                    "height",
                    DEFAULT_HEIGHT,
                    "length",
                    DEFAULT_LENGTH,
                    "metadata",
                    "Hàng dễ vỡ, vui lòng nhẹ tay.");

            Map<String, Object> shipment = Map.of(
                    "rate", data.get("rate_id"),
                    "payer", 0,
                    "address_from", addressFrom,
                    "address_to", addressTo,
                    "parcel", parcel);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(Map.of("shipment", shipment), createHeaders());
            ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/shipments", entity, Map.class);

            return response.getBody();

        } catch (HttpClientErrorException e) {
            log.error("Lỗi 4xx từ Goship khi tạo đơn: {}", e.getResponseBodyAsString());
            throw new CustomException(ErrorCode.GOSHIP_REJECTED, "Dữ liệu tạo đơn không được Goship chấp nhận.");
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi tạo đơn Goship: ", e);
            throw new CustomException(ErrorCode.GOSHIP_API_ERROR, "Không thể kết nối đến máy chủ giao hàng.");
        }
    }

    @SuppressWarnings("unchecked")
    public void cancelShipment(String shipmentId) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            restTemplate.exchange(baseUrl + "/shipments/" + shipmentId, HttpMethod.DELETE, entity, Map.class);
            log.info("Đã hủy thành công mã vận đơn Goship: {}", shipmentId);

        } catch (HttpClientErrorException e) {
            log.error("API Goship từ chối hủy đơn [{}]: {}", shipmentId, e.getResponseBodyAsString());
            throw new CustomException(ErrorCode.GOSHIP_REJECTED, "Bên vận chuyển từ chối hủy đơn hàng này.");
        } catch (Exception e) {
            log.error("Lỗi kết nối Goship khi hủy đơn [{}]: {}", shipmentId, e.getMessage());
            throw new CustomException(ErrorCode.GOSHIP_API_ERROR, "Lỗi kết nối đến máy chủ giao hàng.");
        }
    }
}
