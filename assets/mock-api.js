/**
 * Antigravity Fashion Mock API Engine (mock-api.js)
 * --------------------------------------------------
 * [Visual Data Flow Chart]
 * 
 * 1. Read/Write Flow:
 *    [HTML / JS Component]
 *           │   ▲
 *           │   │  (Promise with 200ms Simulated Delay)
 *           ▼   │
 *     [mockApi Interceptor] ─── (Get / Update JSON String) ───► [localStorage: 'mockDatabase']
 * 
 * 2. Real-time WebSocket Flow:
 *    [POST /api/orders]  ───►  [Push Order & Reduce Stock]
 *                                     │
 *                                     ▼  (Trigger STOMP Event)
 *    [toastNotify()]     ◄───  [Broadcast to WS Listeners] ◄─── [mockApi.ws('/ws/orders')]
 */

const MOCK_DB_VERSION = "1.0.0";
const DB_STORAGE_KEY = "antigravity_mock_database";
const VERSION_KEY = "antigravity_mock_db_version";

// 전역 웹소켓 이벤트 리스너 저장소
const wsListeners = new Set();

/**
 * 1. 로컬스토리지 데이터베이스 안전 초기화 (Seed Data)
 */
function initializeMockDatabase(forceReset = false) {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const storedData = localStorage.getItem(DB_STORAGE_KEY);

  // 스키마 버전이 다르거나 데이터가 아예 없을 때, 혹은 강제 리셋 버튼 클릭 시
  if (forceReset || !storedData || storedVersion !== MOCK_DB_VERSION) {
    console.log("Initializing database from seed mock-data.json...");
    
    // 로컬 웹 서버로부터 오리지널 JSON을 비동기로 로드하여 시딩 진행
    return fetch("assets/mock-data.json")
      .then(res => {
        if (!res.ok) throw new Error("Seed data fetch failed. Check local server CORS config.");
        return res.json();
      })
      .then(seedData => {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seedData));
        localStorage.setItem(VERSION_KEY, MOCK_DB_VERSION);
        console.log(`Database Seeded Successfully! Version: ${MOCK_DB_VERSION}`);
        return seedData;
      })
      .catch(err => {
        console.error("Critical error seeding Mock Database:", err);
      });
  }
  return Promise.resolve(JSON.parse(storedData));
}

// 스크립트 로드 시 즉시 백그라운드 DB 동화 수행
initializeMockDatabase();

/**
 * 2. 로컬스토리지 읽기 / 쓰기 헬퍼 함수
 */
function getDB() {
  const data = localStorage.getItem(DB_STORAGE_KEY);
  return data ? JSON.parse(data) : { products: [], users: [], orders: [], reviews: [] };
}

