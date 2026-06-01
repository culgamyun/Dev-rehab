package com.antigravity.shop.product;

import com.antigravity.shop.product.dto.ProductRequest;
import com.antigravity.shop.product.dto.ProductResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 참고용 완성본 — Service (비즈니스 로직 + 트랜잭션 경계).
 * 클래스 기본은 readOnly, 쓰기 메서드만 @Transactional 재정의. (Ch2)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream()   // Ch1 Stream
                .map(ProductResponse::from)            // Ch1 메서드 참조
                .toList();
    }

    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("상품 없음 id=" + id));
        return ProductResponse.from(product);
    }

    @Transactional // 쓰기 → readOnly 해제
    public ProductResponse create(ProductRequest req) {
        Product saved = productRepository.save(req.toEntity());
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("상품 없음 id=" + id));
        product.update(req.name(), req.price(), req.category(), req.stock()); // 더티 체킹
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}
