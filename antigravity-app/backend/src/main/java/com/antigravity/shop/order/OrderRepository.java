package com.antigravity.shop.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    // TODO(Ch2): N+1을 해결하는 Fetch Join 메서드를 추가하세요.
    //  @Query("select distinct o from Order o join fetch o.items where o.userId = :userId")
    //  List<Order> findByUserIdWithItems(@Param("userId") Long userId);
}
