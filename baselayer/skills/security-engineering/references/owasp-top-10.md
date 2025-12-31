# OWASP Top 10 (2021) — Detailed Reference

Comprehensive breakdown of each OWASP Top 10 category with CWE mappings, vulnerability patterns, and remediation strategies.

## A01:2021 – Broken Access Control

Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data.

### Common Weaknesses

- **Missing Function Level Access Control** — users can access admin functions
- **Missing Resource Level Access Control (IDOR)** — users can access others' resources
- **CORS Misconfiguration** — overly permissive cross-origin policies
- **Force Browsing** — accessing pages/resources by URL guessing
- **Metadata Manipulation** — JWT/cookie tampering to elevate privileges
- **POST-based CSRF** — state-changing operations without CSRF protection

### CWE Mappings

- CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
- CWE-201: Insertion of Sensitive Information Into Sent Data
- CWE-352: Cross-Site Request Forgery (CSRF)
- CWE-359: Exposure of Private Personal Information to an Unauthorized Actor
- CWE-377: Insecure Temporary File
- CWE-402: Transmission of Private Resources into a New Sphere
- CWE-425: Direct Request (Forced Browsing)
- CWE-639: Authorization Bypass Through User-Controlled Key
- CWE-759: Use of a One-Way Hash without a Salt
- CWE-918: Server-Side Request Forgery (SSRF)
- CWE-1275: Sensitive Cookie with Improper SameSite Attribute

### Vulnerability Patterns

**IDOR (Insecure Direct Object Reference)**:

```typescript
// VULNERABLE — sequential IDs, no ownership check
GET /api/invoices/1001
{
  "invoice_id": 1001,
  "customer_id": 42,
  "amount": 1500
}

// ATTACK — iterate through IDs
GET /api/invoices/1002  // Access someone else's invoice
GET /api/invoices/1003
GET /api/invoices/1004
```

**Remediation**:

```typescript
// SECURE — verify ownership before returning
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await db.getInvoice(req.params.id);

  if (!invoice) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Verify user owns resource or is admin
  if (invoice.customerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(invoice);
});

// BETTER — use UUIDs instead of sequential IDs
const invoiceId = crypto.randomUUID(); // Non-guessable
```

**Missing Function Level Access Control**:

```typescript
// VULNERABLE — client-side check only
function AdminPanel() {
  if (!user.isAdmin) {
    return <div>Access Denied</div>;
  }
  return <AdminDashboard />;
}

// Attacker can still call API directly:
fetch('/api/admin/users').then(r => r.json())  // No server-side check!
```

**Remediation**:

```typescript
// SECURE — enforce on server
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  // Server validates role on every request
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const users = await db.getAllUsers();
  res.json(users);
});

// Middleware
function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
```

**CORS Misconfiguration**:

```typescript
// VULNERABLE — allows all origins
app.use(cors({
  origin: '*',
  credentials: true  // Allows any site to make authenticated requests!
}));
```

**Remediation**:

```typescript
// SECURE — explicit allowlist
const allowedOrigins = [
  'https://app.example.com',
  'https://admin.example.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## A02:2021 – Cryptographic Failures

Previously known as Sensitive Data Exposure. Focuses on failures related to cryptography which often lead to exposure of sensitive data.

### Common Weaknesses

- **Transmitting data in clear text** — HTTP instead of HTTPS
- **Old/weak cryptographic algorithms** — MD5, SHA1, DES
- **Default/weak keys** — hardcoded or predictable
- **Missing encryption at rest** — sensitive data stored unencrypted
- **Improper certificate validation** — accepting self-signed certs in production
- **Insufficient entropy** — predictable random numbers

### CWE Mappings

- CWE-259: Use of Hard-coded Password
- CWE-327: Use of a Broken or Risky Cryptographic Algorithm
- CWE-331: Insufficient Entropy

### Vulnerability Patterns

**Weak Hashing Algorithm**:

```typescript
// VULNERABLE — MD5 is broken
const hash = crypto.createHash('md5').update(password).digest('hex');

