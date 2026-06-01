package com.antigravity.shop.product.dto;

import com.antigravity.shop.product.Product;
import jakarta.validation.constraints.*;

/**
 * 참고용 완성본 — 요청 DTO + Bean Validation (Ch4 검증).
 * record로 불변 DTO를 만든다 (Ch1 record).
 */
public record ProductRequest(

        @NotBlank(message = "상품명은 필수입니다")
        @Size(max = 200, message = "상품명은 200자 이내")
        String name,

        @NotNull(message = "가격은 필수입니다")
        @Min(value = 0, message = "가격은 0 이상")
        Integer price,

        @NotBlank(message = "카테고리는 필수입니다")
        String category,

        @NotNull @Min(value = 0, message = "재고는 0 이상")
        Integer stock
) {
    public Product toEntity() {
        return new Product(name, price, category, stock);
    }
}
