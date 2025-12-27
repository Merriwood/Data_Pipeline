# Review Engine: NL Interface Design Specification
## Complete Implementation Guide with Six Design Pillars

---

## Executive Summary

The Natural Language Analytics Interface is the **primary way users interact** with the Review Engine platform. Rather than menu-driven or form-based navigation, users simply **ask questions** and the system delivers structured, intelligent answers.

This design is grounded in **six fundamental principles** that guide every architectural and UI decision:

1. **Craft Above All** - Excellence in accuracy and visual refinement
2. **Empathy** - Adaptive responses for different user types
3. **Focus** - Single input area; everything else supports it
4. **Impute** - Visual signals communicate quality and intelligence
5. **Friendliness** - Conversational, intuitive interaction
6. **Simplicity Through Metaphor** - "Talking to a data analyst" as core mental model

---

## Core Design Principles in Practice

### 1. CRAFT ABOVE ALL
**Excellence in every detail—not just surface polish**

**Implementation:**
- Parse accuracy target: >95%
- Response time target: <2s (p90)
- Zero hallucinated data (all claims backed by query results)
- Reasoning shown, not hidden (users see "how" system understood)

**Example:**
```
User: "Westside was bad last week"

System Reasoning (shown transparently):
├─ Domain: communities + anomaly (82% confident)
├─ Action: explain decline
├─ Timeframe: last_week
└─ Interpretation: "Examining Westside community performance over past 7 days"
```

---

### 2. EMPATHY
**Understanding user mental models and needs**

**User Archetypes & Response Styles:**

#### Executive (Headline-Driven)
- **Wants:** Key number, trend, one key insight
- **Response:** 1 headline + 1 supporting insight + 1 follow-up option
- **Example:** 
  ```
  "Sentiment up 5% week-over-week to 4.65⭐
   Downtown leading at 8.7/10
   Want to know what changed?"
  ```

#### Analyst (Precision-Focused)
- **Wants:** Exact numbers, methods, confidence levels
- **Response:** Data + methodology + supporting insights + caveats
- **Example:**
  ```
  "Analyzed 436 reviews over 7 days (confidence: 94%)
   
   Sentiment Distribution:
   - Positive: 68% (↑5% vs previous week)
   - Neutral: 22% (↓2%)
   - Negative: 10% (↓3%)
   
   Method: Gemini Pro sentiment classification on review text
   Confidence: 94% (based on training validation)
   Data Points: 436 records analyzed"
  ```

#### Manager (Action-Oriented)
- **Wants:** Problem → Root cause → Recommendation
- **Response:** Situation + root causes + recommended actions + success metrics
- **Example:**
  ```
  "Westside Declining (-8.7% sentiment)
   
   Root Causes:
   1. Parking availability (36% of complaints)
   2. Response time (28% of complaints)
   3. Staffing (23% of complaints)
   
   Recommended Actions (by impact):
   - [HIGH] Increase staffing (+40% recovery)
   - [MEDIUM] Improve parking partnership (+35% recovery)
   - [LOW] Reset wait time expectations (+10% recovery)"
  ```

#### Casual User (Plain English)
- **Wants:** Simple summary, one key insight, next step
- **Response:** Conversational, no jargon, relatable tone
- **Example:**
  ```
  "You're doing great overall! 68% of people are really happy with you.
   
   One thing to watch: Westside location is getting feedback about
   parking and wait times. Your Downtown spot though? Customers can't
   say enough good things!
   
   Want to know more about the parking situation?"
  ```

**Implementation:**
- Detect user archetype from: query history, profile settings, interaction patterns
- Adapt response format, depth, tone automatically
- Never force technical jargon on casual users; never oversimplify for analysts

---

### 3. FOCUS
**Clarity of purpose in every interaction**

**Single Primary Action: The NL Input**

The chat input is THE interface. Everything else supports it.

```
Attention Distribution:
├─ Input Area: 60% (hero element)
├─ Contextual Suggestions: 20% (discovery)
├─ Results: 15% (destination)
└─ Metadata: 5% (supporting detail)
```

**Visual Hierarchy:**
```
┌─────────────────────────────────────────┐
│  Input Area (Hero size, prominent)      │
│  ┌───────────────────────────────────┐  │
│  │ Ask about reviews, sentiment...   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Contextual Suggestions (4 max, subtle) │
│  ┌─────────────────────────────────┐   │
│  │ Try: Show Westside trends       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Results (Auto-refreshing)              │
│  [Previous conversation messages]       │
│                                         │
│  Metadata (Tiny, gray)                  │
│  "Analyzed 156 data points in 847ms"   │
└─────────────────────────────────────────┘
```

