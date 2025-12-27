"""
Review Engine: Natural Language Query Processor
Implements intent detection, context resolution, and query execution
Following the Six Pillars of Design Philosophy
"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime, timedelta
import json


class QueryDomain(str, Enum):
    """Semantic domains the NL interface supports"""
    SENTIMENT = "sentiment"        # Mood/rating analysis
    THEMES = "themes"              # Topic/keyword extraction
    COMMUNITIES = "communities"    # Geospatial (H3) analysis
    PLATFORMS = "platforms"        # Channel comparison
    LOYALTY = "loyalty"            # Points/rewards metrics
    TIME_SERIES = "time_series"    # Trend analysis
    COMPARISON = "comparison"      # A vs B analysis
    ANOMALY = "anomaly"            # Outlier detection
    FORECAST = "forecast"          # Predictive


class QueryAction(str, Enum):
    """What the user wants to DO with the data"""
    SUMMARIZE = "summarize"        # High-level overview
    DRILL_DOWN = "drill_down"      # Detailed breakdown
    COMPARE = "compare"            # Side-by-side
    TREND = "trend"                # Over time
    RANK = "rank"                  # Top/bottom
    CALCULATE = "calculate"        # Math operations
    PREDICT = "predict"            # Future extrapolation


@dataclass
class QueryFilter:
    """Extracted filters from natural language"""
    location: Optional[str] = None           # "Downtown", "Westside", community name
    platform: Optional[str] = None           # "Google", "Yelp", "Facebook", "Synup"
    timeframe: Optional[str] = None          # "last_week", "last_30d", specific dates
    sentiment_range: Optional[tuple] = None  # (min_rating, max_rating)
    keywords: Optional[List[str]] = None     # Theme keywords mentioned
    min_mention_count: Optional[int] = None  # Filter by mention frequency


@dataclass
class ParsedIntent:
    """
    Structured representation of user's natural language query
    This is the core of the "Simplicity Through Metaphor" principle
    """
    
    # What domain is the user asking about?
    domain: QueryDomain
    
    # What action do they want to perform?
    action: QueryAction
    
    # What filters/constraints apply?
    filters: QueryFilter
    
    # How confident are we in this interpretation? (0.0-1.0)
    confidence: float
    
    # Original query for reference
    original_query: str
    
    # Context used in parsing
    conversation_context: Optional[List[str]] = None
    
    # Reasoning explanation (for "Craft Above All" - transparency)
    reasoning: Optional[str] = None
    

class NLQueryProcessor:
    """
    Core query processor that implements the design principles:
    - Craft: Accurate parsing and clear reasoning
    - Empathy: Handles multiple user communication styles
    - Focus: Single responsibility - understand intent
    - Impute: Confidence scoring signals quality
    - Friendliness: Helpful error messages and suggestions
    - Simplicity: Metaphor-based interpretation
    """
    
    def __init__(self):
        # Intent patterns for query classification
        self.domain_keywords = {
            QueryDomain.SENTIMENT: {
                "keywords": ["sentiment", "rating", "stars", "happy", "satisfied", "mood", "feeling", "opinion"],
                "patterns": ["how.*feel", "what.*think", "sentiment.*analysis"],
            },
            QueryDomain.THEMES: {
                "keywords": ["theme", "topic", "mention", "say", "talk", "complaint", "praise", "feedback"],
                "patterns": ["what.*saying", "what.*people.*talk", "themes.*about"],
            },
            QueryDomain.COMMUNITIES: {
                "keywords": ["community", "location", "neighborhood", "area", "downtown", "uptown", "westside", "midtown", "region", "h3", "hexagon"],
                "patterns": ["in.*", "at.*location", "by.*community"],
            },
            QueryDomain.PLATFORMS: {
                "keywords": ["google", "yelp", "facebook", "synup", "platform", "channel", "source"],
                "patterns": ["google.*vs", "compare.*platform", "on.*yelp"],
            },
            QueryDomain.LOYALTY: {
                "keywords": ["loyalty", "points", "rewards", "redeem", "award", "balance", "yotpo"],
                "patterns": ["loyalty.*", "points.*", "reward.*"],
            },
            QueryDomain.TIME_SERIES: {
                "keywords": ["trend", "over time", "week", "month", "day", "growing", "declining", "change"],
                "patterns": ["trend.*", "over.*time", "last.*week"],
            },
            QueryDomain.COMPARISON: {
                "keywords": ["vs", "versus", "compare", "compared to", "difference", "better", "worse"],
                "patterns": [".*vs.*", "compare.*", ".*vs.*"],
            },
            QueryDomain.ANOMALY: {
                "keywords": ["anomaly", "unusual", "weird", "strange", "spike", "drop", "outlier", "wrong"],
                "patterns": ["what.*wrong", "why.*drop", "unusual"],
            },
            QueryDomain.FORECAST: {
                "keywords": ["forecast", "predict", "expect", "will", "next week", "trend", "projection"],
                "patterns": ["will.*", "expect.*", "forecast.*"],
            },
        }
        
        self.action_keywords = {
            QueryAction.SUMMARIZE: ["summary", "overview", "high level", "tell me", "what's", "how are"],
            QueryAction.DRILL_DOWN: ["details", "breakdown", "dig", "deeper", "specifics", "exactly", "all"],
            QueryAction.COMPARE: ["vs", "compare", "difference", "better", "worse", "same"],
            QueryAction.TREND: ["trend", "over time", "growing", "declining", "change"],
            QueryAction.RANK: ["top", "bottom", "best", "worst", "ranking", "list"],
            QueryAction.CALCULATE: ["calculate", "math", "total", "average", "how many", "count"],
            QueryAction.PREDICT: ["predict", "forecast", "will", "expect", "next"],
        }
        
        # Conversation context for anaphora resolution (pronouns)
        self.conversation_history: List[ParsedIntent] = []
    
    def parse_query(
        self,
        query: str,
        conversation_history: Optional[List[str]] = None,
    ) -> ParsedIntent:
        """
        Parse natural language query into structured intent.
        
        Embodies:
        - Craft: Accurate parsing with confidence scoring
        - Simplicity: Clear decision tree for interpretation
        """
        
        query_lower = query.lower().strip()
        
        # Extract domain
        domain = self._detect_domain(query_lower)
        
        # Extract action
        action = self._detect_action(query_lower)
        
        # Extract filters
        filters = self._extract_filters(query_lower)
        
        # Confidence calculation
        confidence = self._calculate_confidence(
            query_lower, domain, action, filters
        )
        
        # Reasoning (transparency for "Impute" principle)
        reasoning = self._generate_reasoning(
            query_lower, domain, action, filters, confidence
        )
        
        parsed = ParsedIntent(
            domain=domain,
            action=action,
            filters=filters,
            confidence=confidence,
            original_query=query,
            conversation_context=conversation_history,
            reasoning=reasoning,
        )
        
        self.conversation_history.append(parsed)
        return parsed
    
    def _detect_domain(self, query: str) -> QueryDomain:
        """
        Detect which semantic domain the query belongs to.
        Implements "Empathy" by handling multiple ways users ask about same thing.
        """
        
        max_domain = QueryDomain.SENTIMENT  # Default
        max_score = 0
        
        for domain, patterns in self.domain_keywords.items():
            score = 0
            
            # Keyword matching
            for keyword in patterns["keywords"]:
                if keyword in query:
                    score += 1
            
            # Pattern matching
            import re
            for pattern in patterns["patterns"]:
                if re.search(pattern, query):
                    score += 2  # Patterns are higher confidence
            
            if score > max_score:
                max_score = score
                max_domain = domain
        
        return max_domain
    
    def _detect_action(self, query: str) -> QueryAction:
        """
        Detect what action the user wants to perform.
        Implements "Focus" by clarifying intent.
        """
        
        max_action = QueryAction.SUMMARIZE  # Default (most common)
        max_score = 0
        
        for action, keywords in self.action_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query)
            if score > max_score:
                max_score = score
                max_action = action
        
        return max_action
    
    def _extract_filters(self, query: str) -> QueryFilter:
        """
        Extract structured filters from query.
        Implements "Craft" through precise data extraction.
        """
        
        filters = QueryFilter()
        
        # Location extraction
        locations = ["downtown", "midtown", "uptown", "westside"]
        for loc in locations:
            if loc in query:
                filters.location = loc.capitalize()
                break
        
        # Platform extraction
        platforms = ["google", "yelp", "facebook", "synup"]
        for platform in platforms:
            if platform in query:
                filters.platform = platform.capitalize()
                break
        
        # Timeframe extraction
        timeframe_patterns = {
            "last_week": ["last week", "this week", "weekly"],
            "last_30d": ["last 30", "month", "monthly"],
            "last_90d": ["last 90", "quarter", "quarterly"],
            "year_to_date": ["year", "ytd", "since"],
            "all_time": ["all time", "ever"],
        }
        
        for timeframe, patterns in timeframe_patterns.items():
            for pattern in patterns:
                if pattern in query:
                    filters.timeframe = timeframe
                    break
        
        # Default to last 30 days if not specified
        if not filters.timeframe:
            filters.timeframe = "last_30d"
        
        # Keyword extraction (themes)
        if "parking" in query:
            filters.keywords = ["parking"]
        if "staff" in query or "service" in query:
            filters.keywords = ["staff", "service"]
        
        return filters
    
    def _calculate_confidence(
        self,
        query: str,
        domain: QueryDomain,
        action: QueryAction,
        filters: QueryFilter,
    ) -> float:
        """
        Calculate confidence in interpretation (0.0-1.0).
        Implements "Impute" - signal quality through transparent scoring.
        """
        
        confidence = 0.5  # Base
        
        # Boost for clear keywords
        if any(keyword in query for keyword in ["sentiment", "theme", "community", "loyalty"]):
            confidence += 0.2
        
        # Boost for clear actions
        if any(keyword in query for keyword in ["compare", "trend", "summary", "details"]):
            confidence += 0.15
        
        # Boost for filters
        if filters.location:
            confidence += 0.1
        if filters.timeframe and filters.timeframe != "last_30d":  # Explicit is good
            confidence += 0.05
        
        # Penalty for ambiguity
        if len(query) < 5:  # Very short queries are ambiguous
            confidence -= 0.2
        
        # Cap at 0.95 (never 100% - honesty is friendly)
        return min(confidence, 0.95)
    
    def _generate_reasoning(
        self,
        query: str,
        domain: QueryDomain,
        action: QueryAction,
        filters: QueryFilter,
        confidence: float,
    ) -> str:
        """
        Generate human-readable explanation of parsing.
        Implements "Craft" and "Friendliness" through transparency.
        """
        
        parts = []
        
        # Domain explanation
        domain_name = domain.value.replace("_", " ").title()
        parts.append(f"Understood as: {domain_name}")
        
        # Action explanation
        action_name = action.value.replace("_", " ").title()
        parts.append(f"You want to: {action_name}")
        
        # Filters explanation
        if filters.location:
            parts.append(f"Filtered to: {filters.location}")
        if filters.platform:
            parts.append(f"For platform: {filters.platform}")
        if filters.timeframe:
            timeframe_readable = filters.timeframe.replace("_", " ")
            parts.append(f"Looking at: {timeframe_readable}")
        
        # Confidence explanation
        if confidence >= 0.8:
            confidence_text = "High confidence"
        elif confidence >= 0.6:
            confidence_text = "Moderate confidence"
        else:
            confidence_text = "Low confidence - might need clarification"
        
        parts.append(f"{confidence_text} ({int(confidence * 100)}%)")
        
        return " | ".join(parts)


class ResponseFormatter:
    """
    Formats query results for presentation.
    Implements "Craft" and "Impute" through visual hierarchy and clarity.
    """
    
    @staticmethod
    def format_for_user(
        intent: ParsedIntent,
        data: Dict[str, Any],
        insights: List[str],
        user_archetype: str = "general",
    ) -> Dict[str, Any]:
        """
        Format response based on user type and query type.
        Implements "Empathy" through adaptive formatting.
        """
        
        # Adapt response to user archetype
        if user_archetype == "executive":
            return ResponseFormatter._format_executive(intent, data, insights)
        elif user_archetype == "analyst":
            return ResponseFormatter._format_analyst(intent, data, insights)
        elif user_archetype == "manager":
            return ResponseFormatter._format_manager(intent, data, insights)
        else:
            return ResponseFormatter._format_casual(intent, data, insights)
    
    @staticmethod
    def _format_executive(
        intent: ParsedIntent,
        data: Dict[str, Any],
        insights: List[str],
    ) -> Dict[str, Any]:
        """Headlines first, drilling available but not forced"""
        return {
            "headline": insights[0] if insights else "No data found",
            "key_metric": data.get("primary_value"),
            "trend": data.get("trend_direction"),
            "drill_down_available": len(insights) > 1,
            "follow_ups": [
                "Want specific numbers?",
                "See the breakdown?",
                "How does this compare?",
            ],
        }
    
    @staticmethod
    def _format_analyst(
        intent: ParsedIntent,
        data: Dict[str, Any],
        insights: List[str],
    ) -> Dict[str, Any]:
        """Numbers first, context second"""
        return {
            "summary": insights[0] if insights else "No data found",
            "detailed_data": data.get("full_dataset"),
            "methodology": f"Analyzed {data.get('record_count', 0)} records",
            "confidence": intent.confidence,
            "reasoning": intent.reasoning,
            "supporting_insights": insights[1:] if len(insights) > 1 else [],
        }
    
    @staticmethod
    def _format_manager(
        intent: ParsedIntent,
        data: Dict[str, Any],
        insights: List[str],
    ) -> Dict[str, Any]:
        """Problem, cause, action"""
        return {
            "situation": insights[0] if insights else "No issues detected",
            "root_causes": insights[1:3] if len(insights) > 1 else [],
            "recommended_actions": data.get("recommendations", []),
            "success_metrics": data.get("success_metrics"),
        }
    
    @staticmethod
    def _format_casual(
        intent: ParsedIntent,
        data: Dict[str, Any],
        insights: List[str],
    ) -> Dict[str, Any]:
        """Conversational, human-readable"""
        return {
            "message": ResponseFormatter._humanize(insights[0]) if insights else "Let me look into that...",
            "highlights": [ResponseFormatter._humanize(i) for i in insights[1:3]],
            "next_question": "Want to know more about anything?",
            "simple_summary": ResponseFormatter._simplify(data),
        }
    
    @staticmethod
    def _humanize(text: str) -> str:
        """Convert data language to human language"""
        return text.replace("_", " ").title()
    
    @staticmethod
    def _simplify(data: Dict[str, Any]) -> str:
        """Reduce data to simple statement"""
        return f"Analyzed {data.get('record_count', 0)} data points"


# Example usage
if __name__ == "__main__":
    processor = NLQueryProcessor()
    
    # Test queries
    test_queries = [
        "What's our sentiment in Westside?",
        "Show me themes last week by community",
        "Why are Westside reviews dropping?",
        "Compare Google vs Yelp performance",
        "How many loyalty points awarded this month?",
    ]
    
    for query in test_queries:
        intent = processor.parse_query(query)
        print(f"\nQuery: {query}")
        print(f"Domain: {intent.domain.value}")
        print(f"Action: {intent.action.value}")
        print(f"Confidence: {intent.confidence:.1%}")
        print(f"Reasoning: {intent.reasoning}")
        print(f"Filters: location={intent.filters.location}, timeframe={intent.filters.timeframe}")