// VULNERABLE — SHA1 is deprecated
const hash = crypto.createHash('sha1').update(password).digest('hex');

// VULNERABLE — no salt (rainbow tables)
const hash = crypto.createHash('sha256').update(password).digest('hex');
```

**Remediation**:

```typescript
// SECURE — bcrypt with sufficient cost
import bcrypt from 'bcrypt';

const saltRounds = 12;  // Minimum 10, increase as hardware improves
const hash = await bcrypt.hash(password, saltRounds);

// Verification
const isValid = await bcrypt.compare(inputPassword, storedHash);

// ALTERNATIVE — Argon2 (winner of Password Hashing Competition)
import argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,  // Resistant to GPU and side-channel attacks
  memoryCost: 2 ** 16,    // 64 MiB
  timeCost: 3,
  parallelism: 1,
});
```

**Hardcoded Secrets**:

```typescript
// VULNERABLE — secrets in code
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';
const JWT_SECRET = 'mysecret';

// Committed to Git — now in history forever!
```

**Remediation**:

```typescript
// SECURE — environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate at startup
if (!API_KEY || !DB_PASSWORD || !JWT_SECRET) {
  throw new Error('Missing required environment variables');
}

// .env (add to .gitignore!)
API_KEY=sk-real-key-here
DB_PASSWORD=strong-password-here
JWT_SECRET=long-random-string-here

// .env.example (commit this)
API_KEY=your_api_key_here
DB_PASSWORD=your_db_password_here
JWT_SECRET=your_jwt_secret_here
```

**Weak Encryption Algorithm**:

```typescript
// VULNERABLE — DES is broken
const cipher = crypto.createCipher('des', key);

// VULNERABLE — ECB mode (patterns leak)
const cipher = crypto.createCipheriv('aes-256-ecb', key, null);

// VULNERABLE — no authentication (malleable)
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
```

**Remediation**:

```typescript
// SECURE — AES-256-GCM (authenticated encryption)
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);  // 256 bits
const iv = crypto.randomBytes(16);   // 128 bits

// Encryption
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(plaintext, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

// Store: iv + authTag + encrypted

// Decryption
const decipher = crypto.createDecipheriv(algorithm, key, iv);
decipher.setAuthTag(authTag);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

**Insufficient Entropy**:

```typescript
// VULNERABLE — predictable
const sessionId = Math.random().toString(36);
const resetToken = Date.now().toString(36);
const apiKey = userId + '-' + Math.floor(Math.random() * 1000000);
```

**Remediation**:

```typescript
// SECURE — cryptographically secure random
const sessionId = crypto.randomBytes(32).toString('hex');  // 64 hex chars
const resetToken = crypto.randomBytes(32).toString('base64url');
const apiKey = crypto.randomBytes(24).toString('base64url');

// For UUIDs
const uuid = crypto.randomUUID();  // UUIDv4
```

---

## A03:2021 – Injection

Application is vulnerable to injection when user-supplied data is not validated, filtered, or sanitized by the application.

### Common Weaknesses

- **SQL Injection** — malicious SQL in queries
- **NoSQL Injection** — malicious queries in MongoDB, etc.
- **OS Command Injection** — executing shell commands
- **LDAP Injection** — malicious LDAP queries
- **XPath Injection** — malicious XPath queries
- **ORM Injection** — unsafe ORM query construction

### CWE Mappings

- CWE-20: Improper Input Validation
- CWE-74: Improper Neutralization of Special Elements in Output
- CWE-75: Failure to Sanitize Special Elements into a Different Plane
- CWE-77: Improper Neutralization of Special Elements used in a Command
- CWE-78: Improper Neutralization of Special Elements used in an OS Command
- CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)
- CWE-80: Improper Neutralization of Script-Related HTML Tags
- CWE-83: Improper Neutralization of Script in Attributes
- CWE-89: Improper Neutralization of Special Elements used in an SQL Command
- CWE-91: XML Injection
- CWE-93: Improper Neutralization of CRLF Sequences
- CWE-94: Improper Control of Generation of Code
- CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code
- CWE-96: Improper Neutralization of Directives in Statically Saved Code
- CWE-97: Improper Neutralization of Server-Side Includes
- CWE-183: Permissive List of Allowed Inputs
- CWE-184: Incomplete List of Disallowed Inputs

