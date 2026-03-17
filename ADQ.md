# Architecture & Design Questions

### 1. How did you structure your project and why?
The project uses a **layered architecture** with clear separation between frontend and backend. The backend follows a lightweight MVC-inspired structure without a heavy framework: `Controllers` handle HTTP concerns, `Services` contain integration logic, `Middleware` handles cross-cutting concerns (CORS, rate limiting), and `Validation` is isolated as a utility. This makes each layer independently testable and replaceable.

### 2. How did you separate business logic, API integration, and UI?
- **Business logic / validation** lives in `Validation/Validator.php` and in controller pre-processing
- **API integration** is entirely encapsulated in `Services/FastwayApiClient.php` — nothing else touches cURL or Fastway URLs
- **UI code** is the React frontend — it knows nothing about the Fastway API; it only calls our own `/api/*` endpoints

### 3. Multiple courier providers?
I would introduce a `CourierInterface` (PHP interface) with methods like `trackParcel(string $label): array` and `getQuote(QuoteRequest $request): array`. Each provider (`FastwayClient`, `CourierGuyClient`, etc.) implements this interface. A `CourierFactory` or service container resolves the correct implementation at runtime. The controllers become provider-agnostic.

### 4. Supporting future API changes with minimal code impact?
All Fastway-specific logic is isolated in `FastwayApiClient`. Endpoint paths are defined as constants in that class. A response normaliser/mapper within the same class transforms raw API responses into a consistent internal schema — so if Fastway renames a field, only the mapper changes.

### 5. Design patterns applied?
- **Front Controller** — single `public/index.php` entry point
- **Service Layer** — `FastwayApiClient` isolates all external API calls
- **Strategy / Interface pattern** — described above for multi-provider support
- **Middleware chain** — CORS and rate limiting as independent, composable middleware

### 6. Refactoring into MVC?
The current structure is already MVC-adjacent. To formalise it: add a `Models/` layer for domain objects (Parcel, Quote, Scan), introduce a DI container (e.g. PHP-DI) for dependency injection, and extract view rendering if server-side templating were needed.

---

## Security Considerations

### 7. Protecting the API key
The API key is stored exclusively as a **server-side environment variable** (`FASTWAY_API_KEY`). It is injected into the PHP backend container and never transmitted to the browser. The React frontend communicates only with `/api/*` on our own domain.

### 8. Input validation and sanitisation
- `Validator.php` enforces type, format, length, and character-set rules before any API call
- `strip_tags()` and `trim()` are applied to all string inputs
- `urlencode()` is applied before building API URLs
- Regex patterns use character whitelists (not blacklists)

### 9. Potential security risks
- API key leakage (mitigated above)
- SSRF — mitigated by only calling a fixed, controlled base URL
- Injection (SQL not applicable; XSS mitigated by React's JSX escaping and PHP's `htmlspecialchars`)
- CORS misconfig — restricted to known origin via `ALLOWED_ORIGIN`
- Rate limit abuse — file-based token bucket in `RateLimitMiddleware`
- Dependency vulnerabilities — keep `composer.lock` and `package-lock.json` current

### 10. Preventing API abuse, spam, injection
- **Rate limiting**: 30 requests/minute per IP (server-side, `RateLimitMiddleware`)
- **Input validation**: all inputs validated before any processing
- **CAPTCHA**: for public-facing production, add Google reCAPTCHA on the forms
- **WAF**: deploy behind a WAF (e.g. Cloudflare) in production

### 11. POPIA/GDPR compliance
- Don't persist tracking numbers or personal data unless explicitly needed
- If storing: use encrypted fields at rest, record purpose/consent
- Implement right-to-erasure endpoints
- Add a privacy policy page and cookie notice
- Audit logs for any data access

---

## Performance & Scalability

### 12. Reducing unnecessary API calls
- Client-side debouncing on form inputs
- De-duplicate identical requests within a session (React state)
- Require explicit form submission (no auto-trigger on keystroke)

