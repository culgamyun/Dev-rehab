package com.antigravity.shop.common;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 참고용 완성본 — 전역 예외 처리 + ProblemDetail (RFC 9457, Ch4).
 * 모든 컨트롤러 예외를 한 곳에서 표준 형식으로 변환한다.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Bean Validation 실패 → 400 + 필드별 메시지
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        var problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("입력 검증 실패");
        problem.setType(URI.create("https://shop.example.com/errors/validation"));
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid",
                        (a, b) -> a));
        problem.setProperty("errors", errors);
        log.warn("검증 실패 fields={}", errors.keySet());
        return problem;
    }

    // 도메인 예외 → 404
    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleNotFound(EntityNotFoundException ex) {
        var problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("리소스를 찾을 수 없음");
        problem.setDetail(ex.getMessage());
        return problem;
    }

    // 처리되지 않은 예외 → 500 (스택 트레이스 로깅)
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnknown(Exception ex) {
        log.error("처리되지 않은 예외", ex);
        var problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("서버 오류");
        problem.setDetail("일시적 오류입니다. 잠시 후 다시 시도해주세요.");
        return problem;
    }

    // TODO(Ch4): 비즈니스 예외(OutOfStockException 등) 핸들러 추가 → 409 등
}