**Anti-Patterns to Avoid:**
- ❌ Menu navigation (breaks metaphor)
- ❌ Multiple input modes (unified NL only)
- ❌ Toolbar of functions (context matters, not tools)
- ❌ Overwhelming suggestion density (4 max)

---

### 4. IMPUTE (Presentation Signals Quality)
**Visual design communicates capability and trustworthiness**

**Signal Quality Through:**

#### Typography Hierarchy
```
Headline:      24px, Bold, Blue-900       (signal importance)
Key Data:      Monospace, 16px, Bold      (convey precision)
Supporting:    14px, Gray-700             (secondary info)
Metadata:      12px, Gray-600             (subtle context)
```

#### Color Psychology
```
Blue (#007AFF)      → Trust, analysis, primary actions
Green (#34C759)     → Positive trends, increases
Red (#FF3B30)       → Warnings, negative, decreases
Gray (#8E8E93)      → Context, secondary, inactive
Orange (#FF9500)    → Caution, neutral sentiment
```

#### Micro-interactions
```
Smooth Transitions    → Precision (no jank = quality)
Loading States        → Processing shown, not hidden
Success Animations    → Celebrate results
Hover States          → Suggest interactivity
```

#### Spacing & Rhythm
```
Generous Padding      → Premium feel
Consistent Grid       → Precision
White Space           → Clarity
Breathing Room        → Thoughtfulness
```

**Example: Confidence Badge**
```
Visual: "94% confident"
├─ Color: Green (trust)
├─ Icon: Checkmark (affirmation)
├─ Placement: Subtle, metadata area (not pushy)
└─ Meaning: "This answer is backed by data analysis"
```

---

### 5. FRIENDLINESS (Intuitive Use)
**Interface should feel like talking to a knowledgeable colleague**

**Conversational Patterns:**

```
User: "What's killing us in Westside?"

System (understands informally phrased pain):
├─ Understanding Signal: "Analyzing Westside performance issues..."
├─ Direct Answer: "3 main problems found"
├─ Supporting Data: [visualization of each issue]
├─ Insight Offering: "Want to dig deeper into parking?"
└─ Action Option: "Should I flag this for team review?"
```

**Language Design Guidelines:**

| ✓ Good | ✗ Avoid |
|--------|---------|
| "You earned 500 points" | "500 points were earned" |
| "I'm 87% confident..." | "87% certainty factor" |
| "Would you like to..." | "You should..." |
| "because sentiment is up 12%" | "due to delta_sentiment(+0.12)" |
| "That's concerning" | "Alert: threshold exceeded" |
| "Let me show you the breakdown" | "Executing subordinate query" |

**Error Recovery (Friendliness in Failure):**

```
User: "show me teh reviews" (misspelling)

System (recovers gracefully):
├─ Acknowledges: "Looking for reviews? I found them!"
├─ Doesn't correct: (not condescending)
└─ Delivers result: [review data]

User: "What about last fortnite?" (nonsensical timeframe)

System (gentle disambiguation):
├─ Acknowledges uncertainty: "I'm not sure what timeframe you mean"
├─ Suggests options: "Did you mean: last week, last month, or all-time?"
└─ Waits for clarification: (no assumptions)
```

**Follow-up Suggestions (Anticipate Next Question):**
```
After user queries sentiment by community:

Suggested Follow-ups:
1. "Drill into the negative mentions"
2. "Show me the trend over time"
3. "Which platform leads here?"
```

---

### 6. SIMPLICITY THROUGH METAPHOR
**Use familiar mental models to reduce cognitive load**

**Core Metaphor: "Conversation with Your Data Analyst"**

The interface should feel like:
```
Not this (Technical Interface):
Query Parser → Intent Classifier → Query Router → Database 
→ Post-processor → Template Renderer

But this (Natural Conversation):
"Hey, what happened with Downtown last week?"
    ↓ (listens, recalls context from earlier questions)
"Good question. Let me check... 
 [pulls up data] 
 You had 12 more reviews than usual, and sentiment was up to 8.7.
 Want to see the breakdown?"
    ↓ (offers agency in next step)
[Shows visualization]
```

**Implementation:**
- **Conversational Pacing:** Not instant (feels thoughtless), not slow (feels broken)
  - Target: Show "thinking" for 0.5-1.5s, then deliver result
- **Admission of Uncertainty:** Honest about limitations
  - "I'm 87% confident" (not false precision)
  - "Based on recent data" (temporal caveat)
- **Context Memory:** Remembers earlier questions
  - User: "What about it?" → System knows "it" = last-mentioned metric
- **Natural Follow-ups:** Suggests next logical questions
  - No "want to export this?" (boring)
  - Yes "See the trend over time?" (natural next step)
- **Visual Focus:** Highlights what matters
  - Not all data equally prominent
  - Anomalies and trends emphasized

---

## Technical Interface Specification

### API Contract

