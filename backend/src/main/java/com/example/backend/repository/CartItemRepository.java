package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.cart.id = :cartId AND c.id IN :itemIds")
    int deleteAllByIdInAndCartId(@Param("itemIds") List<Integer> itemIds, @Param("cartId") Integer cartId);
}