### Vulnerability Patterns

**SQL Injection**:

```sql
-- VULNERABLE — string concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}' AND password = '${userPassword}'`;

-- ATTACK
userEmail: admin@example.com'--
userPassword: anything

-- RESULTS IN
SELECT * FROM users WHERE email = 'admin@example.com'--' AND password = 'anything'
-- Comment removes password check!

-- ATTACK 2 — data exfiltration
userEmail: ' UNION SELECT password FROM users--

-- ATTACK 3 — blind SQL injection
userEmail: ' OR 1=1--
```

**Remediation**:

```typescript
// SECURE — parameterized queries (prepared statements)
const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
const [rows] = await db.execute(query, [userEmail, passwordHash]);

// PostgreSQL — numbered placeholders
const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
const result = await pool.query(query, [userEmail, passwordHash]);

// ORM — use safe methods
const user = await User.findOne({
  where: {
    email: userEmail,
    password: passwordHash,
  },
});

// NEVER — string interpolation or concatenation in SQL
```

**NoSQL Injection**:

```javascript
// VULNERABLE — object injection
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.collection('users').findOne({
    email: email,
    password: password,
  });
});

// ATTACK — bypass authentication
POST /login
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}

// Query becomes: find where email > "" AND password > ""
// Returns first user!
```

**Remediation**:

```typescript
// SECURE — type validation
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Ensure inputs are strings
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const user = await db.collection('users').findOne({
    email: email,
    password: await hashPassword(password),
  });
});

// BETTER — schema validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { email, password } = result.data;
  // Now guaranteed to be strings
});
```

**OS Command Injection**:

```typescript
// VULNERABLE — user input in shell command
const filename = req.query.file;
exec(`convert ${filename} output.png`, (err, stdout) => {
  // Process output
});

// ATTACK
?file=; rm -rf /

// RESULTS IN
convert ; rm -rf / output.png
// Executes rm -rf /!
```

**Remediation**:

```typescript
// SECURE — use parameterized API
import { execFile } from 'child_process';

const filename = req.query.file;

// Validate filename
if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
  return res.status(400).json({ error: 'Invalid filename' });
}

// Use execFile with array arguments (no shell)
execFile('convert', [filename, 'output.png'], (err, stdout) => {
  if (err) {
    logger.error('Conversion failed', err);
    return res.status(500).json({ error: 'Conversion failed' });
  }
  // Process output
});

// BETTER — use library instead of shell command
import sharp from 'sharp';

await sharp(filename).toFile('output.png');
```

**XSS (Cross-Site Scripting)**:

```html
<!-- VULNERABLE — direct HTML insertion -->
<div id="greeting"></div>
<script>
  const name = new URLSearchParams(window.location.search).get('name');
  document.getElementById('greeting').innerHTML = `Hello ${name}!`;
</script>

<!-- ATTACK -->
?name=<img src=x onerror=alert(document.cookie)>

<!-- RESULTS IN -->
<div id="greeting">Hello <img src=x onerror=alert(document.cookie)>!</div>
<!-- Executes JavaScript! -->
```

**Remediation**:

```html
<!-- SECURE — use textContent -->
<div id="greeting"></div>
<script>
  const name = new URLSearchParams(window.location.search).get('name');
  document.getElementById('greeting').textContent = `Hello ${name}!`;
</script>