```typescript
// Frontend → Backend
POST /api/analytics/query
{
  query: string                    // "What themes in Westside?"
  context: {
    conversationId: string         // For memory/history
    userId: string                 // For user archetype detection
    tenantId: string              // Multi-tenant isolation
    previousQueries?: string[]    // Context window (last 5)
  }
}

// Backend → Frontend
{
  // Original query interpretation
  interpretation: {
    domain: "themes" | "sentiment" | ...
    action: "summarize" | "drill_down" | ...
    filters: { location, platform, timeframe, keywords }
    confidence: 0.87
    reasoning: "Detected as theme query with filtering..."
  }
  
  // Actual data
  data: {
    primary: [
      { theme: "Parking", mentions: 45, sentiment: 6.2 },
      { theme: "Staffing", mentions: 34, sentiment: 7.1 },
      ...
    ]
    supporting: {
      dataPoints: 156,
      timeRange: "2025-12-15 to 2025-12-22",
      updateFrequency: "real-time"
    }
  }
  
  // Insights (not raw data)
  insights: {
    summary: "Parking is the #1 complaint in Westside",
    highlights: [
      "45 mentions (28% of all feedback)",
      "Average sentiment 6.2/10 (below target 7.5)",
      "Trending worse (-0.3 from last week)"
    ],
    anomalies: [
      "Parking complaints increased 45% week-over-week"
    ],
    recommendations: [
      "Evaluate valet service quality",
      "Consider paid parking partnership",
      "Monitor for further decline"
    ]
  }
  
  // Guide next interaction
  followUps: {
    suggested: [
      "Show me all negative parking mentions",
      "Compare to Downtown parking sentiment",
      "What did people say exactly?"
    ]
    contexts: [
      "drill_down",
      "comparison",
      "drill_down"
    ]
  }
}
```

### Intent Classification Taxonomy

```python
class QueryIntent:
    domain: Literal[
        "sentiment",      # Mood/rating analysis
        "themes",         # Topic/keyword extraction
        "communities",    # Geospatial (H3) analysis
        "platforms",      # Channel comparison (Google/Yelp/etc)
        "loyalty",        # Points/rewards metrics
        "time_series",    # Trend analysis
        "comparison",     # A vs B analysis
        "anomaly",        # Outlier detection (what changed?)
        "forecast"        # Predictive (will trends continue?)
    ]
    
    action: Literal[
        "summarize",      # High-level overview (default)
        "drill_down",     # Detailed breakdown
        "compare",        # Side-by-side comparison
        "trend",          # Show over time
        "rank",           # Top/bottom lists
        "calculate",      # Math operations (sum, avg, etc)
        "predict"         # Future extrapolation
    ]
    
    filters: {
        location?: str                      # "Downtown", "Westside"
        platform?: str                      # "Google", "Yelp"
        timeframe?: str                     # "last_week", "last_30d"
        sentiment_range?: (min, max)        # Rating filters
        keywords?: List[str]                # "parking", "staff"
    }
    
    confidence: float                       # 0.0-1.0 (never 1.0)
```

---

## Example Conversations

### Scenario 1: Executive Query
```
Executive: "How are we doing?"

System Response:
┌─────────────────────────────────────────────┐
│ ✓ Overall Health: Strong (up 8% WoW)        │
│                                             │
│ KEY METRICS:                                │
│ Reviews    436  ↑12%  (4.65⭐ avg)          │
│ Sentiment  68%  ↑5%   (positive)            │
│ Loyalty    4.8k pts  (↑12% MoM)             │
│ Communities 4 active (Downtown leading)    │
│                                             │
│ [Sparkline Chart: Trending Up]              │
│                                             │
│ ▶ Want to drill into any area?             │
│   • See what changed                        │
│   • Compare communities                     │
│   • Check on loyalty program                │
│                                             │
│ Analyzed 436 data points in 847ms           │
│ Confidence: 96%                             │
└─────────────────────────────────────────────┘
```

### Scenario 2: Analyst Query
```
Analyst: "What's our sentiment distribution by community 
          for reviews mentioning parking, last 30 days?"

System Response:
┌─────────────────────────────────────────────┐
│ Query Interpretation:                       │
│ ├─ Domain: sentiment + themes              │
│ ├─ Filter: keyword="parking", days=30      │
│ ├─ Grouping: by community (H3)             │
│ └─ Confidence: 94%                         │
│                                             │
│ RESULTS: 23 reviews matching               │
│                                             │
│ Community    Count  Avg Sentiment  Trend   │
│ ─────────────────────────────────────────  │
│ Downtown     8      7.1 ⭐⭐⭐⭐⭐⭐⭐    ↓   │
│ Midtown      7      7.8 ⭐⭐⭐⭐⭐⭐⭐⭐   →   │
│ Uptown       5      8.4 ⭐⭐⭐⭐⭐⭐⭐⭐⭐  ↑   │
│ Westside     3      6.2 ⭐⭐⭐⭐⭐⭐      ↓↓  │
│                                             │
│ [Distribution Chart]                       │
│                                             │
│ Method: Gemini Pro sentiment classification │
│ Data Points: 23 reviews, analyzed 847ms    │
│ Methodology: https://docs/sentiment-model  │
│                                             │
│ 💡 Note: Westside sentiment declining.    │
│    Consider investigating cause.            │
│                                             │
│ Follow-up Options:                         │
│ • Show actual parking complaints           │
│ • Compare to prior month                   │
│ • Check other location-based themes        │
└─────────────────────────────────────────────┘
```

