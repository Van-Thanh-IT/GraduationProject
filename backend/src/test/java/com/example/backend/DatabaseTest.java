package com.example.backend;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseTest {

    @Test
    void testConnection() {
        try {
            Connection conn = DriverManager.getConnection(
                    "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require",
                    "postgres.pnbphzlourlbletazjrx",
                    "0353198531kK@"
            );

            System.out.println("Connected!");
            System.out.println("✅ Kết nối thành công");
            conn.close();
        } catch (Exception e) {
            System.out.println("❌ Kết nối thất bại");
            e.printStackTrace();
        }
    }
}