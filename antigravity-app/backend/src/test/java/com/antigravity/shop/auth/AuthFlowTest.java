package com.antigravity.shop.auth;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.fail;

/**
 * TODO(Ch4): @Disabled 제거 후 통과시키세요.
 *  - 통합 테스트(@SpringBootTest) 또는 슬라이스(@WebMvcTest + @MockitoBean)로
 *    로그인 → 보호된 엔드포인트 호출 → 로그아웃 → 같은 토큰 재사용 거부(401) 흐름을 검증.
 */
@Disabled("TODO(Ch4): JWT 로그인/로그아웃 구현 후 이 줄을 삭제하세요")
class AuthFlowTest {

    @Test
    @DisplayName("로그인_후_보호된_API_접근_가능하고_로그아웃_후_차단된다")
    void loginLogoutFlow() {
        fail("TODO(Ch4): 인증 흐름 구현 + 검증");
    }
}
