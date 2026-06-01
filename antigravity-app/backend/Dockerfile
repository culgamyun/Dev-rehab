# Ch8 체크포인트 — Spring Boot 멀티 스테이지 빌드 (이미지 경량화)
# 1단계: 빌드 (JDK + Gradle)
FROM gradle:8.10-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# 2단계: 런타임 (가벼운 JRE만)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /opt/shop
COPY --from=builder /app/build/libs/*.jar shop-app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "shop-app.jar"]
