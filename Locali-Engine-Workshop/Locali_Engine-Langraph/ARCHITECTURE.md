# Technical Architecture Guide

> **Deep dive into the LangGraph-powered multi-agent system architecture**

**Last Updated:** December 26, 2024
**Version:** 3.0
**Target Audience:** Senior Engineers, Technical Architects, DevOps

---

## Table of Contents

- [System Overview](#system-overview)
- [LangGraph Agent Architecture](#langgraph-agent-architecture)
- [Agent Implementation Patterns](#agent-implementation-patterns)
- [Model Serving Infrastructure](#model-serving-infrastructure)
- [RAG System Architecture](#rag-system-architecture)
- [Database Schema Design](#database-schema-design)
- [Event-Driven Architecture](#event-driven-architecture)
- [State Management](#state-management)
- [API Gateway Layer](#api-gateway-layer)
- [Qrvey Integration Architecture](#qrvey-integration-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Observability & Monitoring](#observability--monitoring)
- [Performance Optimization](#performance-optimization)
- [Scaling Strategy](#scaling-strategy)

---

## System Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Next.js Web App]
        MobileApp[React Native Mobile]
        QrveyDash[Qrvey Embedded Dashboard]
    end

    subgraph "API Gateway Layer"
        Gateway[FastAPI Gateway]
        Auth[Supabase Auth]
        RateLimit[Rate Limiter - Redis]
    end

    subgraph "Orchestration Layer - LangGraph"
        Orchestrator[Central Orchestrator Graph]

        subgraph "Review Pipeline"
            R1[Ingestion Agent]
            R2[Validation Agent]
            R3[Embedding Agent]
            R4[Model Router]
            R5[Sentiment Agent]
            R6[Geo Agent]
        end

        subgraph "Query Pipeline"
            Q1[Query Understanding]
            Q2[Vector Search]
            Q3[SQL Agent]
            Q4[RAG Generator]
        end

        subgraph "Action Pipeline"
            A1[Eligibility Agent]
            A2[Loyalty Agent]
            A3[Marketing Agent]
        end
    end

    subgraph "Model Serving Layer"
        LiteLLM[LiteLLM Gateway]
        Ollama[Ollama - CPU]
        vLLM[vLLM - GPU]
        Cloud[Claude/GPT - Cloud]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL 16<br/>+ pgvector)]
        Qdrant[(Qdrant<br/>Vector DB)]
        Redis[(Redis<br/>Cache + Streams)]
    end

    subgraph "Integration Layer"
        Yotpo[Yotpo API]
        Klaviyo[Klaviyo API]
        Shopify[Shopify API]
        Synup[Synup API]
    end

    WebApp --> Gateway
    MobileApp --> Gateway
    QrveyDash --> Gateway

    Gateway --> Auth
    Gateway --> RateLimit
    Gateway --> Orchestrator

    Orchestrator --> R1
    R1 --> R2 --> R3 --> R4
    R4 --> R5 --> R6

    Orchestrator --> Q1
    Q1 --> Q2
    Q1 --> Q3
    Q2 --> Q4
    Q3 --> Q4

    Orchestrator --> A1
    A1 --> A2 --> A3

    R4 --> LiteLLM
    R5 --> LiteLLM
    Q4 --> LiteLLM

    LiteLLM --> Ollama
    LiteLLM --> vLLM
    LiteLLM --> Cloud

    R3 --> Qdrant
    Q2 --> Qdrant

    Orchestrator --> PostgreSQL
    Orchestrator --> Redis

    A2 --> Yotpo
    A3 --> Klaviyo
    R1 --> Synup
```

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Orchestration** | LangGraph 0.2+ | Multi-agent state machines |
| **API Gateway** | FastAPI 0.115+ | REST API, request routing |
| **Model Gateway** | LiteLLM 1.50+ | Unified LLM API |
| **On-Prem Inference** | Ollama 0.3+ (CPU), vLLM 0.6+ (GPU) | Cost-optimized inference |
| **Vector Database** | Qdrant 1.11+ | Semantic search |
| **Primary Database** | PostgreSQL 16 + pgvector | Structured data + vectors |
| **Event Bus** | Redis Streams 7.4+ | Inter-agent messaging |
| **Cache** | Redis 7.4+ | LLM response cache |
| **Observability** | LangSmith, Prometheus, Grafana | Tracing, metrics |
| **Container Orchestration** | Kubernetes 1.28+ | Production deployment |

---

## LangGraph Agent Architecture

### Core Concepts

**LangGraph StateGraph:**
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. Define state schema
class ReviewState(TypedDict):
    review_id: str
    raw_data: dict
    is_valid: bool
    embedding: list[float]
    sentiment_score: float
    h3_index: str

# 2. Create graph
graph = StateGraph(ReviewState)

# 3. Add nodes (agents)
graph.add_node("ingest", ingestion_agent)
graph.add_node("validate", validation_agent)
graph.add_node("embed", embedding_agent)
graph.add_node("analyze", sentiment_agent)

# 4. Add edges (workflow)
graph.add_edge("ingest", "validate")

# 5. Add conditional edges (routing)
graph.add_conditional_edges(
    "validate",
    lambda state: "embed" if state["is_valid"] else END
)

graph.add_edge("embed", "analyze")

# 6. Set entry point
graph.set_entry_point("ingest")

# 7. Compile with checkpointing
from langgraph.checkpoint.postgres import PostgresSaver
checkpointer = PostgresSaver(connection_string=DATABASE_URL)
app = graph.compile(checkpointer=checkpointer)
```

### Agent Execution Model

```yaml
Execution Flow:
  1. Client Request → API Gateway
  2. Gateway → Orchestrator (invoke graph)
  3. Orchestrator → Execute nodes sequentially/parallel
  4. Each node:
     - Receives state
     - Executes logic (calls tools, LLMs)
     - Updates state
     - Returns modified state
  5. State auto-checkpointed to PostgreSQL
  6. Next node receives updated state
  7. Final state returned to API Gateway
  8. Response sent to client

Fault Tolerance:
  - If node fails, state is preserved in DB
  - Graph can be resumed from last checkpoint
  - Automatic retries with exponential backoff
  - Dead letter queue for persistent failures
```

### Central Orchestrator Implementation

```python
# agents/core/orchestrator.py
from langgraph.graph import StateGraph
from typing import Literal

class CentralOrchestrator:
    """Main orchestration graph that routes to sub-graphs."""

    def __init__(self):
        self.graph = StateGraph(OrchestratorState)
        self._build_graph()

    def _build_graph(self):
        # Add router node
        self.graph.add_node("route", self.route_request)

        # Add sub-graph nodes
        self.graph.add_node("review_pipeline", self.review_pipeline)
        self.graph.add_node("query_pipeline", self.query_pipeline)
        self.graph.add_node("action_pipeline", self.action_pipeline)

        # Set entry point
        self.graph.set_entry_point("route")

        # Conditional routing based on request type
        self.graph.add_conditional_edges(
            "route",
            self.determine_pipeline,
            {
                "review": "review_pipeline",
                "query": "query_pipeline",
                "action": "action_pipeline"
            }
        )

    def determine_pipeline(self, state: OrchestratorState) -> str:
        """Route request to appropriate pipeline."""
        if state.get("request_type") == "review_ingestion":
            return "review"
        elif state.get("request_type") == "query":
            return "query"
        elif state.get("request_type") == "action":
            return "action"
        else:
            raise ValueError(f"Unknown request type: {state.get('request_type')}")

    async def route_request(self, state: OrchestratorState):
        """Parse request and set metadata."""
        state["request_id"] = str(uuid.uuid4())
        state["started_at"] = datetime.utcnow().isoformat()
        return state

    async def review_pipeline(self, state: OrchestratorState):
        """Delegate to review processing sub-graph."""
        review_app = get_review_pipeline_app()
        result = await review_app.ainvoke(
            state,
            config={"configurable": {"tenant_id": state["tenant_id"]}}
        )
        return result

    async def query_pipeline(self, state: OrchestratorState):
        """Delegate to query processing sub-graph."""
        query_app = get_query_pipeline_app()
        result = await query_app.ainvoke(
            state,
            config={"configurable": {"tenant_id": state["tenant_id"]}}
        )
        return result

    async def action_pipeline(self, state: OrchestratorState):
        """Delegate to action automation sub-graph."""
        action_app = get_action_pipeline_app()
        result = await action_app.ainvoke(
            state,
            config={"configurable": {"tenant_id": state["tenant_id"]}}
        )
        return result
```

---

## Agent Implementation Patterns

### Pattern 1: Simple Stateless Agent

```python
# agents/ingestion/ingestion_agent/agent.py
from langgraph.graph import StateGraph
from pydantic import BaseModel

class IngestionState(BaseModel):
    """State schema for ingestion agent."""
    external_id: str
    source: str
    raw_review: dict | None = None
    error: str | None = None

class IngestionAgent:
    """Fetch review from external source (Synup)."""

    def __init__(self, synup_client):
        self.synup_client = synup_client
        self.graph = StateGraph(IngestionState)
        self.graph.add_node("fetch", self.fetch_review)
        self.graph.set_entry_point("fetch")
        self.app = self.graph.compile()

    async def fetch_review(self, state: IngestionState) -> IngestionState:
        """Fetch review from external API."""
        try:
            review_data = await self.synup_client.get_review(
                source=state.source,
                external_id=state.external_id
            )

            state.raw_review = review_data
            return state

        except Exception as e:
            state.error = f"Failed to fetch review: {str(e)}"
            logger.error("Ingestion failed", error=str(e), state=state)
            return state
```

### Pattern 2: Agent with Tool Calling

```python
# agents/intelligence/sql_agent/agent.py
from langchain.tools import Tool
from langchain.agents import create_openai_functions_agent

class SQLAgent:
    """Convert natural language to SQL queries."""

    def __init__(self):
        self.tools = [
            Tool(
                name="execute_sql",
                func=self.execute_sql,
                description="Execute SQL query on PostgreSQL database"
            ),
            Tool(
                name="get_schema",
                func=self.get_schema,
                description="Get database schema information"
            )
        ]

        self.graph = StateGraph(SQLAgentState)
        self.graph.add_node("plan", self.plan_query)
        self.graph.add_node("execute", self.execute_query)
        self.graph.add_node("validate", self.validate_results)

        self.graph.add_edge("plan", "execute")
        self.graph.add_edge("execute", "validate")

        self.graph.set_entry_point("plan")
        self.app = self.graph.compile()

    async def plan_query(self, state: SQLAgentState) -> SQLAgentState:
        """Use LLM to generate SQL from natural language."""
        prompt = f"""
        Convert this natural language query to SQL:
        "{state.user_query}"

        Available tables:
        - reviews (id, tenant_id, rating, text, sentiment_score, created_at)
        - customers (id, tenant_id, email, loyalty_points)

        Rules:
        - ALWAYS include tenant_id = '{state.tenant_id}' in WHERE clause
        - Use parameterized queries (avoid SQL injection)
        - Return only SELECT queries (no INSERT/UPDATE/DELETE)
        """

        response = await self.llm.ainvoke(prompt)
        state.sql_query = response.content

        return state

    async def execute_query(self, state: SQLAgentState) -> SQLAgentState:
        """Execute SQL query with safety checks."""
        # Validate query is SELECT only
        if not state.sql_query.strip().upper().startswith("SELECT"):
            state.error = "Only SELECT queries allowed"
            return state

        # Execute with tenant isolation
        async with get_tenant_db_session(state.tenant_id) as db:
            try:
                results = await db.fetch_all(state.sql_query)
                state.results = [dict(row) for row in results]
            except Exception as e:
                state.error = f"Query execution failed: {str(e)}"

        return state

    async def validate_results(self, state: SQLAgentState) -> SQLAgentState:
        """Validate results meet expectations."""
        if state.error:
            return state

        # Check result set size
        if len(state.results) > 1000:
            state.results = state.results[:1000]
            state.warning = "Results truncated to 1000 rows"

        return state
```

### Pattern 3: Agent with Sub-Graph Composition

```python
# agents/analysis/sentiment_agent/agent.py
from langgraph.graph import StateGraph

class SentimentAgent:
    """Multi-step sentiment analysis with sub-tasks."""

    def __init__(self):
        # Main graph
        self.graph = StateGraph(SentimentState)

        # Add nodes
        self.graph.add_node("preprocess", self.preprocess_text)
        self.graph.add_node("extract_sentiment", self.extract_sentiment)
        self.graph.add_node("extract_themes", self.extract_themes)
        self.graph.add_node("aggregate", self.aggregate_results)

        # Sequential flow
        self.graph.add_edge("preprocess", "extract_sentiment")

        # Parallel execution (themes can run alongside sentiment)
        self.graph.add_edge("preprocess", "extract_themes")

        # Both converge to aggregation
        self.graph.add_edge("extract_sentiment", "aggregate")
        self.graph.add_edge("extract_themes", "aggregate")

        self.graph.set_entry_point("preprocess")
        self.app = self.graph.compile()

    async def preprocess_text(self, state: SentimentState) -> SentimentState:
        """Clean and normalize review text."""
        text = state.review_text

        # Remove HTML tags
        text = bleach.clean(text, tags=[], strip=True)

        # Normalize whitespace
        text = " ".join(text.split())

        # Truncate to max length (prevent token overflow)
        if len(text) > 5000:
            text = text[:5000]

        state.processed_text = text
        return state

    async def extract_sentiment(self, state: SentimentState) -> SentimentState:
        """Extract sentiment score (0-5)."""
        prompt = f"""
        Rate the sentiment of this review on a scale of 0-5:
        0 = Very negative
        5 = Very positive

        Review: {state.processed_text}

        Respond with ONLY a number between 0 and 5.
        """

        response = await self.llm.ainvoke(prompt)

        try:
            score = float(response.content.strip())
            state.sentiment_score = max(0, min(5, score))  # Clamp to [0, 5]
        except ValueError:
            state.sentiment_score = 2.5  # Neutral fallback

        return state

    async def extract_themes(self, state: SentimentState) -> SentimentState:
        """Extract themes from review text."""
        prompt = f"""
        Extract key themes from this review.
        Return as comma-separated list (max 5 themes).

        Review: {state.processed_text}

        Common themes: food quality, service, ambiance, value, location
        """

        response = await self.llm.ainvoke(prompt)

        themes = [t.strip() for t in response.content.split(",")]
        state.themes = themes[:5]  # Max 5 themes

        return state

    async def aggregate_results(self, state: SentimentState) -> SentimentState:
        """Combine sentiment and themes."""
        state.analysis_complete = True
        state.completed_at = datetime.utcnow().isoformat()

        return state
```

### Pattern 4: Agent with Human-in-the-Loop

```python
# agents/automation/eligibility_agent/agent.py
from langgraph.graph import StateGraph, END

class EligibilityAgent:
    """Check loyalty program eligibility with optional human review."""

    def __init__(self):
        self.graph = StateGraph(EligibilityState)

        self.graph.add_node("check_rules", self.check_business_rules)
        self.graph.add_node("fraud_detection", self.detect_fraud)
        self.graph.add_node("await_approval", self.await_human_approval)
        self.graph.add_node("approve", self.approve_eligibility)
        self.graph.add_node("deny", self.deny_eligibility)

        self.graph.set_entry_point("check_rules")

        # Conditional routing
        self.graph.add_conditional_edges(
            "check_rules",
            lambda s: "fraud_detection" if s["passes_rules"] else "deny"
        )

        self.graph.add_conditional_edges(
            "fraud_detection",
            lambda s: "await_approval" if s["fraud_risk"] > 0.7 else "approve"
        )

        self.graph.add_conditional_edges(
            "await_approval",
            lambda s: "approve" if s["human_approved"] else "deny"
        )

        self.graph.add_edge("approve", END)
        self.graph.add_edge("deny", END)

        self.app = self.graph.compile()

    async def check_business_rules(self, state: EligibilityState):
        """Check if customer meets basic eligibility."""
        customer = await db.fetch_one(
            "SELECT * FROM customers WHERE id = $1",
            state.customer_id
        )

        state.passes_rules = (
            customer["opted_into_loyalty"] and
            customer["account_status"] == "active" and
            state.review_rating >= 4
        )

        return state

    async def detect_fraud(self, state: EligibilityState):
        """ML-based fraud detection."""
        features = {
            "review_length": len(state.review_text),
            "time_since_registration": (
                datetime.utcnow() - state.customer_created_at
            ).days,
            "previous_reviews_count": state.customer_review_count,
            "ip_address": state.ip_address
        }

        # Call fraud detection model
        state.fraud_risk = await fraud_model.predict(features)

        return state

    async def await_human_approval(self, state: EligibilityState):
        """Pause execution for human review."""
        # Create approval task
        approval_id = await create_approval_task(
            type="loyalty_eligibility",
            customer_id=state.customer_id,
            fraud_risk=state.fraud_risk,
            review_id=state.review_id
        )

        # This node pauses execution
        # Graph will be resumed when approval task is completed
        state.approval_task_id = approval_id
        state.human_approved = None  # Will be set by external process

        return state

    async def approve_eligibility(self, state: EligibilityState):
        """Mark as eligible."""
        state.is_eligible = True
        state.reason = "Passed all checks"
        return state

    async def deny_eligibility(self, state: EligibilityState):
        """Mark as ineligible."""
        state.is_eligible = False
        state.reason = "Failed eligibility criteria or fraud check"
        return state
```

---

## Model Serving Infrastructure

### LiteLLM Gateway Configuration

```python
# infrastructure/model-gateway/litellm_config.yaml
model_list:
  # On-Prem Ollama (Weeks 1-2)
  - model_name: ollama/llama3.1:8b
    litellm_params:
      model: ollama/llama3.1:8b-instruct-q4_0
      api_base: http://ollama:11434
      timeout: 30

  # On-Prem vLLM (Week 3+)
  - model_name: vllm/llama3.1:8b
    litellm_params:
      model: meta-llama/Llama-3.1-8B-Instruct-AWQ
      api_base: http://vllm:8000/v1
      api_key: dummy  # vLLM doesn't require key
      timeout: 10

  - model_name: vllm/llama3.1:70b
    litellm_params:
      model: meta-llama/Llama-3.1-70B-Instruct-AWQ
      api_base: http://vllm-large:8000/v1
      api_key: dummy
      timeout: 15

  # Cloud Fallback
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
      timeout: 20

  - model_name: gpt-4o-mini
    litellm_params:
      model: gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
      timeout: 15

# Router configuration
router_settings:
  routing_strategy: cost-based
  fallbacks:
    - ["vllm/llama3.1:8b", "ollama/llama3.1:8b", "claude-3-5-sonnet"]
  allowed_fails: 1  # Retry once before fallback
  cache:
    type: redis
    host: redis
    port: 6379
    ttl: 3600  # Cache responses for 1 hour
```

### vLLM Deployment (Week 3+)

```yaml
# infrastructure/kubernetes/vllm-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-llama-8b
  namespace: review-engine
spec:
  replicas: 2  # Horizontal scaling
  selector:
    matchLabels:
      app: vllm
      model: llama-8b
  template:
    metadata:
      labels:
        app: vllm
        model: llama-8b
    spec:
      containers:
      - name: vllm
        image: vllm/vllm-openai:v0.6.3
        command:
          - python
          - -m
          - vllm.entrypoints.openai.api_server
        args:
          - --model=meta-llama/Llama-3.1-8B-Instruct-AWQ
          - --quantization=awq
          - --dtype=half
          - --max-model-len=8192
          - --gpu-memory-utilization=0.9
          - --tensor-parallel-size=1
          - --port=8000
        resources:
          requests:
            nvidia.com/gpu: 1  # Request 1 GPU
            memory: 16Gi
            cpu: 4
          limits:
            nvidia.com/gpu: 1
            memory: 24Gi
            cpu: 8
        ports:
        - containerPort: 8000
          name: http
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: vllm
  namespace: review-engine
spec:
  selector:
    app: vllm
    model: llama-8b
  ports:
  - port: 8000
    targetPort: 8000
    name: http
  type: ClusterIP
```

### Model Router Agent

```python
# agents/analysis/model_router_agent/agent.py
from dataclasses import dataclass

@dataclass
class ModelConfig:
    name: str
    cost_per_1k_tokens: float
    avg_latency_ms: int
    max_context_length: int

class ModelRouterAgent:
    """Route requests to optimal model based on complexity + cost."""

    MODELS = {
        "ollama/llama3.1:8b": ModelConfig(
            name="ollama/llama3.1:8b",
            cost_per_1k_tokens=0.0,
            avg_latency_ms=3000,
            max_context_length=8192
        ),
        "vllm/llama3.1:8b": ModelConfig(
            name="vllm/llama3.1:8b",
            cost_per_1k_tokens=0.0,
            avg_latency_ms=300,
            max_context_length=8192
        ),
        "vllm/llama3.1:70b": ModelConfig(
            name="vllm/llama3.1:70b",
            cost_per_1k_tokens=0.0,
            avg_latency_ms=800,
            max_context_length=131072
        ),
        "claude-3-5-sonnet": ModelConfig(
            name="claude-3-5-sonnet",
            cost_per_1k_tokens=3.0,
            avg_latency_ms=1500,
            max_context_length=200000
        )
    }

    async def route(self, state: RouterState) -> RouterState:
        """Select optimal model based on task complexity."""
        # Calculate complexity score
        complexity = self.calculate_complexity(state.text)

        # Select model based on complexity + constraints
        if complexity < 0.3:
            # Simple task → Use fastest on-prem
            if VLLM_AVAILABLE:
                model = "vllm/llama3.1:8b"
            else:
                model = "ollama/llama3.1:8b"

        elif complexity < 0.7:
            # Medium task → Use larger on-prem
            model = "vllm/llama3.1:70b" if VLLM_AVAILABLE else "vllm/llama3.1:8b"

        else:
            # Complex task → Use cloud
            # But check cost budget first
            if self.exceeds_cost_budget(state.tenant_id):
                logger.warning("Cost budget exceeded, using on-prem fallback")
                model = "vllm/llama3.1:70b"
            else:
                model = "claude-3-5-sonnet"

        state.selected_model = model
        state.routing_reason = f"Complexity: {complexity:.2f}"

        return state

    def calculate_complexity(self, text: str) -> float:
        """Estimate task complexity (0-1 scale)."""
        features = {
            "word_count": len(text.split()),
            "sentence_count": text.count('.') + text.count('!') + text.count('?'),
            "avg_word_length": sum(len(w) for w in text.split()) / max(len(text.split()), 1),
            "has_questions": '?' in text,
            "has_numbers": any(c.isdigit() for c in text),
            "language": detect_language(text)
        }

        # Simple rule-based scoring
        score = 0.0

        if features["word_count"] > 100:
            score += 0.3
        if features["sentence_count"] > 5:
            score += 0.2
        if features["has_questions"]:
            score += 0.2
        if features["language"] != "en":
            score += 0.5  # Non-English = route to cloud

        return min(score, 1.0)

    async def exceeds_cost_budget(self, tenant_id: str) -> bool:
        """Check if tenant has exceeded monthly cost budget."""
        usage = await redis.get(f"cost:tenant:{tenant_id}:month")

        if not usage:
            return False

        tenant_budget = await db.fetch_val(
            "SELECT monthly_llm_budget FROM tenants WHERE id = $1",
            tenant_id
        )

        return float(usage) >= tenant_budget
```

---

## RAG System Architecture

### Hybrid Retrieval Pipeline

```python
# agents/intelligence/rag_agent/retrieval.py
from typing import List, Dict
import asyncio

class HybridRetriever:
    """Combine vector, SQL, and spatial search for comprehensive retrieval."""

    def __init__(
        self,
        qdrant_client,
        postgres_db,
        h3_index
    ):
        self.qdrant = qdrant_client
        self.db = postgres_db
        self.h3 = h3_index

    async def retrieve(
        self,
        query: str,
        filters: Dict,
        top_k: int = 10
    ) -> List[Dict]:
        """Execute hybrid retrieval with 3 parallel strategies."""

        # Execute all strategies in parallel
        results = await asyncio.gather(
            self.semantic_search(query, top_k * 2),
            self.structured_search(filters, top_k * 2),
            self.spatial_search(filters.get("location"), top_k * 2)
        )

        semantic_results, sql_results, spatial_results = results

        # Merge results using Reciprocal Rank Fusion
        merged = self.reciprocal_rank_fusion(
            results_lists=[semantic_results, sql_results, spatial_results],
            weights=[0.5, 0.3, 0.2],  # Semantic most important
            k=60  # RRF constant
        )

        # Re-rank with cross-encoder
        reranked = await self.rerank(query, merged, top_k)

        return reranked

    async def semantic_search(
        self,
        query: str,
        top_k: int
    ) -> List[Dict]:
        """Vector similarity search via Qdrant."""

        # Generate query embedding
        query_embedding = await self.embed(query)

        # Search Qdrant
        search_result = await self.qdrant.search(
            collection_name="reviews",
            query_vector=query_embedding,
            limit=top_k,
            query_filter={
                "must": [
                    {"key": "tenant_id", "match": {"value": self.tenant_id}}
                ]
            },
            with_payload=True,
            with_vectors=False
        )

        return [
            {
                "id": hit.id,
                "score": hit.score,
                "text": hit.payload["text"],
                "metadata": hit.payload,
                "retrieval_method": "semantic"
            }
            for hit in search_result
        ]

    async def structured_search(
        self,
        filters: Dict,
        top_k: int
    ) -> List[Dict]:
        """SQL-based structured search."""

        # Build SQL query from filters
        sql = """
            SELECT id, text, rating, sentiment_score, created_at
            FROM reviews
            WHERE tenant_id = $1
        """
        params = [self.tenant_id]

        if "min_rating" in filters:
            sql += f" AND rating >= ${len(params) + 1}"
            params.append(filters["min_rating"])

        if "start_date" in filters:
            sql += f" AND created_at >= ${len(params) + 1}"
            params.append(filters["start_date"])

        if "source" in filters:
            sql += f" AND source = ${len(params) + 1}"
            params.append(filters["source"])

        sql += f" ORDER BY created_at DESC LIMIT ${len(params) + 1}"
        params.append(top_k)

        # Execute query
        rows = await self.db.fetch_all(sql, *params)

        return [
            {
                "id": row["id"],
                "score": 1.0,  # SQL results get default score
                "text": row["text"],
                "metadata": dict(row),
                "retrieval_method": "sql"
            }
            for row in rows
        ]

    async def spatial_search(
        self,
        location: Dict,
        top_k: int
    ) -> List[Dict]:
        """H3 hexagon-based geospatial search."""

        if not location:
            return []

        # Convert lat/lng to H3 index
        h3_index = h3.geo_to_h3(
            location["lat"],
            location["lng"],
            resolution=9  # ~0.1km hexagons
        )

        # Get neighboring hexagons (k-ring)
        nearby_hexagons = h3.k_ring(h3_index, k=2)  # 2-hop neighbors

        # Fetch reviews in these hexagons
        rows = await self.db.fetch_all("""
            SELECT id, text, h3_index, rating, created_at
            FROM reviews
            WHERE tenant_id = $1
              AND h3_index = ANY($2)
            ORDER BY created_at DESC
            LIMIT $3
        """, self.tenant_id, list(nearby_hexagons), top_k)

        return [
            {
                "id": row["id"],
                "score": 1.0,
                "text": row["text"],
                "metadata": dict(row),
                "retrieval_method": "spatial"
            }
            for row in rows
        ]

    def reciprocal_rank_fusion(
        self,
        results_lists: List[List[Dict]],
        weights: List[float],
        k: int = 60
    ) -> List[Dict]:
        """Merge multiple ranked lists using RRF algorithm."""

        # Aggregate scores by document ID
        scores = {}
        docs = {}

        for results, weight in zip(results_lists, weights):
            for rank, doc in enumerate(results, start=1):
                doc_id = doc["id"]

                # RRF formula: score = weight / (k + rank)
                rrf_score = weight / (k + rank)

                if doc_id in scores:
                    scores[doc_id] += rrf_score
                else:
                    scores[doc_id] = rrf_score
                    docs[doc_id] = doc

        # Sort by RRF score
        sorted_ids = sorted(scores.keys(), key=lambda id: scores[id], reverse=True)

        # Return merged results
        return [
            {**docs[doc_id], "rrf_score": scores[doc_id]}
            for doc_id in sorted_ids
        ]

    async def rerank(
        self,
        query: str,
        documents: List[Dict],
        top_k: int
    ) -> List[Dict]:
        """Re-rank documents using cross-encoder model."""

        # Prepare query-document pairs
        pairs = [(query, doc["text"]) for doc in documents]

        # Get relevance scores from cross-encoder
        # Using lightweight cross-encoder (e.g., MiniLM)
        scores = await self.cross_encoder.predict(pairs)

        # Combine RRF score + cross-encoder score
        for doc, score in zip(documents, scores):
            doc["final_score"] = (
                0.6 * doc.get("rrf_score", 0.5) +
                0.4 * score
            )

        # Sort by final score
        reranked = sorted(
            documents,
            key=lambda d: d["final_score"],
            reverse=True
        )

        return reranked[:top_k]
```

### RAG Generation with Citations

```python
# agents/intelligence/rag_agent/generation.py
class RAGGenerator:
    """Generate answers with source citations."""

    async def generate(
        self,
        query: str,
        context_docs: List[Dict]
    ) -> Dict:
        """Generate answer with citations."""

        # Build context string with citations
        context_parts = []
        for i, doc in enumerate(context_docs, start=1):
            context_parts.append(
                f"[{i}] (Rating: {doc['metadata']['rating']}/5, "
                f"Date: {doc['metadata']['created_at'][:10]})\n"
                f"{doc['text']}\n"
            )

        context = "\n".join(context_parts)

        # Generate answer with citations
        prompt = f"""
        You are a helpful assistant analyzing customer reviews.

        Context (relevant reviews):
        {context}

        User question: {query}

        Instructions:
        1. Answer the question based ONLY on the provided context
        2. Include citations like [1], [2] to reference source reviews
        3. If the context doesn't contain enough information, say so
        4. Be concise (max 3 paragraphs)

        Answer:
        """

        response = await self.llm.ainvoke(prompt)

        # Validate citations
        answer = response.content
        validated_answer = self.validate_citations(
            answer,
            max_citation=len(context_docs)
        )

        return {
            "answer": validated_answer,
            "sources": [
                {
                    "citation_number": i,
                    "review_id": doc["id"],
                    "text_snippet": doc["text"][:200],
                    "rating": doc["metadata"]["rating"],
                    "date": doc["metadata"]["created_at"]
                }
                for i, doc in enumerate(context_docs, start=1)
            ],
            "retrieval_stats": {
                "total_retrieved": len(context_docs),
                "methods_used": list(set(d["retrieval_method"] for d in context_docs))
            }
        }

    def validate_citations(self, answer: str, max_citation: int) -> str:
        """Remove invalid citations from answer."""
        import re

        # Find all citations [1], [2], etc.
        citations = re.findall(r'\[(\d+)\]', answer)

        for citation in citations:
            num = int(citation)
            if num > max_citation or num < 1:
                # Remove invalid citation
                answer = answer.replace(f"[{num}]", "")

        return answer
```

---

## Database Schema Design

### Core Tables

```sql
-- PostgreSQL 16 schema with RLS

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Text search
CREATE EXTENSION IF NOT EXISTS "vector";   -- pgvector for embeddings

-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'starter',  -- starter, professional, enterprise
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    monthly_llm_budget DECIMAL(10,2) DEFAULT 100.00,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    source VARCHAR(50) NOT NULL,  -- google, yelp, facebook, synup
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    sentiment_score DECIMAL(3,2),  -- 0.00 to 5.00
    themes TEXT[],
    h3_index VARCHAR(20),  -- H3 hexagon index
    embedding vector(768),  -- pgvector for semantic search
    customer_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    UNIQUE(tenant_id, source, external_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_reviews ON reviews
    FOR ALL
    TO authenticated
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Indexes
CREATE INDEX idx_reviews_tenant ON reviews(tenant_id);
CREATE INDEX idx_reviews_source ON reviews(source);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_score);
CREATE INDEX idx_reviews_h3 ON reviews(h3_index);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_reviews_text_search ON reviews USING gin(to_tsvector('english', text));

-- Vector index (HNSW for fast similarity search)
CREATE INDEX idx_reviews_embedding ON reviews USING hnsw (embedding vector_cosine_ops);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    loyalty_points INTEGER DEFAULT 0,
    opted_into_loyalty BOOLEAN DEFAULT false,
    account_status VARCHAR(50) DEFAULT 'active',  -- active, suspended, deleted
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);

-- Products table (E-commerce module)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_id VARCHAR(255),  -- Shopify product ID
    name VARCHAR(500) NOT NULL,
    sku VARCHAR(255),
    price DECIMAL(10,2),
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_products ON products
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    order_id VARCHAR(255),
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_purchases ON purchases
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- LangGraph checkpoints table
CREATE TABLE langgraph_checkpoints (
    thread_id VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    parent_checkpoint_id VARCHAR(255),
    checkpoint_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, checkpoint_id)
);

CREATE INDEX idx_checkpoints_thread ON langgraph_checkpoints(thread_id);
CREATE INDEX idx_checkpoints_created ON langgraph_checkpoints(created_at);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID,
    resource_type VARCHAR(100),
    resource_id UUID,
    action VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,  -- success, failure, denied
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

### Materialized Views for Analytics

```sql
-- Customer LTV calculation (refreshed hourly)
CREATE MATERIALIZED VIEW customer_ltv AS
SELECT
    tenant_id,
    customer_id,
    COUNT(DISTINCT id) AS total_purchases,
    SUM(total_amount) AS total_spent,
    AVG(total_amount) AS avg_order_value,
    MIN(purchased_at) AS first_purchase_date,
    MAX(purchased_at) AS last_purchase_date,
    (
        SUM(total_amount) /
        NULLIF(EXTRACT(DAY FROM MAX(purchased_at) - MIN(purchased_at)), 0)
    ) AS daily_value
FROM purchases
GROUP BY tenant_id, customer_id;

CREATE UNIQUE INDEX idx_customer_ltv ON customer_ltv(tenant_id, customer_id);

-- Refresh schedule (via cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY customer_ltv;

-- Sentiment trends by day (for Qrvey dashboard)
CREATE MATERIALIZED VIEW daily_sentiment_trends AS
SELECT
    tenant_id,
    DATE(created_at) AS date,
    COUNT(*) AS review_count,
    AVG(sentiment_score) AS avg_sentiment,
    AVG(rating) AS avg_rating,
    COUNT(CASE WHEN sentiment_score >= 0.5 THEN 1 END) AS positive_count,
    COUNT(CASE WHEN sentiment_score < 0 THEN 1 END) AS negative_count,
    source
FROM reviews
GROUP BY tenant_id, DATE(created_at), source;

CREATE INDEX idx_daily_sentiment_trends ON daily_sentiment_trends(tenant_id, date DESC);
```

---

## 7. Event-Driven Architecture

### Redis Streams Event Bus

The platform uses **Redis Streams** as the primary event bus for asynchronous inter-agent communication and real-time updates.

#### Event Schema

```python
from typing import TypedDict, Literal, Any
from datetime import datetime

class Event(TypedDict):
    """Base event structure for all system events."""
    event_id: str                # UUID
    event_type: str              # "review.created", "loyalty.awarded", etc.
    tenant_id: str               # Multi-tenant isolation
    timestamp: str               # ISO 8601 timestamp
    source_agent: str            # "orchestrator", "validation_agent", etc.
    correlation_id: str          # For tracing event chains
    payload: dict[str, Any]      # Event-specific data
    metadata: dict[str, Any]     # Optional metadata

# Example event types
ReviewCreatedEvent = {
    "event_type": "review.created",
    "payload": {
        "review_id": "uuid",
        "source": "google",
        "rating": 5,
        "text": "Great service!"
    }
}

LoyaltyAwardedEvent = {
    "event_type": "loyalty.awarded",
    "payload": {
        "customer_id": "uuid",
        "points": 100,
        "reason": "positive_review"
    }
}
```

#### Redis Streams Implementation

```python
import redis.asyncio as redis
import json
from typing import AsyncIterator

class EventBus:
    """Redis Streams-based event bus for inter-agent communication."""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.consumer_group = "review_engine_agents"

    async def publish(self, stream_name: str, event: Event) -> str:
        """Publish event to Redis stream."""
        event_id = await self.redis.xadd(
            stream_name,
            {
                "event_id": event["event_id"],
                "event_type": event["event_type"],
                "tenant_id": event["tenant_id"],
                "timestamp": event["timestamp"],
                "source_agent": event["source_agent"],
                "correlation_id": event["correlation_id"],
                "payload": json.dumps(event["payload"]),
                "metadata": json.dumps(event.get("metadata", {}))
            },
            maxlen=100000  # Keep last 100k events
        )
        return event_id

    async def subscribe(
        self,
        stream_name: str,
        consumer_name: str,
        batch_size: int = 10
    ) -> AsyncIterator[Event]:
        """Subscribe to stream with consumer group."""
        # Create consumer group if not exists
        try:
            await self.redis.xgroup_create(
                stream_name,
                self.consumer_group,
                id="0",
                mkstream=True
            )
        except redis.ResponseError:
            pass  # Group already exists

        while True:
            # Read from stream
            messages = await self.redis.xreadgroup(
                self.consumer_group,
                consumer_name,
                {stream_name: ">"},
                count=batch_size,
                block=5000  # 5 second timeout
            )

            for stream, events in messages:
                for event_id, data in events:
                    event = Event(
                        event_id=data["event_id"],
                        event_type=data["event_type"],
                        tenant_id=data["tenant_id"],
                        timestamp=data["timestamp"],
                        source_agent=data["source_agent"],
                        correlation_id=data["correlation_id"],
                        payload=json.loads(data["payload"]),
                        metadata=json.loads(data.get("metadata", "{}"))
                    )

                    yield event

                    # Acknowledge message
                    await self.redis.xack(stream_name, self.consumer_group, event_id)

# Usage in agents
async def loyalty_agent_listener():
    """Loyalty agent subscribes to review events."""
    event_bus = EventBus()

    async for event in event_bus.subscribe(
        stream_name="reviews",
        consumer_name="loyalty_agent_01"
    ):
        if event["event_type"] == "review.validated":
            payload = event["payload"]

            # Award loyalty points for positive reviews
            if payload["sentiment_score"] >= 0.5 and payload["rating"] >= 4:
                points = calculate_loyalty_points(payload)

                await award_loyalty_points(
                    customer_id=payload["customer_id"],
                    points=points,
                    review_id=payload["review_id"]
                )

                # Publish loyalty awarded event
                await event_bus.publish("loyalty", {
                    "event_id": str(uuid.uuid4()),
                    "event_type": "loyalty.awarded",
                    "tenant_id": event["tenant_id"],
                    "timestamp": datetime.utcnow().isoformat(),
                    "source_agent": "loyalty_agent",
                    "correlation_id": event["correlation_id"],
                    "payload": {
                        "customer_id": payload["customer_id"],
                        "points": points,
                        "review_id": payload["review_id"]
                    }
                })
```

#### Stream Organization

```yaml
Stream Structure:
  reviews:
    - review.created
    - review.validated
    - review.duplicate_detected
    - review.embedding_generated
    - review.sentiment_analyzed

  loyalty:
    - loyalty.awarded
    - loyalty.tier_upgraded
    - loyalty.points_redeemed

  campaigns:
    - campaign.triggered
    - campaign.sent
    - campaign.opened
    - campaign.converted

  inventory:
    - inventory.low_stock_alert
    - inventory.out_of_stock
    - inventory.restocked

  system:
    - agent.started
    - agent.completed
    - agent.failed
    - checkpoint.saved
```

#### Dead Letter Queue

```python
class EventBusWithDLQ(EventBus):
    """Event bus with dead letter queue for failed events."""

    async def process_with_retry(
        self,
        event: Event,
        handler: callable,
        max_retries: int = 3
    ):
        """Process event with automatic retry and DLQ."""
        retry_count = 0

        while retry_count < max_retries:
            try:
                await handler(event)
                return  # Success
            except Exception as e:
                retry_count += 1

                if retry_count >= max_retries:
                    # Move to dead letter queue
                    await self.publish("dlq", {
                        **event,
                        "metadata": {
                            **event.get("metadata", {}),
                            "retry_count": retry_count,
                            "error": str(e),
                            "failed_at": datetime.utcnow().isoformat()
                        }
                    })
                    raise
                else:
                    # Exponential backoff
                    await asyncio.sleep(2 ** retry_count)
```

---

## 8. State Management

### LangGraph Checkpointing

LangGraph's built-in checkpointing provides fault-tolerant state persistence using PostgreSQL.

#### PostgreSQL Checkpointer Configuration

```python
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import AsyncConnectionPool

# Initialize connection pool
pool = AsyncConnectionPool(
    conninfo="postgresql://user:pass@localhost:5432/review_engine",
    min_size=10,
    max_size=50
)

# Create checkpointer
checkpointer = PostgresSaver(pool)

# Compile graph with checkpointing
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_review"],  # Human-in-the-loop nodes
    interrupt_after=["validate"]        # Pause points
)
```

#### Thread-Based Execution

```python
from langgraph.pregel import RunnableConfig

async def process_review_with_checkpoints(review_id: str, review_data: dict):
    """Process review with automatic state persistence."""
    config = RunnableConfig(
        configurable={
            "thread_id": f"review_{review_id}",  # Unique thread ID
            "checkpoint_id": str(uuid.uuid4())    # Checkpoint ID
        }
    )

    # Initial state
    initial_state = ReviewState(
        review_id=review_id,
        source=review_data["source"],
        raw_review=review_data,
        checkpoints=[],
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )

    # Execute graph (automatically checkpoints after each node)
    result = await app.ainvoke(initial_state, config)

    return result
```

#### Resume from Checkpoint

```python
async def resume_failed_review(review_id: str):
    """Resume review processing from last checkpoint."""
    config = RunnableConfig(
        configurable={
            "thread_id": f"review_{review_id}"
        }
    )

    # Get state from last checkpoint
    state_snapshot = await app.aget_state(config)

    if state_snapshot is None:
        raise ValueError(f"No checkpoint found for review {review_id}")

    print(f"Resuming from checkpoint: {state_snapshot.next}")

    # Resume execution
    result = await app.ainvoke(None, config)

    return result
```

#### Checkpoint Visualization

```python
async def visualize_execution_history(review_id: str):
    """Visualize checkpoint history for debugging."""
    config = RunnableConfig(
        configurable={"thread_id": f"review_{review_id}"}
    )

    # Get all checkpoints for thread
    checkpoints = []
    async for checkpoint in app.aget_state_history(config):
        checkpoints.append({
            "checkpoint_id": checkpoint.config["configurable"]["checkpoint_id"],
            "next_node": checkpoint.next,
            "timestamp": checkpoint.created_at,
            "state_preview": {
                "is_valid": checkpoint.values.get("is_valid"),
                "sentiment_score": checkpoint.values.get("sentiment_score"),
                "loyalty_eligible": checkpoint.values.get("loyalty_eligible")
            }
        })

    return checkpoints

# Example output:
# [
#   {
#     "checkpoint_id": "uuid-1",
#     "next_node": "validate",
#     "timestamp": "2025-01-15T10:00:00Z",
#     "state_preview": {"is_valid": None}
#   },
#   {
#     "checkpoint_id": "uuid-2",
#     "next_node": "embed",
#     "timestamp": "2025-01-15T10:00:05Z",
#     "state_preview": {"is_valid": True}
#   }
# ]
```

#### Human-in-the-Loop Integration

```python
# Define graph with human review node
graph = StateGraph(ReviewState)

graph.add_node("flag_review", flag_suspicious_review)
graph.add_node("human_review", human_review_node)  # Pauses here
graph.add_node("finalize", finalize_review)

graph.add_conditional_edges(
    "flag_review",
    lambda state: "human_review" if state["requires_review"] else "finalize"
)

# Compile with interrupt
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_review"]  # Execution pauses here
)

# Process review (will pause at human_review)
config = RunnableConfig(configurable={"thread_id": "review_123"})
result = await app.ainvoke(initial_state, config)

# ... Human reviews in separate UI ...

# Resume after human approval
update_state = {"human_approved": True, "notes": "Verified legitimate"}
result = await app.ainvoke(update_state, config)
```

---

## 9. API Gateway Layer

### FastAPI Integration

The platform exposes a RESTful API using **FastAPI** with automatic OpenAPI documentation.

#### API Architecture

```python
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

app = FastAPI(
    title="Review Engine API",
    version="1.0.0",
    description="LangGraph-powered multi-agent review processing platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],  # Production domains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)

# Security
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validate JWT token and extract user claims."""
    token = credentials.credentials

    try:
        payload = verify_jwt(token)  # Supabase Auth integration
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")

async def require_tenant(user: dict = Depends(get_current_user)) -> str:
    """Extract tenant_id from user claims."""
    tenant_id = user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=403, detail="No tenant access")
    return tenant_id
```

#### Review Ingestion Endpoint

```python
class ReviewCreateRequest(BaseModel):
    source: str = Field(..., description="Review source (google, yelp, facebook)")
    external_id: str = Field(..., description="External review ID")
    rating: int = Field(..., ge=1, le=5, description="Star rating 1-5")
    text: Optional[str] = Field(None, description="Review text content")
    customer_email: Optional[str] = None
    location_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)

class ReviewResponse(BaseModel):
    review_id: str
    status: str  # "processing", "completed", "failed"
    message: str

@app.post("/api/v1/reviews", response_model=ReviewResponse)
async def create_review(
    request: ReviewCreateRequest,
    background_tasks: BackgroundTasks,
    tenant_id: str = Depends(require_tenant)
):
    """
    Ingest a new review and trigger LangGraph processing pipeline.

    The review will be:
    1. Validated for duplicates
    2. Embedded using nomic-embed-text
    3. Sentiment analyzed
    4. Processed for loyalty eligibility
    5. Indexed in Qdrant vector database
    """
    review_id = str(uuid.uuid4())

    # Publish to event bus
    event = Event(
        event_id=str(uuid.uuid4()),
        event_type="review.created",
        tenant_id=tenant_id,
        timestamp=datetime.utcnow().isoformat(),
        source_agent="api_gateway",
        correlation_id=review_id,
        payload={
            "review_id": review_id,
            "source": request.source,
            "external_id": request.external_id,
            "rating": request.rating,
            "text": request.text,
            "customer_email": request.customer_email,
            "location_id": request.location_id,
            "metadata": request.metadata
        }
    )

    event_bus = EventBus()
    await event_bus.publish("reviews", event)

    # Trigger LangGraph processing in background
    background_tasks.add_task(
        process_review_with_checkpoints,
        review_id=review_id,
        review_data=request.dict()
    )

    return ReviewResponse(
        review_id=review_id,
        status="processing",
        message="Review accepted and queued for processing"
    )
```

#### Webhook Endpoints (Synup, Shopify)

```python
@app.post("/api/v1/webhooks/synup")
async def synup_webhook(
    payload: dict,
    tenant_id: str = Depends(require_tenant)
):
    """
    Webhook receiver for Synup review notifications.

    Synup sends reviews in real-time from Google, Yelp, Facebook.
    """
    review_data = ReviewCreateRequest(
        source=payload["source"],
        external_id=payload["review_id"],
        rating=payload["rating"],
        text=payload.get("text"),
        customer_email=payload.get("customer", {}).get("email"),
        location_id=payload.get("location_id"),
        metadata={"synup_webhook_id": payload.get("webhook_id")}
    )

    return await create_review(review_data, BackgroundTasks(), tenant_id)

@app.post("/api/v1/webhooks/shopify/orders")
async def shopify_order_webhook(
    payload: dict,
    tenant_id: str = Depends(require_tenant)
):
    """
    Shopify order webhook for inventory and purchase tracking.

    Triggers:
    - Inventory update agent
    - Customer LTV calculation
    - Low stock alerts
    """
    event = Event(
        event_id=str(uuid.uuid4()),
        event_type="order.created",
        tenant_id=tenant_id,
        timestamp=datetime.utcnow().isoformat(),
        source_agent="shopify_webhook",
        correlation_id=payload["id"],
        payload=payload
    )

    event_bus = EventBus()
    await event_bus.publish("orders", event)

    return {"status": "accepted"}
```

#### Search & Retrieval Endpoint

```python
class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    filters: dict = Field(default_factory=dict, description="Filter criteria")
    top_k: int = Field(default=10, ge=1, le=100)
    search_type: str = Field(default="hybrid", description="semantic, structured, spatial, hybrid")

class SearchResult(BaseModel):
    review_id: str
    text: str
    rating: int
    sentiment_score: float
    source: str
    created_at: str
    relevance_score: float

@app.post("/api/v1/reviews/search", response_model=List[SearchResult])
async def search_reviews(
    request: SearchRequest,
    tenant_id: str = Depends(require_tenant)
):
    """
    Hybrid search across reviews using RAG pipeline.

    Combines:
    - Semantic search (Qdrant vector similarity)
    - Structured search (PostgreSQL filters)
    - Spatial search (H3 geospatial)
    """
    retriever = HybridRetriever(tenant_id=tenant_id)

    results = await retriever.retrieve(
        query=request.query,
        filters={**request.filters, "tenant_id": tenant_id},
        top_k=request.top_k
    )

    return [
        SearchResult(
            review_id=r["review_id"],
            text=r["text"],
            rating=r["rating"],
            sentiment_score=r["sentiment_score"],
            source=r["source"],
            created_at=r["created_at"],
            relevance_score=r["score"]
        )
        for r in results
    ]
```

#### Rate Limiting Middleware

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/reviews")
@limiter.limit("100/minute")  # 100 requests per minute per IP
async def create_review_rate_limited(request: Request, ...):
    ...
```

---

## 10. Qrvey Integration Architecture

### Embedded Dashboard Integration

**Qrvey** provides the unified business intelligence dashboard embedded in the platform's frontend.

#### Data Feed Protocol

```python
class QrveyDataFeed:
    """Real-time data feed to Qrvey analytics platform."""

    def __init__(self, api_key: str, dataset_id: str):
        self.api_key = api_key
        self.dataset_id = dataset_id
        self.base_url = "https://api.qrvey.com/v1"

    async def push_review_metrics(self, tenant_id: str):
        """Push aggregated review metrics to Qrvey."""
        # Query PostgreSQL materialized view
        metrics = await db.fetch_one(f"""
            SELECT
                date,
                review_count,
                avg_sentiment,
                avg_rating,
                positive_count,
                negative_count,
                source
            FROM daily_sentiment_trends
            WHERE tenant_id = $1
                AND date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY date DESC
        """, tenant_id)

        # Transform to Qrvey format
        payload = {
            "dataset_id": self.dataset_id,
            "data": [
                {
                    "date": str(row["date"]),
                    "review_count": row["review_count"],
                    "avg_sentiment": float(row["avg_sentiment"]),
                    "avg_rating": float(row["avg_rating"]),
                    "positive_count": row["positive_count"],
                    "negative_count": row["negative_count"],
                    "source": row["source"]
                }
                for row in metrics
            ]
        }

        # Push to Qrvey
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/datasets/{self.dataset_id}/data",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload
            )
            response.raise_for_status()

    async def push_customer_ltv(self, tenant_id: str):
        """Push customer LTV metrics."""
        ltv_data = await db.fetch_all(f"""
            SELECT
                customer_id,
                total_purchases,
                total_spent,
                avg_order_value,
                daily_value
            FROM customer_ltv
            WHERE tenant_id = $1
        """, tenant_id)

        # Similar transformation and push logic
        ...
```

#### WebSocket Real-Time Updates

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Set

class QrveyWebSocketManager:
    """Manage WebSocket connections for real-time dashboard updates."""

    def __init__(self):
        self.active_connections: dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, tenant_id: str):
        await websocket.accept()
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = set()
        self.active_connections[tenant_id].add(websocket)

    def disconnect(self, websocket: WebSocket, tenant_id: str):
        self.active_connections[tenant_id].discard(websocket)

    async def broadcast_metric_update(self, tenant_id: str, metric: dict):
        """Broadcast metric update to all connected clients for tenant."""
        if tenant_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[tenant_id]:
                try:
                    await connection.send_json(metric)
                except:
                    disconnected.add(connection)

            # Clean up disconnected clients
            self.active_connections[tenant_id] -= disconnected

ws_manager = QrveyWebSocketManager()

@app.websocket("/ws/metrics/{tenant_id}")
async def metrics_websocket(websocket: WebSocket, tenant_id: str):
    """WebSocket endpoint for real-time metric streaming to Qrvey."""
    await ws_manager.connect(websocket, tenant_id)

    try:
        while True:
            # Wait for ping to keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, tenant_id)

# Event listener to broadcast updates
async def review_processed_listener():
    """Listen for review.completed events and broadcast metrics."""
    event_bus = EventBus()

    async for event in event_bus.subscribe("reviews", "qrvey_broadcaster"):
        if event["event_type"] == "review.sentiment_analyzed":
            payload = event["payload"]

            # Calculate updated metrics
            metric_update = {
                "type": "sentiment_update",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "sentiment_score": payload["sentiment_score"],
                    "rating": payload["rating"],
                    "source": payload["source"]
                }
            }

            # Broadcast to connected Qrvey dashboards
            await ws_manager.broadcast_metric_update(
                tenant_id=event["tenant_id"],
                metric=metric_update
            )
```

#### Qrvey Dataset Schemas

```yaml
# Sentiment Trends Dataset
sentiment_trends:
  fields:
    - name: date
      type: date
      primary_key: true
    - name: review_count
      type: integer
    - name: avg_sentiment
      type: decimal
    - name: avg_rating
      type: decimal
    - name: positive_count
      type: integer
    - name: negative_count
      type: integer
    - name: source
      type: string

  refresh_schedule: "0 * * * *"  # Hourly

# Customer LTV Dataset
customer_ltv:
  fields:
    - name: customer_id
      type: string
      primary_key: true
    - name: total_purchases
      type: integer
    - name: total_spent
      type: decimal
    - name: avg_order_value
      type: decimal
    - name: daily_value
      type: decimal

  refresh_schedule: "0 0 * * *"  # Daily

# Inventory Alerts Dataset
inventory_alerts:
  fields:
    - name: product_id
      type: string
    - name: sku
      type: string
    - name: current_quantity
      type: integer
    - name: threshold
      type: integer
    - name: status
      type: string  # "low_stock", "out_of_stock"
    - name: last_updated
      type: timestamp

  refresh_schedule: "*/15 * * * *"  # Every 15 minutes
```

---

## 11. Deployment Architecture

### Kubernetes Manifests

The platform deploys on **Kubernetes** for horizontal scalability and high availability.

#### Namespace and ConfigMap

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: review-engine
  labels:
    app: review-engine

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: review-engine-config
  namespace: review-engine
data:
  DATABASE_HOST: "postgres-service.review-engine.svc.cluster.local"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "review_engine"
  REDIS_HOST: "redis-service.review-engine.svc.cluster.local"
  REDIS_PORT: "6379"
  QDRANT_HOST: "qdrant-service.review-engine.svc.cluster.local"
  QDRANT_PORT: "6333"
  LITELLM_URL: "http://litellm-service.review-engine.svc.cluster.local:4000"
  LOG_LEVEL: "INFO"
```

#### Secrets Management

```yaml
# secrets.yaml (managed via sealed-secrets or external-secrets)
apiVersion: v1
kind: Secret
metadata:
  name: review-engine-secrets
  namespace: review-engine
type: Opaque
stringData:
  DATABASE_PASSWORD: "<encrypted>"
  SUPABASE_JWT_SECRET: "<encrypted>"
  OPENAI_API_KEY: "<encrypted>"
  ANTHROPIC_API_KEY: "<encrypted>"
  QRVEY_API_KEY: "<encrypted>"
  SHOPIFY_WEBHOOK_SECRET: "<encrypted>"
```

#### LangGraph Orchestrator Deployment

```yaml
# orchestrator-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: langgraph-orchestrator
  namespace: review-engine
spec:
  replicas: 3  # High availability
  selector:
    matchLabels:
      app: orchestrator
  template:
    metadata:
      labels:
        app: orchestrator
    spec:
      containers:
      - name: orchestrator
        image: review-engine/orchestrator:1.0.0
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: DATABASE_URL
          value: "postgresql://$(DATABASE_USER):$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: review-engine-secrets
              key: DATABASE_PASSWORD
        envFrom:
        - configMapRef:
            name: review-engine-config
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: orchestrator-service
  namespace: review-engine
spec:
  selector:
    app: orchestrator
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### vLLM GPU Deployment

```yaml
# vllm-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-inference
  namespace: review-engine
spec:
  replicas: 2  # GPU node pool
  selector:
    matchLabels:
      app: vllm
  template:
    metadata:
      labels:
        app: vllm
    spec:
      nodeSelector:
        cloud.google.com/gke-accelerator: nvidia-l4  # L4 GPU nodes
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        args:
        - --model
        - NousResearch/Hermes-3-Llama-3.1-8B-AWQ
        - --quantization
        - awq
        - --dtype
        - half
        - --max-model-len
        - "8192"
        - --gpu-memory-utilization
        - "0.9"
        ports:
        - containerPort: 8000
        resources:
          limits:
            nvidia.com/gpu: 1  # 1 GPU per pod
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0"

---
apiVersion: v1
kind: Service
metadata:
  name: vllm-service
  namespace: review-engine
spec:
  selector:
    app: vllm
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
```

#### PostgreSQL StatefulSet

```yaml
# postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: review-engine
spec:
  serviceName: postgres-service
  replicas: 3  # Primary + 2 replicas
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: pgvector/pgvector:pg16
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: review_engine
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: review-engine-secrets
              key: DATABASE_PASSWORD
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "ssd-retain"
      resources:
        requests:
          storage: 100Gi
```

#### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orchestrator-hpa
  namespace: review-engine
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: langgraph-orchestrator
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50  # Scale up 50% at a time
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Pods
        value: 1  # Scale down 1 pod at a time
        periodSeconds: 60
```

#### Ingress (NGINX)

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: review-engine-ingress
  namespace: review-engine
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.reviewengine.com
    secretName: api-tls-cert
  rules:
  - host: api.reviewengine.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: orchestrator-service
            port:
              number: 8000
```

---

## 12. Observability & Monitoring

### LangSmith Integration

**LangSmith** provides comprehensive tracing and debugging for LangGraph agents.

#### LangSmith Configuration

```python
import os
from langsmith import Client

# Configure LangSmith
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGCHAIN_PROJECT"] = "review-engine-production"

# Client for custom instrumentation
langsmith_client = Client()

# Automatic tracing for all LangGraph executions
app = graph.compile(
    checkpointer=checkpointer,
    debug=True  # Enables detailed LangSmith traces
)
```

#### Custom Trace Annotations

```python
from langsmith import traceable

@traceable(name="validate_review", run_type="chain")
async def validation_agent(state: ReviewState) -> ReviewState:
    """Validation agent with LangSmith tracing."""
    review_id = state["review_id"]

    # Check for duplicates
    is_duplicate = await check_duplicate(
        external_id=state["raw_review"]["external_id"],
        source=state["source"]
    )

    # Annotate trace with custom metadata
    langsmith_client.update_run(
        run_id=langsmith_client.get_current_run_tree().id,
        extra={
            "review_id": review_id,
            "is_duplicate": is_duplicate,
            "source": state["source"]
        }
    )

    return {
        **state,
        "is_valid": not is_duplicate,
        "is_duplicate": is_duplicate
    }
```

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Response

# Define metrics
reviews_processed = Counter(
    "reviews_processed_total",
    "Total reviews processed",
    ["source", "status"]
)

review_processing_duration = Histogram(
    "review_processing_duration_seconds",
    "Time to process review",
    ["agent"]
)

active_langgraph_threads = Gauge(
    "active_langgraph_threads",
    "Number of active LangGraph execution threads"
)

llm_api_calls = Counter(
    "llm_api_calls_total",
    "Total LLM API calls",
    ["model", "provider"]
)

# Instrumentation
@review_processing_duration.labels(agent="validation").time()
async def validation_agent(state: ReviewState):
    ...
    reviews_processed.labels(source=state["source"], status="validated").inc()
    ...

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### Grafana Dashboards

```yaml
# Grafana dashboard JSON snippet
{
  "dashboard": {
    "title": "Review Engine - LangGraph Agents",
    "panels": [
      {
        "title": "Reviews Processed (Rate)",
        "targets": [{
          "expr": "rate(reviews_processed_total[5m])"
        }]
      },
      {
        "title": "Agent Processing Duration (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, review_processing_duration_seconds_bucket)"
        }]
      },
      {
        "title": "Active LangGraph Threads",
        "targets": [{
          "expr": "active_langgraph_threads"
        }]
      },
      {
        "title": "LLM API Call Distribution",
        "targets": [{
          "expr": "sum by (model, provider) (llm_api_calls_total)"
        }]
      }
    ]
  }
}
```

### Logging Strategy

```python
import structlog
from pythonjsonlogger import jsonlogger

# Structured logging configuration
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage in agents
async def embedding_agent(state: ReviewState):
    logger.info(
        "embedding_generation_started",
        review_id=state["review_id"],
        text_length=len(state.get("raw_review", {}).get("text", "")),
        model="nomic-embed-text-v1.5"
    )

    try:
        embedding = await generate_embedding(state["raw_review"]["text"])

        logger.info(
            "embedding_generation_completed",
            review_id=state["review_id"],
            embedding_dimensions=len(embedding)
        )

        return {**state, "embedding": embedding}

    except Exception as e:
        logger.error(
            "embedding_generation_failed",
            review_id=state["review_id"],
            error=str(e),
            exc_info=True
        )
        raise
```

---

## 13. Performance Optimization

### Caching Strategy

```python
from redis import asyncio as aioredis
import pickle
from functools import wraps

class CacheManager:
    """Redis-based caching for expensive operations."""

    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url)

    def cached(self, ttl: int = 3600):
        """Decorator for caching function results."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = f"{func.__name__}:{hash((args, tuple(kwargs.items())))}"

                # Try to get from cache
                cached_result = await self.redis.get(cache_key)
                if cached_result:
                    return pickle.loads(cached_result)

                # Execute function
                result = await func(*args, **kwargs)

                # Store in cache
                await self.redis.setex(
                    cache_key,
                    ttl,
                    pickle.dumps(result)
                )

                return result
            return wrapper
        return decorator

cache = CacheManager("redis://localhost:6379")

# Usage
@cache.cached(ttl=1800)  # Cache for 30 minutes
async def get_customer_ltv(customer_id: str) -> float:
    """Expensive LTV calculation."""
    return await db.fetch_val("""
        SELECT SUM(total_amount) FROM purchases
        WHERE customer_id = $1
    """, customer_id)
```

### Database Query Optimization

```sql
-- Partition large tables by date
CREATE TABLE reviews_partitioned (
    LIKE reviews INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE reviews_2025_01 PARTITION OF reviews_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Covering indexes for common queries
CREATE INDEX idx_reviews_search_covering ON reviews (
    tenant_id, created_at DESC, sentiment_score
) INCLUDE (text, rating, source);

-- Partial indexes for active data
CREATE INDEX idx_reviews_recent ON reviews (created_at DESC)
    WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';
```

### Connection Pooling

```python
from psycopg_pool import AsyncConnectionPool

# PostgreSQL connection pool
pg_pool = AsyncConnectionPool(
    conninfo="postgresql://user:pass@localhost/review_engine",
    min_size=20,    # Minimum connections
    max_size=100,   # Maximum connections
    max_idle=300,   # Max idle time (seconds)
    max_lifetime=3600  # Max connection lifetime
)

# Qdrant connection pool
from qdrant_client import AsyncQdrantClient
qdrant_client = AsyncQdrantClient(
    url="http://localhost:6333",
    timeout=30,
    grpc_port=6334,
    prefer_grpc=True  # gRPC is 40% faster than HTTP
)
```

### Batch Processing

```python
async def batch_embed_reviews(review_ids: list[str], batch_size: int = 32):
    """Batch embedding generation for efficiency."""
    embeddings = []

    for i in range(0, len(review_ids), batch_size):
        batch = review_ids[i:i + batch_size]

        # Fetch texts
        texts = await db.fetch_all("""
            SELECT id, text FROM reviews WHERE id = ANY($1)
        """, batch)

        # Batch embedding generation (single API call)
        batch_embeddings = await embedding_model.embed_batch([t["text"] for t in texts])

        # Batch upsert to Qdrant
        await qdrant_client.upsert(
            collection_name="reviews",
            points=[
                {
                    "id": text["id"],
                    "vector": embedding,
                    "payload": {"text": text["text"]}
                }
                for text, embedding in zip(texts, batch_embeddings)
            ]
        )

        embeddings.extend(batch_embeddings)

    return embeddings
```

---

## 14. Scaling Strategy

### Horizontal Scaling

```yaml
# Kubernetes HPA with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orchestrator-custom-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: langgraph-orchestrator
  minReplicas: 3
  maxReplicas: 50
  metrics:
  # CPU-based scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

  # Custom metric: Redis Streams lag
  - type: External
    external:
      metric:
        name: redis_stream_lag
        selector:
          matchLabels:
            stream: reviews
      target:
        type: AverageValue
        averageValue: "1000"  # Scale if lag > 1000 messages
```

### Load Balancing Strategy

```python
class RoundRobinLLMRouter:
    """Load balance requests across multiple vLLM instances."""

    def __init__(self, endpoints: list[str]):
        self.endpoints = endpoints
        self.current_index = 0

    async def route_request(self, messages: list[dict]) -> str:
        """Round-robin routing to vLLM endpoints."""
        endpoint = self.endpoints[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.endpoints)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{endpoint}/v1/chat/completions",
                json={"messages": messages, "model": "hermes-3-8b"}
            )
            return response.json()["choices"][0]["message"]["content"]

# Usage
llm_router = RoundRobinLLMRouter([
    "http://vllm-instance-1:8000",
    "http://vllm-instance-2:8000",
    "http://vllm-instance-3:8000"
])
```

### Database Read Replicas

```python
class DatabaseRouter:
    """Route queries to primary or read replicas."""

    def __init__(self, primary_url: str, replica_urls: list[str]):
        self.primary_pool = AsyncConnectionPool(primary_url)
        self.replica_pools = [
            AsyncConnectionPool(url) for url in replica_urls
        ]
        self.replica_index = 0

    def get_connection(self, read_only: bool = False):
        """Get connection from appropriate pool."""
        if read_only and self.replica_pools:
            pool = self.replica_pools[self.replica_index]
            self.replica_index = (self.replica_index + 1) % len(self.replica_pools)
            return pool.connection()
        else:
            return self.primary_pool.connection()

# Usage
db_router = DatabaseRouter(
    primary_url="postgresql://primary:5432/review_engine",
    replica_urls=[
        "postgresql://replica1:5432/review_engine",
        "postgresql://replica2:5432/review_engine"
    ]
)

# Read queries use replicas
async with db_router.get_connection(read_only=True) as conn:
    reviews = await conn.fetch("SELECT * FROM reviews WHERE tenant_id = $1", tenant_id)

# Write queries use primary
async with db_router.get_connection(read_only=False) as conn:
    await conn.execute("INSERT INTO reviews (...) VALUES (...)")
```

---

## 15. Disaster Recovery

### Backup Strategy

```yaml
# CronJob for automated PostgreSQL backups
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: review-engine
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres-service -U postgres review_engine | \
              gzip > /backup/review_engine_$(date +%Y%m%d_%H%M%S).sql.gz

              # Upload to S3
              aws s3 cp /backup/*.sql.gz s3://review-engine-backups/$(date +%Y/%m/%d)/
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: review-engine-secrets
                  key: DATABASE_PASSWORD
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup-storage
            emptyDir: {}
```

### Point-in-Time Recovery

```sql
-- Enable WAL archiving for PITR
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'aws s3 cp %p s3://review-engine-wal/%f';

-- Restore to specific point in time
pg_restore -h localhost -U postgres -d review_engine \
    --clean --if-exists \
    backup_file.sql.gz

-- Apply WAL files up to target time
restore_command = 'aws s3 cp s3://review-engine-wal/%f %p'
recovery_target_time = '2025-01-15 10:00:00'
```

---

## Conclusion

This architecture document provides comprehensive technical guidance for implementing the Review Engine as a **LangGraph-native multi-agent system**. Key architectural decisions include:

1. **LangGraph StateGraph** for agent orchestration with PostgreSQL checkpointing
2. **Hybrid LLM strategy** (85% on-prem via Ollama/vLLM, 15% cloud)
3. **Hybrid RAG pipeline** with Reciprocal Rank Fusion across semantic, SQL, and spatial search
4. **PostgreSQL RLS** for robust multi-tenant isolation
5. **Redis Streams** event bus for asynchronous agent communication
6. **Kubernetes** deployment with horizontal autoscaling
7. **Qrvey** embedded dashboard with real-time WebSocket feeds
8. **LangSmith + Prometheus + Grafana** observability stack

The modular agent design enables incremental development (18-week roadmap) while maintaining production-grade security, scalability, and reliability.

For implementation details, refer to:
- [README.md](../README.md) - Quick start and overview
- [SECURITY.md](SECURITY.md) - Security architecture
- [DOCUMENTATION.md](DOCUMENTATION.md) - Documentation standards

**Next Steps**: Begin Week 1 implementation with core agent scaffolding and Ollama deployment.
    COUNT(*) FILTER (WHERE rating >= 4) AS positive_count,
    COUNT(*) FILTER (WHERE rating <= 2) AS negative_count,
    array_agg(DISTINCT source) AS sources
FROM reviews
WHERE processed_at IS NOT NULL
GROUP BY tenant_id, DATE(created_at);

CREATE INDEX idx_daily_trends ON daily_sentiment_trends(tenant_id, date DESC);
```

---

## Event-Driven Architecture

### Redis Streams Configuration

```python
# agents/core/event_bus.py
import redis.asyncio as aioredis
from typing import Dict, Callable
import asyncio

class EventBus:
    """Redis Streams-based event bus for inter-agent communication."""

    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        self.consumers = {}

    async def publish(
        self,
        stream_name: str,
        event_type: str,
        data: Dict
    ) -> str:
        """Publish event to stream."""
        event_id = await self.redis.xadd(
            f"events:{stream_name}",
            {
                "event_type": event_type,
                "data": json.dumps(data),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        logger.info(
            "Event published",
            stream=stream_name,
            event_type=event_type,
            event_id=event_id
        )

        return event_id

    async def subscribe(
        self,
        stream_name: str,
        consumer_group: str,
        consumer_name: str,
        handler: Callable
    ):
        """Subscribe to event stream with consumer group."""

        # Create consumer group if not exists
        try:
            await self.redis.xgroup_create(
                f"events:{stream_name}",
                consumer_group,
                id="0",
                mkstream=True
            )
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

        # Start consuming
        while True:
            try:
                # Read new events (blocking, timeout 5s)
                events = await self.redis.xreadgroup(
                    consumer_group,
                    consumer_name,
                    {f"events:{stream_name}": ">"},
                    count=10,
                    block=5000
                )

                for stream, messages in events:
                    for message_id, data in messages:
                        await self.process_event(
                            stream.decode(),
                            message_id.decode(),
                            data,
                            consumer_group,
                            handler
                        )

            except Exception as e:
                logger.error("Event consumption failed", error=str(e))
                await asyncio.sleep(1)

    async def process_event(
        self,
        stream: str,
        message_id: str,
        data: Dict,
        consumer_group: str,
        handler: Callable
    ):
        """Process individual event and ACK on success."""
        try:
            event_type = data[b"event_type"].decode()
            event_data = json.loads(data[b"data"].decode())

            # Call handler
            await handler(event_type, event_data)

            # Acknowledge message
            await self.redis.xack(stream, consumer_group, message_id)

            logger.info(
                "Event processed",
                stream=stream,
                event_type=event_type,
                message_id=message_id
            )

        except Exception as e:
            logger.error(
                "Event processing failed",
                stream=stream,
                message_id=message_id,
                error=str(e)
            )
            # Message will be re-delivered after timeout

# Usage example
event_bus = EventBus(redis_client)

# Publish event
await event_bus.publish(
    stream_name="review_processed",
    event_type="review.analyzed",
    data={
        "review_id": "uuid-123",
        "sentiment_score": 4.8,
        "rating": 5,
        "customer_email": "john@example.com"
    }
)

# Subscribe to events
async def handle_review_analyzed(event_type: str, data: Dict):
    """Handle review analyzed events."""
    if data["rating"] >= 4 and data["sentiment_score"] >= 4.0:
        # Trigger loyalty workflow
        await loyalty_agent.award_points(
            customer_email=data["customer_email"],
            points=100
        )

await event_bus.subscribe(
    stream_name="review_processed",
    consumer_group="automation_pipeline",
    consumer_name="worker_1",
    handler=handle_review_analyzed
)
```

### Event Schema Definitions

```python
# agents/shared/schemas/events.py
from pydantic import BaseModel
from datetime import datetime

class BaseEvent(BaseModel):
    """Base event schema."""
    event_id: str
    event_type: str
    timestamp: datetime
    tenant_id: str

class ReviewAnalyzedEvent(BaseEvent):
    """Published when review analysis completes."""
    event_type: str = "review.analyzed"
    review_id: str
    rating: int
    sentiment_score: float
    themes: list[str]
    h3_index: str
    customer_email: str

class ProductPurchasedEvent(BaseEvent):
    """Published when customer makes purchase."""
    event_type: str = "product.purchased"
    order_id: str
    customer_id: str
    product_id: str
    quantity: int
    total_amount: float

class LoyaltyPointsAwardedEvent(BaseEvent):
    """Published when loyalty points are awarded."""
    event_type: str = "loyalty.points_awarded"
    customer_email: str
    points: int
    reason: str
    new_balance: int

class CampaignTriggeredEvent(BaseEvent):
    """Published when marketing campaign is triggered."""
    event_type: str = "marketing.campaign_triggered"
    customer_email: str
    campaign_id: str
    campaign_name: str
```

---

Due to length constraints, I'll complete the ARCHITECTURE.md file in the next message. The remaining sections will cover:

- State Management (LangGraph checkpointing)
- API Gateway Layer
- Qrvey Integration Architecture
- Deployment Architecture (Kubernetes)
- Observability & Monitoring
- Performance Optimization
- Scaling Strategy

Would you like me to continue with the complete ARCHITECTURE.md file?