function saveDB(db) {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

/**
 * 3. 지연 응답 흉내를 내기 위한 헬퍼 Promise
 */
function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 4. mockApi 인터페이스 정의 (GET, POST, PUT, DELETE, WebSocket)
 */
const mockApi = {
  /**
   * GET 요청 처리
   * @param {string} url - API 경로 (예: '/api/products', '/api/products/1')
   */
  get(url) {
    return delay(200 + Math.random() * 150).then(() => {
      const db = getDB();
      const parsedUrl = new URL(url, "http://localhost"); // 파라미터 파싱용
      const path = parsedUrl.pathname;
      const params = parsedUrl.searchParams;

      // 1. 상품 목록 조회 (카테고리 필터링 포함)
      if (path === "/api/products") {
        const category = params.get("category");
        if (category && category !== "all") {
          return db.products.filter(p => p.category === category);
        }
        return db.products;
      }

      // 2. 단일 상품 상세 조회 (/api/products/1)
      if (path.startsWith("/api/products/")) {
        const id = parseInt(path.split("/").pop());
        const product = db.products.find(p => p.id === id);
        if (!product) return { status: 404, message: "상품을 찾을 수 없습니다." };
        
        // 해당 상품의 리뷰를 동적으로 연동하여 합산 전달 (JPA 영속성 매핑 개념 모방)
        const productReviews = db.reviews.filter(r => r.productId === id);
        return { ...product, reviews: productReviews };
      }

      // 3. 주문 내역 전체 조회
      if (path === "/api/orders") {
        return db.orders;
      }

      // 4. 리뷰 전체 조회
      if (path === "/api/reviews") {
        return db.reviews;
      }

      return { status: 404, message: "Endpoint Not Found" };
    });
  },

  /**
   * POST 요청 처리 (주문 생성, 로그인, 리뷰 작성 등)
   * @param {string} url - API 경로
   * @param {object} body - 전송할 JSON 바디 객체
   */
  post(url, body) {
    return delay(250 + Math.random() * 150).then(() => {
      const db = getDB();

      // 1. 주문 접수 처리 (REST POST /api/orders)
      if (url === "/api/orders") {
        const { userId, items } = body;
        if (!items || items.length === 0) {
          return { status: 400, message: "장바구니가 비어 있습니다." };
        }

        // 재고 검증 및 감소 연산 진행 (트랜잭션 데이터 무결성 보존 모사)
        for (const item of items) {
          const product = db.products.find(p => p.id === item.productId);
          if (!product) {
            return { status: 400, message: `상품 ID ${item.productId}가 존재하지 않습니다.` };
          }
          if (product.stock < item.qty) {
            return { status: 400, message: `[재고부족] ${product.name}의 구매수량이 현재 재고(${product.stock}개)보다 많습니다.` };
          }
          // 실제 재고 감산
          product.stock -= item.qty;
        }

        // 새 가짜 주문서 객체 모델 생성
        const newOrderId = db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1001;
        const newOrder = {
          id: newOrderId,
          userId: userId || 1,
          items: items.map(item => {
            const product = db.products.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              name: product.name,
              qty: item.qty,
              price: product.price
            };
          }),
          status: "주문완료",
          total: items.reduce((sum, item) => {
            const product = db.products.find(p => p.id === item.productId);
            return sum + (product.price * item.qty);
          }, 0),
          createdAt: new Date().toISOString()
        };

        db.orders.unshift(newOrder); // 최신 주문이 위로 오도록 앞에 추가
        saveDB(db);

        // 🔔 소켓 브로드캐스팅 발송 시뮬레이션
        wsListeners.forEach(listener => {
          listener({
            event: "NEW_ORDER",
            message: `새로운 주문이 접수되었습니다! (주문번호: #${newOrderId})`,
            data: newOrder
          });
        });

        return { status: 201, success: true, order: newOrder };
      }

      // 2. JWT 로그인 시뮬레이션 (REST POST /api/auth/login)
      if (url === "/api/auth/login") {
        const { email } = body;
        if (!email || !email.includes("@")) {
          return { status: 400, message: "올바른 이메일 주소를 입력해 주세요." };
        }
        
        // 김풀스택 기본 유저 가져오기
        const user = db.users.find(u => u.email === email) || { id: 1, email, name: "비회원고객", grade: "BASIC" };
        
        // 가짜 JWT 발급 (Header.Payload.Signature 인코딩 구조 구현)
        // 한글 이름 등 비(非)Latin1 문자가 payload에 들어가므로 UTF-8 안전 base64 사용 (TextEncoder 기반)
        const b64utf8 = (str) => {
          const bytes = new TextEncoder().encode(str);
          let bin = "";
          for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          return btoa(bin);
        };
        const fakeHeader = b64utf8(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const fakePayload = b64utf8(JSON.stringify({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.grade === "VIP" ? "ROLE_VIP" : "ROLE_USER",
          exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 유효
        }));
        const fakeSignature = "antigravity_secret_signature_key_2026";
        const token = `${fakeHeader}.${fakePayload}.${fakeSignature}`;

        return {
          status: 200,
          success: true,
          token,
          user
        };
      }

      // 3. 상품 리뷰 작성 (REST POST /api/reviews)
      if (url === "/api/reviews") {
        const { productId, rating, content, userName } = body;
        if (!productId || !rating || !content) {
          return { status: 400, message: "리뷰 입력 정보가 부족합니다." };
        }

        const product = db.products.find(p => p.id === productId);
        if (!product) return { status: 404, message: "상품이 존재하지 않습니다." };

        const newReviewId = db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id)) + 1 : 1;
        const newReview = {
          id: newReviewId,
          productId,
          userId: 1,
          userName: userName || "익명고객",
          rating: parseInt(rating),
          content,
          createdAt: new Date().toISOString()
        };

        db.reviews.unshift(newReview);

        // 상품 평점 업데이트 연산 (JPA 연동 영속성 전이 유사 작동)
        const productReviews = db.reviews.filter(r => r.productId === productId);
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = parseFloat(avgRating.toFixed(1));

        saveDB(db);

        return { status: 201, success: true, review: newReview };
      }

      return { status: 404, message: "Endpoint Not Found" };
    });
  },

  /**
   * WebSocket 구독 채널 시뮬레이터 (STOMP Broker 모방)
   * @param {string} destination - 구독 경로 (예: '/topic/orders')
   * @param {function} callback - 메시지 수신 시 실행할 콜백 함수
   */
  ws(destination, callback) {
    if (destination === "/topic/orders") {
      wsListeners.add(callback);
      console.log(`[WebSocket Broker] Subscribed to ${destination} successfully.`);
      
      // 반환값으로 소켓 연결 해제(unsubscribe) 함수 제공
      return () => {
        wsListeners.delete(callback);
        console.log(`[WebSocket Broker] Unsubscribed from ${destination}.`);
      };
    }
  },

  /**
   * 데이터베이스 강제 리셋 & 리시딩 처리
   */
  resetDatabase() {
    return initializeMockDatabase(true).then(() => {
      // 갱신 이벤트를 전역으로 전파하여 화면에 떠있는 정보 리프레시 처리 유도
      const event = new CustomEvent("mockDbReset");
      window.dispatchEvent(event);
      console.log("Mock Database reset completed successfully!");
      return { success: true, message: "데이터베이스가 성공적으로 리셋되었습니다." };
    });
  }
};

// 모듈로 분리하기 전 브라우저 윈도우 객체에 전역 등록하여 HTML 스크립트에서 다이렉트 접근 허용
window.mockApi = mockApi;
window.initializeMockDatabase = initializeMockDatabase;