<!-- For rich content — sanitize -->
<div id="content"></div>
<script>
  import DOMPurify from 'dompurify';

  const userContent = getUserContent();
  const clean = DOMPurify.sanitize(userContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
  document.getElementById('content').innerHTML = clean;
</script>
```

---

## A04:2021 – Insecure Design

New category focusing on risks related to design and architectural flaws. Requires threat modeling, secure design patterns, and reference architectures.

### Common Weaknesses

- **Missing Security Controls** — no rate limiting, no CAPTCHA
- **Business Logic Flaws** — discount code stacking, negative quantities
- **Insufficient Isolation** — multi-tenant data leakage
- **Weak Security Architecture** — no defense in depth

### CWE Mappings

- CWE-209: Generation of Error Message Containing Sensitive Information
- CWE-256: Plaintext Storage of a Password
- CWE-257: Storing Passwords in a Recoverable Format
- CWE-266: Incorrect Privilege Assignment
- CWE-269: Improper Privilege Management
- CWE-280: Improper Handling of Insufficient Permissions
- CWE-311: Missing Encryption of Sensitive Data
- CWE-312: Cleartext Storage of Sensitive Information
- CWE-313: Cleartext Storage in a File or on Disk
- CWE-316: Cleartext Storage of Sensitive Information in Memory
- CWE-419: Unprotected Primary Channel
- CWE-430: Deployment of Wrong Handler
- CWE-434: Unrestricted Upload of File with Dangerous Type
- CWE-444: Inconsistent Interpretation of HTTP Requests

### Vulnerability Patterns

**Missing Rate Limiting**:

```typescript
// VULNERABLE — no rate limiting
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: generateToken(user) });
});

// ATTACK — brute force attack
// Try thousands of passwords per second
```

**Remediation**:

```typescript
// SECURE — rate limiting with exponential backoff
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts, please try again later',
    });
  },
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // Authentication logic
});

