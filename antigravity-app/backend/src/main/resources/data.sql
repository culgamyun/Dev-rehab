-- dev 프로파일(H2) 전용 시드. (sql.init.mode=embedded → H2에서만 실행, Postgres는 Flyway V1이 시드)
INSERT INTO products (name, price, category, stock) VALUES ('오버사이즈 후드', 59000, 'outer', 12);
INSERT INTO products (name, price, category, stock) VALUES ('베이직 티셔츠', 19000, 'top', 50);
INSERT INTO products (name, price, category, stock) VALUES ('와이드 슬랙스', 49000, 'bottom', 20);
INSERT INTO products (name, price, category, stock) VALUES ('울 코트', 159000, 'outer', 5);
INSERT INTO products (name, price, category, stock) VALUES ('크롭 니트', 39000, 'top', 0);
