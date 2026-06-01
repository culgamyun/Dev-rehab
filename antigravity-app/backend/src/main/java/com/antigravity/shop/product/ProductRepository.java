package com.antigravity.shop.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 참고용 완성본 — Repository (DB 접근 계층).
 * Spring Data JPA가 메서드 이름으로 쿼리를 자동 생성한다.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    // 이름 부분 검색 (Ch3에서 인덱스 효과를 관찰할 대상)
    List<Product> findByNameContainingIgnoreCase(String keyword);
}