// BETTER — account lockout after failed attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const account = await getAccount(email);

  // Check if locked
  if (account.lockedUntil && account.lockedUntil > Date.now()) {
    return res.status(429).json({
      error: 'Account locked. Try again later.',
    });
  }

  const user = await authenticateUser(email, password);

  if (!user) {
    // Increment failed attempts
    account.failedAttempts += 1;

    if (account.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      account.lockedUntil = Date.now() + LOCKOUT_DURATION;
      await saveAccount(account);
      return res.status(429).json({ error: 'Account locked' });
    }

    await saveAccount(account);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset on success
  account.failedAttempts = 0;
  account.lockedUntil = null;
  await saveAccount(account);

  res.json({ token: generateToken(user) });
});
```

**Business Logic Flaw — Race Condition**:

```typescript
// VULNERABLE — time-of-check to time-of-use
app.post('/api/transfer', async (req, res) => {
  const { from, to, amount } = req.body;

  const balance = await getBalance(from);

  if (balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // RACE CONDITION — balance could be spent between check and update
  await deduct(from, amount);
  await credit(to, amount);

  res.json({ success: true });
});

// ATTACK — send two transfer requests simultaneously
// Both pass balance check before either updates
```

**Remediation**:

```typescript
// SECURE — atomic transaction
app.post('/api/transfer', async (req, res) => {
  const { from, to, amount } = req.body;

  const result = await db.transaction(async (trx) => {
    // Lock row for update
    const account = await trx('accounts')
      .where({ id: from })
      .forUpdate()
      .first();

    if (account.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Atomic debit/credit
    await trx('accounts')
      .where({ id: from })
      .decrement('balance', amount);

    await trx('accounts')
      .where({ id: to })
      .increment('balance', amount);

    return { success: true };
  });

  res.json(result);
});

// Database-level constraint
ALTER TABLE accounts ADD CONSTRAINT positive_balance CHECK (balance >= 0);
```

---

## A05:2021 – Security Misconfiguration

### Common Weaknesses

- **Unnecessary features enabled** — debug mode in production
- **Default accounts** — admin/admin still active
- **Verbose error messages** — stack traces to users
- **Missing security headers** — no CSP, X-Frame-Options
- **Outdated software** — old framework versions

### CWE Mappings

- CWE-2: 7PK - Environment
- CWE-11: ASP.NET Misconfiguration
- CWE-13: ASP.NET Misconfiguration: Password in Configuration File
- CWE-15: External Control of System or Configuration Setting
- CWE-16: Configuration
- CWE-260: Password in Configuration File
- CWE-315: Cleartext Storage of Sensitive Information in a Cookie
- CWE-520: .NET Misconfiguration
- CWE-526: Exposure of Sensitive Information Through Environmental Variables
- CWE-537: Java Runtime Error Message Containing Sensitive Information
- CWE-541: Inclusion of Sensitive Information in an Include File
- CWE-547: Use of Hard-coded, Security-relevant Constants
- CWE-611: Improper Restriction of XML External Entity Reference
- CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute
- CWE-756: Missing Custom Error Page
- CWE-776: Improper Restriction of Recursive Entity References in DTDs

### Remediation

**Security Headers**:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

## A06:2021 – Vulnerable and Outdated Components

### Common Weaknesses

- **Known vulnerabilities** — using libs with CVEs
- **Outdated dependencies** — years-old versions
- **No security updates** — never updating packages
- **Unused dependencies** — unnecessary attack surface

### CWE Mappings

- CWE-1035: Using Components with Known Vulnerabilities
- CWE-1104: Use of Unmaintained Third Party Components

### Remediation

```bash
# Audit dependencies
npm audit
npm audit fix

# Update outdated packages
npm outdated
npm update

# Check for known vulnerabilities
npx snyk test

# Automated dependency updates
# Use Dependabot/Renovate for automated PRs
```

---

## A07:2021 – Identification and Authentication Failures

### Common Weaknesses

- **Weak passwords** — no complexity requirements
- **Brute force** — no rate limiting
- **Session fixation** — accepting user-supplied session IDs
- **Credential stuffing** — no breach detection
- **Missing MFA** — single factor only

### CWE Mappings

- CWE-287: Improper Authentication
- CWE-288: Authentication Bypass Using an Alternate Path or Channel
- CWE-290: Authentication Bypass by Spoofing
- CWE-294: Authentication Bypass by Capture-replay
- CWE-295: Improper Certificate Validation
- CWE-297: Improper Validation of Certificate with Host Mismatch
- CWE-300: Channel Accessible by Non-Endpoint
- CWE-302: Authentication Bypass by Assumed-Immutable Data
- CWE-304: Missing Critical Step in Authentication
- CWE-306: Missing Authentication for Critical Function
- CWE-307: Improper Restriction of Excessive Authentication Attempts
- CWE-346: Origin Validation Error
- CWE-384: Session Fixation
- CWE-521: Weak Password Requirements
- CWE-613: Insufficient Session Expiration
- CWE-640: Weak Password Recovery Mechanism for Forgotten Password
- CWE-798: Use of Hard-coded Credentials
- CWE-940: Improper Verification of Source of a Communication Channel
- CWE-1216: Lockout Mechanism Errors

### Remediation

See main SKILL.md for authentication patterns.

---

## A08:2021 – Software and Data Integrity Failures

### Common Weaknesses

- **Unsigned updates** — accepting any code update
- **Insecure deserialization** — unvalidated object deserialization
- **Missing CI/CD security** — compromised build pipeline

### CWE Mappings

- CWE-345: Insufficient Verification of Data Authenticity
- CWE-353: Missing Support for Integrity Check
- CWE-426: Untrusted Search Path
- CWE-494: Download of Code Without Integrity Check
- CWE-502: Deserialization of Untrusted Data
- CWE-565: Reliance on Cookies without Validation and Integrity Checking
- CWE-784: Reliance on Cookies without Validation and Integrity Checking in a Security Decision
- CWE-829: Inclusion of Functionality from Untrusted Control Sphere

### Vulnerability Pattern

**Insecure Deserialization**:

```typescript
// VULNERABLE — deserialize untrusted data
const userData = JSON.parse(req.cookies.user);
const obj = deserialize(req.body.data);  // Arbitrary code execution!
```

**Remediation**:

```typescript
// SECURE — validate structure
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'admin']),
});

