package com.antigravity.shop.order;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * TODO(Ch2): 주문 엔티티 — 1:N 연관관계를 직접 완성하세요.
 *  - OrderItem 엔티티 생성 후 @OneToMany(mappedBy = "order") 매핑
 *  - 양방향 연관관계의 주인(@JoinColumn은 N쪽)을 올바르게 설정
 *  - 그 뒤 OrderService에서 N+1을 재현하고 Fetch Join으로 해결
 */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 20)
    private String status; // PENDING / PAID / DELIVERED

    @Column(nullable = false)
    private int total;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // TODO(Ch2): @OneToMany(mappedBy = "order", cascade = ...) private List<OrderItem> items;

    public Order(Long userId, String status, int total) {
        this.userId = userId;
        this.status = status;
        this.total = total;
    }
}
