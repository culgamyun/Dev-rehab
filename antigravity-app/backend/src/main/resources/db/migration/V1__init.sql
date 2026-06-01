-- Ch3 체크포인트 — Flyway 최초 마이그레이션
-- 한 번 적용된 V 파일은 수정 금지! 변경은 V2__*.sql 새 파일로.

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    price       INT NOT NULL CHECK (price >= 0),
    category    VARCHAR(50) NOT NULL,
    stock       INT NOT NULL DEFAULT 0
);

-- 시드 데이터 (참고용 product 슬라이스 동작 확인)
INSERT INTO products (name, price, category, stock) VALUES
    ('오버사이즈 후드', 59000, 'outer', 12),
    ('베이직 티셔츠', 19000, 'top', 50),
    ('와이드 슬랙스', 49000, 'bottom', 20),
    ('울 코트', 159000, 'outer', 5),
    ('크롭 니트', 39000, 'top', 0);

-- TODO(Ch3): 이름 검색 성능을 위한 인덱스를 V2__add_index.sql 로 추가하고
--            EXPLAIN ANALYZE 로 Seq Scan → Index Scan 변화를 관찰하세요.
--   예) CREATE INDEX idx_products_name_lower ON products (LOWER(name));

-- TODO(Ch2): orders / order_items / reviews 테이블을 V2 또는 별도 마이그레이션으로 추가
-- TODO(Ch4): users 테이블 (email UNIQUE, password_hash) 추가