const result = userSchema.safeParse(JSON.parse(req.cookies.user));
if (!result.success) {
  throw new Error('Invalid user data');
}
```

---

## A09:2021 – Security Logging and Monitoring Failures

### Common Weaknesses

- **Missing audit logs** — no record of critical operations
- **Insufficient log detail** — can't reconstruct attack
- **No monitoring** — logs not reviewed
- **Insecure log storage** — logs tamper-able

### CWE Mappings

- CWE-117: Improper Output Neutralization for Logs
- CWE-223: Omission of Security-relevant Information
- CWE-532: Insertion of Sensitive Information into Log File
- CWE-778: Insufficient Logging

### Remediation

```typescript
// Log security events
logger.info('User login', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString(),
});

logger.warn('Failed login attempt', {
  email: req.body.email,  // Don't log password!
  ip: req.ip,
  attempts: failedAttempts,
});

logger.error('Unauthorized access attempt', {
  userId: req.user.id,
  resource: req.path,
  method: req.method,
  ip: req.ip,
});

// NEVER log sensitive data
logger.info('User data', {
  email: user.email,
  password: '[REDACTED]',
  ssn: '[REDACTED]',
  creditCard: '[REDACTED]',
});
```

---

## A10:2021 – Server-Side Request Forgery (SSRF)

### Common Weaknesses

- **Unvalidated URLs** — fetching arbitrary URLs
- **Cloud metadata access** — accessing AWS/GCP metadata endpoints
- **Internal network scanning** — probing internal services

### CWE Mappings

- CWE-918: Server-Side Request Forgery (SSRF)

### Vulnerability Pattern

```typescript
// VULNERABLE — fetch arbitrary URL
app.get('/api/fetch', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);
  const data = await response.text();
  res.send(data);
});

// ATTACK — access cloud metadata
?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/

// ATTACK — scan internal network
?url=http://localhost:6379/  // Redis
?url=http://10.0.0.5:22/     // SSH
```

**Remediation**:

```typescript
// SECURE — allowlist of domains
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

app.get('/api/fetch', async (req, res) => {
  const url = new URL(req.query.url);

  // Validate domain
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  // Block private IPs
  const ip = await dns.resolve4(url.hostname);
  if (isPrivateIP(ip[0])) {
    return res.status(403).json({ error: 'Private IP not allowed' });
  }

  const response = await fetch(url.href);
  const data = await response.text();
  res.send(data);
});

function isPrivateIP(ip: string): boolean {
  return /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/.test(ip)
    || ip === '::1'
    || ip.startsWith('169.254.');  // Cloud metadata
}
```

---

## Quick Reference Table

| Category | Key CWEs | Top Mitigations |
|----------|----------|-----------------|
| A01 Broken Access Control | 200, 352, 639, 918 | Server-side checks, ownership validation, CSRF tokens |
| A02 Cryptographic Failures | 259, 327, 331 | TLS, bcrypt, no hardcoded secrets, crypto.randomBytes |
| A03 Injection | 20, 79, 89 | Parameterized queries, input validation, output encoding |
| A04 Insecure Design | 209, 256, 434 | Threat modeling, rate limiting, defense in depth |
| A05 Security Misconfiguration | 16, 611, 614 | Security headers, disable debug, defaults changed |
| A06 Vulnerable Components | 1035, 1104 | npm audit, Dependabot, regular updates |
| A07 Authentication Failures | 287, 307, 521, 798 | Strong passwords, MFA, rate limiting, no defaults |
| A08 Integrity Failures | 502, 494 | Verify signatures, CI/CD hardening, schema validation |
| A09 Logging Failures | 117, 532, 778 | Audit logs, monitoring, redact sensitive data |
| A10 SSRF | 918 | URL allowlist, block private IPs, validate domains |
