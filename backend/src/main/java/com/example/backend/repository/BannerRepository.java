package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Banner;
import com.example.backend.enums.BannerPlacement;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {

    @Query("SELECT b FROM Banner b WHERE b.isActive = true "
            + "AND b.placement = :placement "
            + "AND (b.startDate IS NULL OR b.startDate <= :now) "
            + "AND (b.endDate IS NULL OR b.endDate >= :now) "
            + "ORDER BY b.sortOrder ASC, b.createdAt DESC")
    List<Banner> findActiveBannersByPlacement(
            @Param("placement") BannerPlacement placement, @Param("now") LocalDateTime now);
}
