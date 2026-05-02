package com.example.backend.repository;

import com.example.backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Integer> {

    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Integer id);

    // Lấy chi tiết Voucher chưa bị xóa mềm
    Optional<Voucher> findByIdAndDeletedAtIsNull(Integer id);
    Optional<Voucher> findByCodeAndDeletedAtIsNull(String code);

    //Lấy voucher chưa bị xóa mềm
    List<Voucher> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    @Query("SELECT v FROM Voucher v WHERE v.deletedAt IS NULL " +
            "AND v.startDate <= :now AND v.endDate >= :now " +
            "AND (v.usageLimit = 0 OR v.usedCount < v.usageLimit)")
    List<Voucher> findValidVouchersForUser(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Voucher v SET v.usedCount = v.usedCount + 1 " +
            "WHERE v.code = :code AND v.deletedAt IS NULL " +
            "AND (v.usageLimit = 0 OR v.usedCount < v.usageLimit)")
    int incrementUsedCountSafely(@Param("code") String code);
}