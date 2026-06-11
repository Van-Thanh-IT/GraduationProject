package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Integer userId);

    Optional<Address> findByIdAndUserId(Integer id, Integer userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.isDefault = true")
    void clearDefaultAddress(@Param("userId") Integer userId);

    boolean existsByUserId(Integer userId);

    long countByUserId(Integer userId);
}
