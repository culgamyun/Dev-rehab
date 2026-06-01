package com.antigravity.shop.auth;

import com.antigravity.shop.auth.dto.LoginRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * TODO(Ch4): 인증 서비스 — JWT 로그인/로그아웃을 구현하세요.
 *  - 로그인: 이메일 조회 → BCrypt matches → Access/Refresh 토큰 발급
 *  - 로그아웃: 토큰을 Redis 블랙리스트에 SETEX (남은 만료시간)
 *  - JwtAuthenticationFilter(OncePerRequestFilter)에서 블랙리스트 확인
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    // TODO(Ch4): private final UserRepository userRepository;
    // TODO(Ch4): private final PasswordEncoder passwordEncoder;  (SecurityConfig에 Bean 존재)
    // TODO(Ch4): private final StringRedisTemplate redisTemplate; (블랙리스트)
    // TODO(Ch4): private final JwtProvider jwtProvider;          (직접 작성)

    public String login(LoginRequest req) {
        throw new UnsupportedOperationException("TODO(Ch4): BCrypt 검증 + JWT 발급");
    }

    public void logout(String token) {
        throw new UnsupportedOperationException("TODO(Ch4): Redis 블랙리스트 등록");
    }
}
