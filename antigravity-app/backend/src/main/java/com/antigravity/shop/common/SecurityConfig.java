package com.antigravity.shop.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security 스켈레톤 — Ch4 전까지는 전체 허용(permitAll)으로 product 슬라이스를 띄운다.
 * Ch4에서 JWT 인증/인가를 여기에 구현하며 점진적으로 잠근다. (Lambda DSL — Spring Security 6 표준)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // JWT(무상태) 전제: CSRF off + 세션 STATELESS
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // TODO(Ch4): 아래 permitAll을 실제 정책으로 교체
                //   - /api/auth/** : permitAll (로그인/회원가입)
                //   - 그 외 /api/** : authenticated()
                //   - swagger-ui, v3/api-docs : permitAll
                .anyRequest().permitAll()
            );
        // TODO(Ch4): http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Ch4: 비밀번호 단방향 해싱
    }
}