### Scenario 3: Manager Query
```
Manager: "Why are Westside reviews dropping?"

System Response:
┌─────────────────────────────────────────────┐
│ 📉 Westside Sentiment Declining              │
│ From: 4.6⭐ (30d ago)                        │
│ To: 4.2⭐ (now)                              │
│ Change: -0.4 (-8.7%)                        │
│                                             │
│ ROOT CAUSES (by impact):                   │
│                                             │
│ 1. PARKING (36% of complaints)             │
│    "limited parking", "no spots", "slow"   │
│    → Estimated impact: -40% sentiment      │
│                                             │
│ 2. SERVICE RESPONSE (28% of complaints)    │
│    "slow wait", "long queue"               │
│    → Estimated impact: -28% sentiment      │
│                                             │
│ 3. STAFFING (23% of complaints)            │
│    "understaffed", "only one person"       │
│    → Estimated impact: -23% sentiment      │
│                                             │
│ RECOMMENDED ACTIONS (priority order):      │
│                                             │
│ [HIGH] Fix staffing gaps                   │
│ ├─ Potential recovery: ~40%                │
│ ├─ Timeline: 1-2 weeks                     │
│ └─ Success metric: Sentiment → 4.6⭐       │
│                                             │
│ [MEDIUM] Improve parking                   │
│ ├─ Potential recovery: ~35%                │
│ ├─ Timeline: 2-4 weeks                     │
│ └─ Action: Partner with valet/garage       │
│                                             │
│ [LOW] Reset expectations                   │
│ ├─ Potential recovery: ~10%                │
│ └─ Action: Update hours, set expectations  │
│                                             │
│ TOTAL POTENTIAL RECOVERY: 85%              │
│                                             │
│ Next Steps:                                │
│ • Flag for Operations team?                │
│ • See actual customer quotes?              │
│ • Compare to Downtown's solution?          │
└─────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Intent detection module (80% accuracy)
- [ ] Query routing to analytics SQL
- [ ] Basic response templating
- [ ] Chat UI (React component)
- [ ] Conversation memory (in-session)

### Phase 2: Intelligence (Weeks 3-4)
- [ ] Context resolution (pronouns, temporal)
- [ ] Anomaly detection + auto-insights
- [ ] User archetype detection
- [ ] Follow-up suggestion engine
- [ ] Confidence scoring display

### Phase 3: Excellence (Weeks 5+)
- [ ] Multi-modal responses (text + chart + table)
- [ ] Streaming responses (show thinking)
- [ ] Voice input/output
- [ ] Export/sharing
- [ ] Saved queries
- [ ] Team collaboration

---

## Success Metrics

```
CRAFT ABOVE ALL:
✓ Parse accuracy >95%
✓ Response time <2s (p90)
✓ Zero hallucinated data

EMPATHY:
✓ 80%+ get answer on first try
✓ <1.5 follow-up questions per session

FOCUS:
✓ 90%+ use NL input vs menus
✓ <2 clicks to answer

IMPUTE:
✓ Users perceive as premium/intelligent

FRIENDLINESS:
✓ Described as "natural" or "intuitive"
✓ >70% adoption by casual users

SIMPLICITY:
✓ Onboarding <2 minutes
✓ No tutorial needed for 60%+ users
```

---

## Design Assets

### UI Components
- `components/principled-nl-interface.tsx` - Main chat interface
- `nl_query_processor.py` - Backend intent detection

### Documentation
- `NL_INTERFACE_DESIGN.md` - Design principles (this file)
- `nl_query_processor.py` - Implementation reference

### Example Queries & Responses
See "Example Conversations" section above for templates

---

## Conclusion

This Natural Language Analytics Interface is not a feature—it's the **fundamental architecture** through which users interact with the Review Engine platform. Every design decision, from visual hierarchy to response formatting, serves the six pillars: Craft, Empathy, Focus, Impute, Friendliness, and Simplicity.

The result: Users feel like they're talking to a knowledgeable data analyst colleague, not fighting with a computer system.
