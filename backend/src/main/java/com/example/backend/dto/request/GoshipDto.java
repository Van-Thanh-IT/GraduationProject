package com.example.backend.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class GoshipDto {

    @Data
    @Builder
    // ==========================================
    // THÊM 2 DÒNG NÀY ĐỂ JACKSON KHÔNG BỊ NGÁO
    // ==========================================
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeRequest {
        private String city;
        private String district;
        private String ward;
        private Integer cod;
        private Integer amount;
        private Integer weight;
        private Integer width;
        private Integer height;
        private Integer length;
    }

    // Tiện tay thì thêm luôn cho các class bên dưới để sau này không bị lỗi nhé
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatePayload {
        private Shipment shipment;

        @Data @Builder
        public static class Shipment {
            @JsonProperty("address_from")
            private Address addressFrom;

            @JsonProperty("address_to")
            private Address addressTo;

            private Parcel parcel;
        }

        @Data @Builder
        public static class Address {
            private String city;
            private String district;
            private String ward;
        }

        @Data @Builder
        public static class Parcel {
            private Integer cod;
            private Integer amount;
            private Integer weight;
            private Integer width;
            private Integer height;
            private Integer length;
        }
    }
}