package com.antigravity.shop.order;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.fail;

/**
 * TODO(Ch2): @Disabled를 제거하고 이 테스트를 초록으로 만드세요.
 *  - Order ↔ OrderItem 1:N 매핑 완성
 *  - OrderService.findUserOrders 구현 (Fetch Join)
 *  - 권장: Hibernate Statistics로 쿼리 수가 1~2개인지 단언 (N+1이 아님을 검증)
 */
@Disabled("TODO(Ch2): 주문 N+1 해결을 구현한 뒤 이 줄을 삭제하세요")
class OrderServiceTest {

    @Test
    @DisplayName("findUserOrders_는_N+1없이_주문과_아이템을_가져온다")
    void findUserOrders_noNPlusOne() {
        fail("TODO(Ch2): 구현 후 검증 로직 작성");
    }
}
