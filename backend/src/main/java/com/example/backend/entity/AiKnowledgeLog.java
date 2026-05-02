//package com.example.backend.entity;
//
//import jakarta.persistence.Entity;
//import org.hibernate.annotations.JdbcTypeCode;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.type.SqlTypes;
//
//import java.time.LocalDateTime;
//import java.util.Map;
//
//@Entity
//@Table(name = "ai_knowledge_logs")
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class AiKnowledgeLog {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "message_id")
//    private Long messageId;
//
//    @JdbcTypeCode(SqlTypes.JSON)
//    @Column(columnDefinition = "jsonb")
//    private Map<String, Object> sourceData;
//
//    @CreationTimestamp
//    @Column(name = "query_timestamp")
//    private LocalDateTime queryTimestamp;
//}