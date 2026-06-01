package com.antigravity.shop.auth;

import com.antigravity.shop.auth.dto.LoginRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * TODO(Ch4): 인증 컨트롤러 — 로그인/로그아웃 엔드포인트.
 */
@Tag(name = "인증", description = "JWT 로그인/로그아웃")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest req) {
        // TODO(Ch4): 토큰 응답 DTO로 감싸기 (accessToken, refreshToken)
        return authService.login(req);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String bearer) {
        // TODO(Ch4): "Bearer " 접두사 제거 후 전달
        authService.logout(bearer);
    }
}
