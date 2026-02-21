// test-setup.js
// 설치가 제대로 되었는지 확인하는 테스트 스크립트
// 사용법: node test-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 건담 데이터베이스 설치 검증 시작...\n');

let passCount = 0;
let failCount = 0;

function check(name, condition, message) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    if (message) console.log(`   → ${message}`);
    failCount++;
  }
}

// 1. Node.js 버전 확인
const nodeVersion = process.version;
const nodeVersionNum = parseInt(nodeVersion.slice(1).split('.')[0]);
check(
  'Node.js 버전',
  nodeVersionNum >= 18,
  `현재 버전: ${nodeVersion}, 필요 버전: v18 이상`
);

// 2. package.json 존재 확인
const packageJsonPath = path.join(__dirname, 'package.json');
check(
  'package.json 파일',
  fs.existsSync(packageJsonPath),
  'package.json 파일이 없습니다. frontend 폴더에서 실행하세요.'
);

// 3. node_modules 폴더 확인
const nodeModulesPath = path.join(__dirname, 'node_modules');
check(
  'node_modules 폴더',
  fs.existsSync(nodeModulesPath),
  'npm install을 먼저 실행하세요.'
);

// 4. .env.local 파일 확인
const envLocalPath = path.join(__dirname, '.env.local');
check(
  '.env.local 파일',
  fs.existsSync(envLocalPath),
  '.env.example을 복사하여 .env.local 파일을 생성하세요.'
);

// 5. .env.local 내용 확인
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  
  check(
    'NEXT_PUBLIC_SUPABASE_URL 설정',
    envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
    !envContent.includes('your-project-id'),
    'Supabase URL을 실제 값으로 변경하세요.'
  );
  
  check(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY 설정',
    envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && 
    !envContent.includes('your-anon-key'),
    'Supabase anon key를 실제 값으로 변경하세요.'
  );
}

// 6. 필수 폴더 구조 확인
const requiredDirs = [
  'src',
  'src/app',
  'src/app/api',
  'src/lib',
  'src/components',
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  check(
    `${dir} 폴더`,
    fs.existsSync(dirPath),
    `${dir} 폴더가 없습니다.`
  );
});

// 7. 필수 파일 확인
const requiredFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/types/database.ts',
  'src/lib/types/index.ts',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  check(
    file,
    fs.existsSync(filePath),
    `${file} 파일이 없습니다.`
  );
});

// 8. API Routes 확인
const apiRoutes = [
  'src/app/api/kits/route.ts',
  'src/app/api/kits/[id]/route.ts',
  'src/app/api/filters/route.ts',
  'src/app/api/suggestions/route.ts',
  'src/app/api/auth/callback/route.ts',
];

apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, route);
  check(
    route,
    fs.existsSync(routePath),
    `${route} 파일이 없습니다.`
  );
});

// 9. package.json 의존성 확인
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = packageJson.dependencies || {};
  
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
  ];
  
  requiredDeps.forEach(dep => {
    check(
      `의존성: ${dep}`,
      deps[dep] !== undefined,
      `package.json에 ${dep}가 없습니다.`
    );
  });
}

// 10. TypeScript 설정 확인
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
check(
  'tsconfig.json 파일',
  fs.existsSync(tsconfigPath),
  'tsconfig.json 파일이 없습니다.'
);

// 11. Tailwind 설정 확인
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
check(
  'tailwind.config.js 파일',
  fs.existsSync(tailwindConfigPath),
  'tailwind.config.js 파일이 없습니다.'
);

// 결과 출력
console.log('\n' + '='.repeat(50));
console.log(`✅ 성공: ${passCount}개`);
console.log(`❌ 실패: ${failCount}개`);
console.log('='.repeat(50));

if (failCount === 0) {
  console.log('\n🎉 모든 검증 통과! 이제 npm run dev를 실행하세요.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  일부 항목이 실패했습니다. 위 메시지를 확인하세요.\n');
  process.exit(1);
}
