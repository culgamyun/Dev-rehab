package com.antigravity.shop.order;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TODO(Ch2 / Ch7): 주문 서비스 — 빈칸을 채우세요.
 * 현재는 컴파일만 되도록 UnsupportedOperationException을 던집니다.
 * OrderServiceTest의 @Disabled를 제거하고 통과시키는 것이 목표입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    // TODO(Ch7): private final InventoryClient / PaymentClient (외부 호출 → Virtual Threads 체감)

    /**
     * TODO(Ch2): 사용자 주문 목록 조회.
     *  1) 먼저 naive하게 구현 → 로그에서 N+1 쿼리 폭발을 관찰
     *  2) Fetch Join(또는 @BatchSize)으로 해결 후 쿼리 수 비교
     */
    public java.util.List<Order> findUserOrders(Long userId) {
        throw new UnsupportedOperationException("TODO(Ch2): N+1 재현 후 Fetch Join으로 해결");
    }

    /**
     * TODO(Ch7): 주문 생성 (재고 확인 → 결제 → 저장). 동기 코드로 작성하고
     *  Virtual Threads 환경에서 외부 I/O 대기가 어떻게 처리되는지 체감하세요.
     */
    @Transactional
    public Order placeOrder(Long userId, int total) {
        throw new UnsupportedOperationException("TODO(Ch7): 주문 생성 플로우 구현");
    }
}
