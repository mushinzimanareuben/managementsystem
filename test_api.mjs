import http from 'http';

const BASE = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseData) });
        } catch {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const tests = [];
let pass = 0;
let fail = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// --- Tests ---
let adminToken = null;

test('GET /api/health → 200 healthy', async () => {
  const res = await request('GET', '/health');
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.status === 'healthy', 'Expected status=healthy');
});

test('POST /api/auth/login (admin) → 200 with JWT', async () => {
  const res = await request('POST', '/auth/login', {
    email: 'mushinzimananorbert3@gmail.com',
    password: 'norbert@123'
  });
  assert(res.status === 200, `Expected 200, got ${res.status} – ${JSON.stringify(res.body)}`);
  assert(res.body.token, 'Expected JWT token in response');
  assert(res.body.role === 'admin', `Expected role=admin, got ${res.body.role}`);
  adminToken = res.body.token;
});

test('POST /api/auth/login (bad credentials) → 401', async () => {
  const res = await request('POST', '/auth/login', {
    email: 'nobody@nope.com',
    password: 'wrongpassword'
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

test('GET /api/auth/me → 200 with admin profile', async () => {
  const res = await request('GET', '/auth/me', null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.role === 'admin', `Expected role=admin`);
});

test('GET /api/jobs → 200 array', async () => {
  const res = await request('GET', '/jobs');
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(Array.isArray(res.body), 'Expected array response');
});

test('POST /api/jobs (admin) → 201 creates job', async () => {
  const res = await request('POST', '/jobs', {
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Remote / London',
    type: 'Full-time',
    description: 'We are seeking an experienced React developer to join our growing product team.',
    requirements: 'Min 4 years React experience. TypeScript proficiency. Strong problem solving skills.',
    salaryRange: '$85,000 - $115,000',
    status: 'open'
  }, adminToken);
  assert(res.status === 201, `Expected 201, got ${res.status} – ${JSON.stringify(res.body)}`);
  assert(res.body.title === 'Senior React Developer', 'Job title mismatch');
});

test('POST /api/jobs (no auth) → 401', async () => {
  const res = await request('POST', '/jobs', {
    title: 'Unauthorized Job',
    department: 'HR',
    location: 'Unknown',
    type: 'Full-time',
    description: 'test',
    requirements: 'test',
    status: 'open'
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

test('GET /api/analytics/dashboard (admin) → 200 with metrics', async () => {
  const res = await request('GET', '/analytics/dashboard', null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.metrics !== undefined, 'Expected metrics in response');
  assert(typeof res.body.metrics.totalEmployees === 'number', 'Expected totalEmployees number');
});

test('GET /api/employees (admin) → 200 with employees list', async () => {
  const res = await request('GET', '/employees', null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(Array.isArray(res.body.employees), 'Expected employees array');
  assert(res.body.employees.length >= 1, 'Expected at least 1 seeded employee');
});

test('GET /api/ads → 200 array (public)', async () => {
  const res = await request('GET', '/ads');
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(Array.isArray(res.body), 'Expected array');
});

test('POST /api/submissions (contact form) → 201', async () => {
  const res = await request('POST', '/submissions', {
    type: 'customer_info',
    data: {
      name: 'John Test',
      email: 'john@test.com',
      subject: 'API Test Inquiry',
      message: 'This is an automated API validation test submission.'
    }
  });
  assert(res.status === 201, `Expected 201, got ${res.status} – ${JSON.stringify(res.body)}`);
  assert(res.body.message, 'Expected success message');
});

test('GET /api/export/employees/excel (query token) → 200 Excel file', async () => {
  const res = await request('GET', `/export/employees/excel?token=${adminToken}`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

test('GET /api/export/employees/pdf (query token) → 200 PDF file', async () => {
  const res = await request('GET', `/export/employees/pdf?token=${adminToken}`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

test('GET /api/export/submissions/excel (query token) → 200 Excel file', async () => {
  const res = await request('GET', `/export/submissions/excel?token=${adminToken}`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

// --- New Features Tests ---
let employeeToken = null;
let employeeId = null;
let taskId = null;

test('POST /api/employees (admin) → 201 creates employee & user account', async () => {
  const res = await request('POST', '/employees', {
    fullName: 'Test Employee One',
    email: 'employee_test_email@example.com',
    phoneNumber: '+250785000000',
    position: 'Quality Analyst',
    department: 'Engineering',
    salary: 50000,
    address: 'Kigali, Rwanda',
    status: 'active'
  }, adminToken);
  assert(res.status === 201, `Expected 201, got ${res.status} – ${JSON.stringify(res.body)}`);
  employeeId = res.body.id;
  assert(employeeId, 'Expected employee ID in response');
});

test('POST /api/auth/login (employee) → 200 with JWT', async () => {
  const res = await request('POST', '/auth/login', {
    email: 'employee_test_email@example.com',
    password: 'Employee123!'
  });
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  employeeToken = res.body.token;
});

test('POST /api/tasks (admin) → 201 assigns task to employee', async () => {
  const res = await request('POST', '/tasks', {
    title: 'Validate SCMS API Endpoints',
    description: 'Ensure all tests pass and audit logging works.',
    dueDate: '2026-06-15',
    assignedTo: employeeId
  }, adminToken);
  assert(res.status === 201, `Expected 201, got ${res.status}`);
  taskId = res.body.id;
  assert(taskId, 'Expected task ID in response');
  assert(res.body.status === 'pending', 'Expected default status pending');
});

test('GET /api/tasks (employee) → 200 with paginated tasks', async () => {
  const res = await request('GET', '/tasks?page=1&limit=5', null, employeeToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(Array.isArray(res.body.tasks), 'Expected tasks array');
  assert(res.body.tasks.length === 1, `Expected 1 task, got ${res.body.tasks.length}`);
  assert(res.body.totalTasks === 1, `Expected totalTasks 1, got ${res.body.totalTasks}`);
});

test('PUT /api/tasks/:id (employee status only) → 200 updates task status', async () => {
  const res = await request('PUT', `/tasks/${taskId}`, {
    status: 'in_progress'
  }, employeeToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.status === 'in_progress', 'Expected updated status to be in_progress');
});

test('PUT /api/tasks/:id (employee try update title) → 200 updates status only', async () => {
  const res = await request('PUT', `/tasks/${taskId}`, {
    title: 'Hack Title Attempt',
    status: 'completed'
  }, employeeToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.status === 'completed', 'Expected status update');
  assert(res.body.title === 'Validate SCMS API Endpoints', 'Employee should not be able to modify title');
});

test('GET /api/logs (admin) → 200 system audit logs', async () => {
  const res = await request('GET', '/logs?page=1&limit=10', null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(Array.isArray(res.body.logs), 'Expected logs array');
  assert(res.body.totalLogs >= 3, `Expected at least 3 logs, got ${res.body.totalLogs}`);
});

test('GET /api/jobs (with pagination) → 200 paginated jobs', async () => {
  const res = await request('GET', '/jobs?page=1&limit=1');
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.jobs !== undefined, 'Expected jobs wrapper object');
  assert(Array.isArray(res.body.jobs), 'Expected jobs array');
  assert(res.body.currentPage === 1, 'Expected current page 1');
});

test('GET /api/submissions (with pagination) → 200 paginated submissions', async () => {
  const res = await request('GET', '/submissions?page=1&limit=5', null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(res.body.submissions !== undefined, 'Expected submissions wrapper');
  assert(res.body.currentPage === 1, 'Expected current page 1');
});

test('CLEANUP: DELETE /api/employees/:id (admin) → 200', async () => {
  const res = await request('DELETE', `/employees/${employeeId}`, null, adminToken);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
});

// --- Runner ---
async function run() {
  console.log('\n🔬 SCMS API Validation Tests\n' + '─'.repeat(50));

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  ✅ PASS  ${name}`);
      pass++;
    } catch (err) {
      console.log(`  ❌ FAIL  ${name}`);
      console.log(`         ${err.message}`);
      fail++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${pass} passed, ${fail} failed out of ${tests.length} tests`);

  if (fail === 0) {
    console.log('🎉 All API tests passed! System is fully operational.\n');
  } else {
    console.log('⚠️  Some tests failed. Review output above.\n');
  }

  process.exit(fail > 0 ? 1 : 0);
}

run();
