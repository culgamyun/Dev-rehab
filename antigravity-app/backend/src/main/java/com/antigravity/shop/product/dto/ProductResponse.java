package com.antigravity.shop.product.dto;

import com.antigravity.shop.product.Product;

/**
 * 참고용 완성본 — 응답 DTO (Ch2 Entity↔DTO 분리).
 * Entity를 그대로 반환하면 순환 참조/보안 노출/Lazy 예외 위험. 반드시 변환한다.
 */
public record ProductResponse(
        Long id,
        String name,
        int price,
        String category,
        int stock
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getCategory(), p.getStock());
    }
}
