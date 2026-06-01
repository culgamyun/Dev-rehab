package com.antigravity.shop.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 참고용 완성본 — @Entity (DB 매핑 객체).
 * 외부(API)로는 절대 직접 노출하지 않고 DTO로 변환해서 내보낸다. (Ch2 레이어드)
 */
@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 기본 생성자 (안전하게 PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private int stock;

    public Product(String name, int price, String category, int stock) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.stock = stock;
    }

    /** 도메인 메서드 — 값 변경은 메서드로 (더티 체킹으로 UPDATE) */
    public void update(String name, int price, String category, int stock) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.stock = stock;
    }
}
