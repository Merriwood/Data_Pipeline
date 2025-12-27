# Documentation Strategy & Management

> **Comprehensive documentation lifecycle for enterprise AI platform**

**Last Updated:** December 26, 2024
**Version:** 3.0
**Owner:** Engineering Team

---

## Table of Contents

- [Documentation Philosophy](#documentation-philosophy)
- [Documentation Types](#documentation-types)
- [Documentation Structure](#documentation-structure)
- [Versioning Strategy](#versioning-strategy)
- [Changelog Management](#changelog-management)
- [API Documentation](#api-documentation)
- [Code Documentation](#code-documentation)
- [User Documentation](#user-documentation)
- [Internal Documentation](#internal-documentation)
- [Documentation Workflow](#documentation-workflow)
- [Quality Standards](#quality-standards)
- [Tools & Automation](#tools--automation)

---

## Documentation Philosophy

### Core Principles

```yaml
Documentation is Code:
  - Version controlled in Git
  - Reviewed in pull requests
  - Tested for accuracy
  - Continuously updated

Audience-First:
  - Different docs for different audiences
  - Clear navigation and search
  - Progressive disclosure (beginner → advanced)

Living Documentation:
  - Updated with every code change
  - Automatically generated where possible
  - Regular reviews and pruning

Single Source of Truth:
  - No duplicate documentation
  - Cross-references instead of copy-paste
  - Canonical docs linked from everywhere
```

### Documentation Audience Matrix

| Audience | Primary Docs | Update Frequency |
|----------|-------------|------------------|
| **End Users** | User Guides, Tutorials | Every release |
| **API Consumers** | API Reference, OpenAPI spec | Every API change |
| **Developers** | ARCHITECTURE.md, Code comments | Every sprint |
| **DevOps** | DEPLOYMENT.md, Infrastructure guides | Every infra change |
| **Security** | SECURITY.md, Compliance docs | Quarterly + incidents |
| **Product Managers** | README.md, Roadmap | Monthly |
| **Executives** | High-level README, Metrics dashboards | Quarterly |

---

## Documentation Types

### 1. User-Facing Documentation

```yaml
Location: docs/user/

User Guides:
  - Getting Started Guide
  - Feature Walkthroughs
  - Best Practices
  - Troubleshooting FAQs
  Format: Markdown + Screenshots
  Audience: End users, administrators
  Maintenance: Product team

Tutorials:
  - "Your First Review Analysis"
  - "Setting Up E-Commerce Integration"
  - "Creating a Loyalty Campaign"
  Format: Step-by-step with code snippets
  Audience: New users
  Maintenance: Developer Relations team

API Documentation:
  - REST API Reference (auto-generated from OpenAPI)
  - Authentication Guide
  - Rate Limits & Quotas
  - Webhook Reference
  Format: Interactive (Swagger/ReDoc)
  Audience: Integration developers
  Maintenance: Backend team
```

### 2. Developer Documentation

```yaml
Location: docs/

Technical Architecture:
  - ARCHITECTURE.md: System design, agent topology
  - Database Schema: ER diagrams, table descriptions
  - Event Bus: Message formats, event flows
  Format: Markdown + diagrams
  Audience: Senior developers, architects
  Maintenance: Tech leads

Development Guides:
  - Local Setup Guide
  - Agent Development Patterns
  - Testing Strategies
  - Debugging LangGraph Workflows
  Format: Markdown + code examples
  Audience: Contributing developers
  Maintenance: Engineering team

Code Documentation:
  - Inline comments (docstrings)
  - Type hints (Python)
  - Interface definitions (TypeScript)
  Format: In-code + auto-generated
  Audience: All developers
  Maintenance: Code authors (automated enforcement)
```

### 3. Operations Documentation

```yaml
Location: docs/ops/

Deployment Guides:
  - DEPLOYMENT.md: Kubernetes, Terraform
  - CI/CD Pipelines: GitHub Actions workflows
  - Monitoring Setup: LangSmith, Prometheus, Grafana
  Format: Markdown + configuration files
  Audience: DevOps, SRE
  Maintenance: DevOps team

Runbooks:
  - Incident Response Playbooks
  - Disaster Recovery Procedures
  - Scaling Guides
  - Backup & Restore
  Format: Markdown with checklists
  Audience: On-call engineers
  Maintenance: DevOps + Engineering leads

Configuration Reference:
  - Environment Variables
  - Feature Flags
  - Model Serving Configuration
  Format: YAML + Markdown
  Audience: DevOps, developers
  Maintenance: Automated extraction from code
```

### 4. Security & Compliance Documentation

```yaml
Location: docs/security/

Security Documentation:
  - SECURITY.md: Comprehensive security architecture
  - Threat Model
  - Incident Response Plan
  - Penetration Test Reports
  Format: Markdown + diagrams
  Audience: Security team, auditors
  Maintenance: Security team (quarterly review)

Compliance Documentation:
  - GDPR Compliance Guide
  - SOC 2 Controls Mapping
  - Data Processing Agreement (DPA)
  - Privacy Policy
  Format: Markdown + legal documents
  Audience: Legal, compliance, customers
  Maintenance: Legal + Security teams
```

---

## Documentation Structure

### Repository Organization

```
Review-Engine-Workshop-v2/
├── README.md                      # Project overview (entry point)
├── CHANGELOG.md                   # Version history (auto-generated)
├── CONTRIBUTING.md                # Contribution guidelines
│
├── docs/
│   ├── ARCHITECTURE.md            # Technical deep dive
│   ├── SECURITY.md                # Security & compliance
│   ├── DOCUMENTATION.md           # This file
│   │
│   ├── api/
│   │   ├── API.md                 # REST API overview
│   │   ├── openapi.yaml           # OpenAPI 3.0 specification
│   │   └── webhooks.md            # Webhook reference
│   │
│   ├── deployment/
│   │   ├── DEPLOYMENT.md          # Deployment guide
│   │   ├── kubernetes/            # K8s manifests + docs
│   │   ├── terraform/             # IaC + docs
│   │   └── monitoring.md          # Observability setup
│   │
│   ├── development/
│   │   ├── setup.md               # Local dev environment
│   │   ├── testing.md             # Testing guide
│   │   ├── agent-patterns.md     # LangGraph patterns
│   │   └── debugging.md           # Debugging tips
│   │
│   ├── user/
│   │   ├── getting-started.md     # User onboarding
│   │   ├── features/              # Feature docs
│   │   ├── tutorials/             # Step-by-step guides
│   │   └── faq.md                 # Troubleshooting
│   │
│   ├── security/
│   │   ├── threat-model.md
│   │   ├── incident-response.md
│   │   └── compliance/
│   │       ├── gdpr.md
│   │       ├── soc2.md
│   │       └── ccpa.md
│   │
│   └── diagrams/                  # Architecture diagrams
│       ├── system-overview.mermaid
│       ├── agent-topology.mermaid
│       ├── data-flow.mermaid
│       └── deployment.mermaid
│
└── agents/                        # Agent-specific docs
    ├── ingestion/
    │   └── README.md              # Agent purpose, usage
    ├── analysis/
    │   └── README.md
    └── ... (each agent has docs)
```

---

## Versioning Strategy

### Semantic Versioning (SemVer)

```yaml
Format: MAJOR.MINOR.PATCH

MAJOR (Breaking Changes):
  - Incompatible API changes
  - Database schema migrations requiring downtime
  - Agent interface changes
  Example: 1.0.0 → 2.0.0

MINOR (New Features):
  - Backward-compatible functionality
  - New agent modules
  - New API endpoints
  Example: 1.0.0 → 1.1.0

PATCH (Bug Fixes):
  - Backward-compatible bug fixes
  - Performance improvements
  - Documentation updates
  Example: 1.0.0 → 1.0.1

Pre-Release Tags:
  - alpha: Early development (unstable)
  - beta: Feature-complete, testing phase
  - rc: Release candidate (final testing)
  Example: 2.0.0-beta.1, 2.0.0-rc.2
```

### Version Tagging Strategy

```bash
# Git tagging convention
git tag -a v3.0.0 -m "Release 3.0.0: LangGraph-native architecture"
git push origin v3.0.0

# Tag format
v<MAJOR>.<MINOR>.<PATCH>[-<PRERELEASE>]

# Examples
v3.0.0          # Stable release
v3.1.0-beta.1   # Beta pre-release
v3.1.0-rc.1     # Release candidate
v3.1.0          # Final release
```

### API Versioning

```yaml
Strategy: URL Path Versioning

Endpoints:
  - /api/v1/reviews    # Stable, supported
  - /api/v2/reviews    # New version, migration period
  - /api/v1/analytics  # Deprecated (sunset date: 2025-06-01)

Deprecation Policy:
  1. Announce deprecation in release notes (6 months notice)
  2. Add deprecation headers:
     - Warning: 299 - "Deprecated API. Migrate to /api/v2/"
  3. Mark in OpenAPI spec:
     - deprecated: true
     - x-sunset-date: "2025-06-01"
  4. Remove after sunset date

Backward Compatibility:
  - Maintain v1 for 12 months after v2 release
  - Provide migration guide (docs/api/migration-v1-to-v2.md)
```

### Documentation Versioning

```yaml
Strategy: Version-specific documentation branches

Branches:
  - main: Development docs (unreleased)
  - v3.x: Docs for version 3.x
  - v2.x: Docs for version 2.x (archived)

Documentation Website:
  - https://docs.reviewengine.com/latest/  # Always points to newest
  - https://docs.reviewengine.com/v3/      # Version 3.x docs
  - https://docs.reviewengine.com/v2/      # Version 2.x docs (read-only)

Update Process:
  1. Update docs in main branch during development
  2. On release, merge to v3.x branch
  3. Deploy versioned docs site
  4. Archive old versions (keep last 2 major versions)
```

---

## Changelog Management

### Changelog Format (Keep a Changelog)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- New inventory management agent for e-commerce module
- Support for Llama 3.3 70B model

### Changed
- Improved RAG retrieval performance (30% faster)
- Updated Qrvey dashboard embed SDK to v2.5

### Deprecated
- `/api/v1/analytics` endpoint (use `/api/v2/analytics`)

### Removed
- Legacy Celery task queue (replaced by LangGraph)

### Fixed
- Cross-tenant data leak in vector search (#245)
- Rate limiting not enforced on mobile API endpoints (#238)

### Security
- Patched SQL injection vulnerability in SQL agent (CVE-2024-XXXX)

## [3.0.0] - 2024-12-26
### Added
- LangGraph-native multi-agent architecture
- Hybrid LLM infrastructure (Ollama + vLLM + cloud)
- RAG-powered intelligence query pipeline
- Qrvey embedded dashboard integration
- E-commerce plugin with inventory management
- PostgreSQL row-level security (RLS)
- Supabase Auth integration

### Changed
- Complete rewrite from microservices to agent-based architecture
- Replaced Celery with LangGraph workflows
- Migrated from Auth0 to Supabase Auth

### Removed
- Celery background task queue
- Auth0 authentication (replaced by Supabase)

## [2.0.0] - 2024-12-01
### Added
- Mobile apps (iOS + Android) with offline sync
- White-label multi-tenant system
- H3 geospatial clustering

### Changed
- Migrated from monolithic to modular architecture

[Unreleased]: https://github.com/org/review-engine/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/org/review-engine/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/org/review-engine/compare/v1.0.0...v2.0.0
```

### Automated Changelog Generation

```yaml
# .github/workflows/changelog.yml
name: Generate Changelog

on:
  push:
    tags:
      - 'v*'

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Fetch all history

      - name: Generate Changelog
        uses: github-changelog-generator/github-changelog-generator-action@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          output: CHANGELOG.md

      - name: Commit Changelog
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog for ${{ github.ref_name }}"
          git push
```

### Commit Message Convention

```yaml
Format: <type>(<scope>): <subject>

Types:
  feat: New feature
  fix: Bug fix
  docs: Documentation only
  style: Code style (formatting, no logic change)
  refactor: Code refactoring
  perf: Performance improvement
  test: Adding/updating tests
  chore: Build process, dependencies

Scopes:
  agents: Agent modules
  api: REST API
  ui: Frontend
  infra: Infrastructure, deployment
  security: Security-related changes

Examples:
  feat(agents): add inventory manager agent for ecommerce
  fix(api): prevent cross-tenant data leak in vector search
  docs(security): update GDPR compliance section
  perf(agents): optimize RAG retrieval query (30% faster)
  chore(deps): upgrade langgraph to 0.2.5
```

---

## API Documentation

### OpenAPI Specification

```yaml
# docs/api/openapi.yaml
openapi: 3.0.3
info:
  title: Review Engine API
  version: 3.0.0
  description: |
    Enterprise-grade AI-powered review intelligence platform.

    ## Authentication
    All API requests require a Bearer token in the Authorization header:
    ```
    Authorization: Bearer YOUR_JWT_TOKEN
    ```

  contact:
    name: API Support
    email: api@reviewengine.com
    url: https://reviewengine.com/support

servers:
  - url: https://api.reviewengine.com/v3
    description: Production
  - url: https://staging-api.reviewengine.com/v3
    description: Staging
  - url: http://localhost:8000/api/v3
    description: Local development

paths:
  /reviews:
    get:
      summary: List reviews
      description: Retrieve paginated list of reviews for authenticated tenant
      operationId: listReviews
      tags:
        - Reviews
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of reviews
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReviewList'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Review:
      type: object
      properties:
        id:
          type: string
          format: uuid
        source:
          type: string
          enum: [google, yelp, facebook, synup]
        rating:
          type: integer
          minimum: 1
          maximum: 5
        text:
          type: string
        sentiment_score:
          type: number
          minimum: 0
          maximum: 5
        themes:
          type: array
          items:
            type: string
        created_at:
          type: string
          format: date-time
```

### API Documentation Generation

```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

def custom_openapi():
    """Generate OpenAPI spec with custom metadata."""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Review Engine API",
        version="3.0.0",
        description="""
        # Review Engine API

        Enterprise-grade AI-powered review intelligence platform.

        ## Rate Limits
        - 100 requests per minute per IP
        - 10,000 requests per day per tenant

        ## Support
        - Email: api@reviewengine.com
        - Docs: https://docs.reviewengine.com
        """,
        routes=app.routes,
    )

    # Custom metadata
    openapi_schema["info"]["x-logo"] = {
        "url": "https://reviewengine.com/logo.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Serve docs at /docs and /redoc
# Automatically generated from OpenAPI spec
```

---

## Code Documentation

### Python Docstring Standards (Google Style)

```python
def process_review(
    review_id: str,
    sentiment_threshold: float = 4.0,
    include_themes: bool = True
) -> ReviewAnalysis:
    """Process review and extract sentiment + themes.

    This function coordinates the sentiment analysis and theme extraction
    agents to analyze a customer review. Results are cached for 1 hour.

    Args:
        review_id: Unique identifier for the review (UUID format).
        sentiment_threshold: Minimum sentiment score (0-5) to trigger
            loyalty rewards. Defaults to 4.0.
        include_themes: Whether to extract themes from review text.
            Disable for performance on low-priority reviews.

    Returns:
        ReviewAnalysis object containing:
            - sentiment_score (float): Normalized sentiment (0-5)
            - themes (list[str]): Extracted themes (if enabled)
            - processing_time_ms (int): Total processing duration

    Raises:
        ReviewNotFoundError: If review_id doesn't exist in database.
        ModelInferenceError: If LLM inference fails (retries exhausted).
        TenantQuotaExceededError: If tenant has exceeded monthly quota.

    Example:
        >>> analysis = process_review("550e8400-e29b-41d4-a716-446655440000")
        >>> print(analysis.sentiment_score)
        4.2
        >>> print(analysis.themes)
        ['food quality', 'service', 'ambiance']

    Note:
        This function uses the model router to select between on-prem
        (Ollama/vLLM) and cloud (Claude) LLMs based on complexity.
        Simple reviews route to on-prem for cost efficiency.

    See Also:
        - agents.analysis.sentiment_agent
        - agents.analysis.theme_agent
    """
    ...
```

### TypeScript Documentation (TSDoc)

```typescript
/**
 * Fetch reviews for the current tenant with optional filters.
 *
 * @remarks
 * This function automatically applies tenant-scoping based on the
 * authenticated user's JWT claims. Results are cached for 5 minutes.
 *
 * @param filters - Optional filters for review query
 * @param options - Pagination and sorting options
 * @returns Promise resolving to paginated review list
 *
 * @throws {@link UnauthorizedError}
 * Thrown if user is not authenticated or token is expired.
 *
 * @throws {@link RateLimitError}
 * Thrown if tenant has exceeded API rate limit (100 req/min).
 *
 * @example
 * Fetch first page of 5-star reviews:
 * ```typescript
 * const reviews = await fetchReviews(
 *   { rating: 5 },
 *   { page: 1, limit: 20 }
 * );
 * ```
 *
 * @public
 */
export async function fetchReviews(
  filters?: ReviewFilters,
  options?: PaginationOptions
): Promise<ReviewList> {
  ...
}
```

### Inline Comments Best Practices

```python
# BAD: Obvious comment
# Increment counter
counter += 1

# GOOD: Explain "why", not "what"
# Use RRF (Reciprocal Rank Fusion) to combine vector + SQL results
# This gives 30% better precision than simple concatenation
merged_results = rrf_merge(vector_results, sql_results, weights=[0.6, 0.4])

# GOOD: Explain complex business logic
# Award 2x points for reviews >100 words (engagement bonus)
# But cap at 200 points to prevent gaming the system
points = base_points * 2 if word_count > 100 else base_points
points = min(points, 200)
```

---

## User Documentation

### Getting Started Guide Structure

```markdown
# Getting Started with Review Engine

## Prerequisites
- Active Review Engine account
- API credentials (from dashboard)
- Node.js 18+ (for SDK usage)

## Step 1: Installation

### Option A: JavaScript SDK
```bash
npm install @reviewengine/sdk
```

### Option B: Direct API Access
No installation needed. Use any HTTP client.

## Step 2: Authentication

```javascript
import { ReviewEngineClient } from '@reviewengine/sdk';

const client = new ReviewEngineClient({
  apiKey: 'rve_your_api_key_here',
  tenant: 'your-tenant-id'
});
```

## Step 3: Fetch Your First Review

```javascript
const reviews = await client.reviews.list({
  limit: 10,
  sort: 'created_at:desc'
});

console.log(reviews.data);
// [{ id: '...', rating: 5, text: '...', ... }]
```

## Next Steps
- [Integrate with Shopify](./integrations/shopify.md)
- [Set up loyalty rewards](./features/loyalty.md)
- [Configure Qrvey dashboard](./features/analytics.md)

## Need Help?
- [FAQ](./faq.md)
- [Support Email](mailto:support@reviewengine.com)
- [Community Forum](https://community.reviewengine.com)
```

### Tutorial Template

```markdown
# Tutorial: Building Your First Review Analysis Workflow

**Time to Complete:** 15 minutes
**Difficulty:** Beginner
**Prerequisites:** Review Engine account, basic API knowledge

## What You'll Build
An automated workflow that:
1. Fetches new 5-star reviews daily
2. Analyzes sentiment and extracts themes
3. Awards loyalty points automatically
4. Sends thank-you emails via Klaviyo

## Step 1: Set Up Webhook

Navigate to **Settings → Webhooks** and create a new webhook:

```json
{
  "url": "https://your-app.com/webhooks/new-review",
  "events": ["review.created"],
  "filters": {
    "rating": { "gte": 5 }
  }
}
```

[Screenshot: Webhook configuration UI]

## Step 2: Handle Webhook in Your App

```javascript
app.post('/webhooks/new-review', async (req, res) => {
  const { review_id } = req.body;

  // Fetch review with sentiment analysis
  const review = await client.reviews.get(review_id, {
    include: ['sentiment', 'themes']
  });

  // Award points if high sentiment
  if (review.sentiment_score >= 4.5) {
    await client.loyalty.awardPoints({
      customer_email: review.customer_email,
      points: 100,
      reason: '5-star review'
    });
  }

  res.sendStatus(200);
});
```

## Step 3: Test Your Workflow

1. Go to **Dashboard → Reviews → Create Test Review**
2. Enter a 5-star review
3. Check **Dashboard → Loyalty** to see points awarded
4. Customer receives email (check spam folder)

## Troubleshooting

**Problem:** Webhook not triggering
- Check webhook URL is publicly accessible
- Verify HTTPS (not HTTP)
- Check webhook logs in dashboard

**Problem:** Points not awarded
- Verify customer email is in loyalty program
- Check sentiment score (must be ≥4.5)

## Next Steps
- [Add geospatial filtering](../features/geospatial.md)
- [Customize email templates](../features/marketing.md)
```

---

## Internal Documentation

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: Adopt LangGraph for Agent Orchestration

**Date:** 2024-12-01
**Status:** Accepted
**Decision Makers:** Engineering Team

## Context
We need an orchestration framework for our multi-agent AI system.
Options considered:
1. Custom Python workflow engine
2. Celery + Redis
3. LangGraph (LangChain)
4. Temporal.io

## Decision
We will use **LangGraph** for agent orchestration.

## Rationale
- **Native AI Agent Support**: Built for LLM-based agents
- **Stateful Workflows**: PostgreSQL checkpointing for fault tolerance
- **Observability**: LangSmith integration for tracing
- **Conditional Routing**: Built-in support for decision nodes
- **Community**: Strong LangChain ecosystem

## Consequences

### Positive
- Faster development (no custom workflow engine needed)
- Better observability (LangSmith traces every agent step)
- Fault tolerance (checkpoint/resume from failures)

### Negative
- Vendor lock-in to LangChain ecosystem
- Learning curve for team (new framework)
- Limited documentation for production use cases

## Alternatives Considered

**Celery:**
- Pros: Team already familiar, mature ecosystem
- Cons: Not designed for agent workflows, lacks checkpointing

**Temporal.io:**
- Pros: Excellent workflow engine, battle-tested at scale
- Cons: Not AI-specific, requires separate infrastructure

## References
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [POC Implementation](../experiments/langgraph-poc/)
```

### Runbook Template

```markdown
# Runbook: High API Latency (>500ms P95)

**Severity:** P2 (High)
**On-Call:** Engineering Team
**Last Updated:** 2024-12-26

## Symptoms
- API P95 latency >500ms (target: <200ms)
- Datadog alert: "API Latency Threshold Exceeded"
- Customer reports slow dashboard loading

## Investigation Steps

### 1. Check Service Health
```bash
# Check all pods are running
kubectl get pods -n review-engine

# Expected: All pods in "Running" state
# If not, escalate to "Pod CrashLoopBackOff" runbook
```

### 2. Identify Slow Endpoints
```bash
# Query LangSmith for slow traces (last 15 min)
# Go to: https://smith.langchain.com/o/<org>/p/review-engine
# Filter: duration > 500ms

# Common slow endpoints:
# - /api/v3/analytics/dashboard (RAG queries)
# - /api/v3/reviews (large result sets)
```

### 3. Check Database Performance
```bash
# Connect to PostgreSQL
kubectl exec -it postgres-0 -- psql -U postgres

# Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- >100ms
ORDER BY mean_exec_time DESC
LIMIT 10;

# Common issues:
# - Missing indexes (check EXPLAIN ANALYZE)
# - Large table scans (add WHERE filters)
# - Locks/deadlocks (check pg_locks)
```

### 4. Check LLM Inference Latency
```bash
# Check vLLM metrics
curl http://vllm-service:8000/metrics | grep latency

# Expected: p95 < 500ms
# If high, check:
# - GPU utilization (should be <80%)
# - Request queue size (should be <10)
# - Model loaded correctly
```

## Mitigation Steps

### Short-Term (Immediate)
1. **Scale Up Replicas** (if CPU/memory high):
   ```bash
   kubectl scale deployment api --replicas=6
   ```

2. **Clear Redis Cache** (if stale data suspected):
   ```bash
   kubectl exec -it redis-0 -- redis-cli FLUSHDB
   ```

3. **Restart Slow Pods** (if memory leak suspected):
   ```bash
   kubectl delete pod <pod-name>
   # Kubernetes will recreate automatically
   ```

### Long-Term (Permanent Fix)
1. Add missing database indexes
2. Optimize slow SQL queries
3. Increase resource limits (CPU/memory)
4. Implement query result caching

## Escalation
- If latency >1000ms for >15 minutes, escalate to P1
- If database connection pool exhausted, escalate to DBA on-call
- If customer-facing outage, notify Product Manager

## Post-Incident
1. Create Jira ticket with root cause analysis
2. Update this runbook if new learnings
3. Schedule post-mortem within 48 hours
```

---

## Documentation Workflow

### Documentation Review Process

```yaml
Pull Request Requirements:
  Code Changes:
    - Update inline docstrings
    - Update CHANGELOG.md (if user-facing change)
    - Update API.md (if API change)

  New Features:
    - Add user guide (docs/user/features/)
    - Add API documentation (if public API)
    - Add architecture docs (if new agent/module)

  Bug Fixes:
    - Update troubleshooting FAQ (if user-impacting)
    - Add runbook entry (if operational issue)

Review Checklist:
  ☐ All code has docstrings (function-level)
  ☐ Complex logic has inline comments
  ☐ CHANGELOG.md updated
  ☐ User-facing docs updated (if applicable)
  ☐ API docs regenerated (if API change)
  ☐ Spelling & grammar checked
  ☐ Links tested (no 404s)
  ☐ Code examples tested (actually run)
```

### Continuous Documentation Testing

```yaml
# .github/workflows/docs-test.yml
name: Documentation Tests

on: [pull_request]

jobs:
  test-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check Markdown Links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          config-file: .markdown-link-check.json

      - name: Test Code Examples
        run: |
          # Extract code blocks from markdown and test them
          python scripts/test_code_examples.py docs/

      - name: Spelling Check
        uses: streetsidesoftware/cspell-action@v2
        with:
          files: "docs/**/*.md"

      - name: Generate OpenAPI Spec
        run: |
          poetry run python -m app.main --export-openapi > openapi.yaml
          # Validate spec
          npx @redocly/cli lint openapi.yaml
```

---

## Quality Standards

### Documentation Quality Checklist

```yaml
Clarity:
  ☐ Written for target audience (not too technical/simple)
  ☐ Jargon explained or linked to glossary
  ☐ Sentences <25 words (readability)
  ☐ Active voice preferred

Completeness:
  ☐ Prerequisites clearly stated
  ☐ All steps included (nothing assumed)
  ☐ Examples provided
  ☐ Troubleshooting section (if applicable)

Accuracy:
  ☐ Code examples tested and working
  ☐ Screenshots up-to-date
  ☐ Links verified (no 404s)
  ☐ Version numbers correct

Maintainability:
  ☐ Versioned (tied to code version)
  ☐ Owner/maintainer identified
  ☐ Last updated date visible
  ☐ Review schedule defined
```

### Documentation Metrics

```yaml
Tracked Metrics:
  - Documentation coverage (% of code with docstrings)
  - API doc completeness (% of endpoints documented)
  - Documentation freshness (days since last update)
  - User feedback score (helpful/not helpful votes)
  - Search success rate (% of searches with clicks)

Goals:
  - >90% docstring coverage
  - 100% API documentation coverage
  - <30 days documentation freshness
  - >80% user satisfaction
```

---

## Tools & Automation

### Documentation Tools

```yaml
Documentation Site:
  Tool: MkDocs Material
  Hosting: GitHub Pages
  URL: https://docs.reviewengine.com
  Auto-deploy: On git push to main

API Documentation:
  Tool: Swagger UI + ReDoc
  Source: OpenAPI 3.0 spec (auto-generated from FastAPI)
  URL: https://api.reviewengine.com/docs

Diagramming:
  Tool: Mermaid (embedded in Markdown)
  Alternative: Draw.io (for complex diagrams)
  Storage: docs/diagrams/

Code Documentation:
  Python: Sphinx (Google-style docstrings)
  TypeScript: TypeDoc (TSDoc comments)
  Auto-generation: GitHub Actions on release

Changelog Generation:
  Tool: github-changelog-generator
  Trigger: On git tag (release)
  Output: CHANGELOG.md (auto-committed)
```

### MkDocs Configuration

```yaml
# mkdocs.yml
site_name: Review Engine Documentation
site_url: https://docs.reviewengine.com
repo_url: https://github.com/org/review-engine
edit_uri: edit/main/docs/

theme:
  name: material
  features:
    - navigation.tabs
    - navigation.sections
    - navigation.top
    - search.suggest
    - search.highlight
    - content.code.annotate
  palette:
    - scheme: default
      primary: indigo
      accent: indigo

plugins:
  - search
  - mkdocstrings  # Auto-generate docs from docstrings
  - mermaid2      # Render Mermaid diagrams

nav:
  - Home: index.md
  - Getting Started:
      - Installation: user/installation.md
      - Quick Start: user/quick-start.md
  - Features:
      - Review Intelligence: user/features/reviews.md
      - E-Commerce: user/features/ecommerce.md
      - Loyalty: user/features/loyalty.md
  - API Reference:
      - Overview: api/overview.md
      - Authentication: api/authentication.md
      - Endpoints: api/endpoints.md
  - Development:
      - Setup: development/setup.md
      - Agent Patterns: development/agent-patterns.md
      - Testing: development/testing.md
  - Operations:
      - Deployment: deployment/deployment.md
      - Monitoring: deployment/monitoring.md
      - Runbooks: deployment/runbooks.md
```

---

## Documentation Maintenance Schedule

```yaml
Daily:
  - Auto-generate CHANGELOG.md on releases
  - Auto-generate API docs from OpenAPI spec
  - Test code examples in docs (CI/CD)

Weekly:
  - Review new issues for FAQ updates
  - Check for broken links (automated)

Monthly:
  - Review user feedback on docs
  - Update screenshots if UI changed
  - Prune outdated docs

Quarterly:
  - Full documentation audit
  - Update architecture diagrams
  - Review and archive old versions

Annually:
  - Comprehensive rewrite if major version change
  - User research on documentation gaps
```

---

**Documentation is our second product. Maintain it with the same rigor as code.**

**Questions?** Contact: docs@reviewengine.com
