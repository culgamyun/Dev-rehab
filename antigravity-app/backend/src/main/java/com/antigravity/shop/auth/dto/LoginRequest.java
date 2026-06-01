package com.antigravity.shop.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// TODO(Ch4): 로그인 요청 DTO (검증 포함)
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
