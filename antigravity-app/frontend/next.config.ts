import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 컨테이너 배포 시 경량 standalone 출력 (Ch8)
  output: "standalone",

  // TODO(Ch5): React Compiler 체험 시 활성화 (현재 Next.js에선 experimental, Babel 기반이라 빌드 느려짐)
  // experimental: { reactCompiler: true },
};

export default nextConfig;