### 13. Caching strategies
- **Server-side**: cache tracking results in Redis/Memcached for 60–120 seconds (parcels don't update every second); cache quote results for 5–10 minutes (prices change infrequently)
- **HTTP**: set `Cache-Control` headers appropriately
- **CDN**: cache static frontend assets indefinitely with content-hashed filenames (Vite does this automatically)

### 14. Scaling
- **100 users/day**: current architecture handles this comfortably on a single small VPS (e.g. 1 vCPU, 1 GB RAM)
- **10,000 users/day**: add Redis for caching + session storage, put a load balancer (nginx/HAProxy) in front of 2–3 PHP replicas, use a CDN for frontend static assets, move rate limiter to Redis for cross-instance accuracy

### 15. Microservice architecture
Split into: `tracking-service` (PHP), `quote-service` (PHP), `frontend` (static/CDN). Add an API Gateway (Kong or nginx) as the single entry point. Each service has its own Docker image and scales independently. Communicate via HTTP REST or a message broker (RabbitMQ) for async operations.

---

## Error Handling & Logging

### 16. Error handling implementation
- PHP `try/catch` blocks around all cURL calls in `FastwayApiClient`
- Distinguishes network timeouts, HTTP 4xx, HTTP 5xx, and JSON parse errors
- Returns structured JSON error responses (`{"success": false, "error": "…"}`)
- React frontend maps Axios errors to user-friendly messages; never shows raw API messages

### 17. Centralised error logging
Use `error_log()` (currently writing to PHP's error log). In production: route to a centralised logger like **Sentry** or **Logtail** by setting a custom error handler via `set_error_handler()` and `set_exception_handler()`.

### 18. Monitoring API failures
- Wrap all `FastwayApiClient` calls in try/catch and log every failure with: timestamp, endpoint, HTTP status, duration
- Track error rate with Prometheus + Grafana or use a hosted APM (Datadog, New Relic)
- Alert when error rate exceeds a threshold (e.g. >5% over 5 minutes)

### 19. Alerting on Fastway API unavailability
- A scheduled health-check script (cron every 2 min) calls the Fastway API and fires an alert if it fails 3 consecutive times
- Alerts via PagerDuty, OpsGenie, or a Slack webhook
- Show a user-facing maintenance banner when the API is down

---

## Testing Strategy

### 20. Testing approach
- **Unit tests**: pure functions (Validator, response normalizers) using PHPUnit
- **Integration tests**: mock the Fastway API with a local HTTP stub (e.g. WireMock or a simple PHP test server)
- **Frontend component tests**: React Testing Library
- **End-to-end**: Playwright or Cypress against the running Docker stack

### 21. Testing API integrations without the real API
Create a `MockFastwayApiClient` that implements the same interface as `FastwayApiClient`. In tests, inject the mock via constructor dependency injection. Alternatively, use a contract testing tool like Pact.

### 22. Unit test example (PHP)

```php
// tests/Unit/ValidatorTest.php
use Fastway\Validation\Validator;
use PHPUnit\Framework\TestCase;

class ValidatorTest extends TestCase
{
    public function testValidTrackingLabel(): void
    {
        $errors = Validator::validate([
            'label' => ['Z60000983328', 'required|alphanumeric|min:8|max:30'],
        ]);
        $this->assertEmpty($errors);
    }

    public function testEmptyLabelFails(): void
    {
        $errors = Validator::validate([
            'label' => ['', 'required|alphanumeric|min:8|max:30'],
        ]);
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('required', $errors[0]);
    }

    public function testSpecialCharsInLabelFail(): void
    {
        $errors = Validator::validate([
            'label' => ['Z600-!@#', 'required|alphanumeric|min:8|max:30'],
        ]);
        $this->assertNotEmpty($errors);
    }
}
```

---

## Deployment & DevOps

### 23. Deploying to production
1. Push code to GitHub.
2. GitHub Actions workflow:
   * Build Docker image (React + PHP).
   * Push image to **AWS ECR**.
   * Update **AWS ECS service** (or App Runner) with the new image via GitHub Actions.
3. AWS handles running the containers, scaling, and auto-restarts.
4. Expose service through **ALB** or App Runner URL for HTTP/HTTPS.

### 24. Environment variables to configure
```
FASTWAY_API_KEY       # Secret — use Docker secrets or AWS Secrets Manager
FASTWAY_API_BASE      # https://sa.api.fastway.org/latest
FASTWAY_RFC_CODE      # JNB
ALLOWED_ORIGIN        # https://your-domain.co.za
```

### 25. CI/CD pipeline (GitHub Actions example)
```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        run: |
          IMAGE_TAG=latest
          ECR_REGISTRY=${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-1.amazonaws.com
          ECR_REPOSITORY=fastway-app

          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster fastway-cluster \
            --service fastway-service \
            --force-new-deployment
```

### 26. Monitoring once live
- **Uptime**: UptimeRobot or Freshping on `/api/health`
- **Errors**: Sentry (frontend + backend)
- **Metrics**: Prometheus + Grafana (or Datadog)
- **Logs**: Loki / Logtail / CloudWatch
- **Alerts**: PagerDuty or Slack webhooks on error spikes

---