package com.antigravity.shop.product;

import com.antigravity.shop.product.dto.ProductResponse;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 참고용 완성본 — 순수 단위 테스트 (@Mock, Spring Context 미로딩 → 빠름). 부록 A.
 * 이 테스트는 "초록"으로 통과합니다. 다른 챕터 테스트의 작성 모범으로 보세요.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    ProductRepository productRepository;

    @InjectMocks
    ProductService productService;

    @Test
    @DisplayName("findById_존재하면_DTO를_반환한다")
    void findById_success() {
        // given
        Product product = new Product("후드", 59000, "outer", 10);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // when
        ProductResponse res = productService.findById(1L);

        // then
        assertThat(res.name()).isEqualTo("후드");
        assertThat(res.price()).isEqualTo(59000);
        verify(productRepository).findById(1L);
    }

    @Test
    @DisplayName("findById_없으면_EntityNotFoundException")
    void findById_notFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }
}
