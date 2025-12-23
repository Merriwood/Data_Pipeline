'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Lightbulb, TrendingUp, AlertCircle, Check, Copy } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  interpretation?: {
    domain: string
    action: string
    confidence: number
    reasoning: string
  }
  response?: {
    headline: string
    insights: string[]
    followUps: string[]
    metadata: {
      recordCount: number
      processingTime: number
    }
  }
  timestamp: Date
}

/**
 * Natural Language Analytics Interface
 * 
 * Design Principles in Action:
 * 1. CRAFT: Every detail refined - typography, spacing, animation
 * 2. EMPATHY: Adaptive responses, contextual suggestions, error recovery
 * 3. FOCUS: Single input area is THE interface; everything supports it
 * 4. IMPUTE: Visual hierarchy signals quality - confidence badges, processing transparency
 * 5. FRIENDLINESS: Conversational tone, suggested follow-ups, helpful errors
 * 6. SIMPLICITY: "Talking to a data analyst" metaphor throughout
 */
export function PrincipledNLInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'assistant',
      content:
        "Hi! I'm your Review Engine data analyst. Ask me anything about your reviews, sentiment, communities, or loyalty metrics. Be specific or general—I'll understand.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userArchetype, setUserArchetype] = useState<'executive' | 'analyst' | 'manager' | 'casual'>(
    'general' as any
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate query processing (in real app, this calls backend)
    setTimeout(() => {
      const interpretation = parseQuery(input)
      const response = generateResponse(input, interpretation, userArchetype)

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.headline,
        interpretation,
        response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1200)
  }

  // Contextual suggestions based on last message
  const getContextualSuggestions = (): string[] => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role === 'user') {
      return [
        'What happened with Downtown last week?',
        'Show me Westside sentiment by theme',
        'How did we do on loyalty points this month?',
        'Compare Google vs Yelp performance',
      ]
    }

    // Smart follow-ups based on last query
    const domain = lastMessage.interpretation?.domain || ''
    if (domain.includes('sentiment')) {
      return [
        'Drill into the negative mentions',
        'Show me by community',
        'What changed from last week?',
      ]
    }
    if (domain.includes('community')) {
      return ['Why is that location underperforming?', 'Compare to Downtown', 'Show all communities']
    }

    return ['Tell me more', 'Show the trend', 'Who complained?']
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Craft: Premium feel through careful typography and spacing */}
      <div className="border-b border-gray-200 px-8 py-6 bg-gradient-to-r from-blue-50 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Assistant</h1>
            <p className="text-sm text-gray-600 mt-1">Ask anything about your reviews, sentiment, communities, or loyalty</p>
          </div>
        </div>
      </div>

      {/* Messages - Friendliness: Conversational layout with breathing room */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        {messages.map((message, idx) => (
          <div key={message.id}>
            {/* Message Container */}
            <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Avatar - Impute: Visual signal of origin */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
              )}

              {/* Message Body - Craft: Hierarchy through size, weight, color */}
              <div className="max-w-2xl">
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${message.role === 'assistant' ? 'font-medium' : ''}`}>
                    {message.content}
                  </p>

                  {/* Assistant Message Extensions */}
                  {message.role === 'assistant' && message.response && (
                    <>
                      {/* Insights - Simplicity: List format is universal */}
                      {message.response.insights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                          {message.response.insights.map((insight, i) => (
                            <div key={i} className="flex gap-2 text-xs text-gray-700">
                              <span className="text-blue-600 font-bold">•</span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Metadata - Impute: Transparency signals quality */}
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          {message.response.metadata.recordCount} data points
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-blue-600" />
                          {message.response.metadata.processingTime}ms
                        </span>
                        {message.interpretation && (
                          <span className="flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-yellow-600" />
                            {Math.round(message.interpretation.confidence * 100)}% confident
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Interpretation Display - Craft & Empathy: Show understanding */}
                {message.interpretation && (
                  <div className="mt-2 text-xs text-gray-600 px-1">
                    <details className="cursor-pointer hover:text-gray-800">
                      <summary>How I understood this</summary>
                      <div className="mt-1 space-y-1 text-gray-700 bg-gray-50 p-2 rounded">
                        <p>
                          <span className="font-semibold">Domain:</span> {message.interpretation.domain}
                        </p>
                        <p>
                          <span className="font-semibold">Action:</span> {message.interpretation.action}
                        </p>
                        <p className="text-gray-600">{message.interpretation.reasoning}</p>
                      </div>
                    </details>
                  </div>
                )}

                {/* Follow-up Suggestions - Friendliness: Anticipate next question */}
                {message.response && message.response.followUps.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.response.followUps.map((followUp, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(followUp)}
                        className="block w-full text-left text-xs px-3 py-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-blue-900 transition-colors"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                  U
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading State - Impute: Show processing without hiding work */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg rounded-bl-none px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-xs text-gray-600 mt-2">Analyzing your data...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Focus: Single primary action */}
      <div className="border-t border-gray-200 bg-white p-8">
        {/* Contextual Suggestions - Empathy: Show relevant next questions */}
        {messages.length < 3 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2 tracking-wide">
              Try asking:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getContextualSuggestions()
                .slice(0, 4)
                .map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-sm p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-gray-700 group-hover:text-blue-900">{suggestion}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Main Input - Simplicity: Obvious, welcoming input area */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about reviews, sentiment, communities, loyalty..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              disabled={isLoading}
              autoFocus
            />
            {input.length > 0 && (
              <div className="absolute right-3 top-3 text-xs text-gray-500">
                {input.length} chars
              </div>
            )}
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

        {/* Capabilities - Simplicity: Show scope through metaphor icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { icon: '📊', label: 'Sentiment Analysis' },
            { icon: '🗺️', label: 'Community Insights' },
            { icon: '🎁', label: 'Loyalty Metrics' },
            { icon: '📈', label: 'Trend Analysis' },
          ].map((cap, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-gray-700">
              <span className="text-base">{cap.icon}</span>
              <span className="hidden sm:inline font-medium">{cap.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Query Parsing - Mirrors backend nl_query_processor.py
 * Implements: Craft (accuracy), Simplicity (metaphor), Focus (clarity)
 */
function parseQuery(query: string) {
  const lower = query.toLowerCase()

  // Domain detection
  let domain = 'sentiment' // default
  if (lower.includes('theme') || lower.includes('mention') || lower.includes('say')) domain = 'themes'
  if (lower.includes('community') || lower.includes('location') || lower.includes('neighborhood')) domain = 'communities'
  if (lower.includes('google') || lower.includes('yelp') || lower.includes('facebook')) domain = 'platforms'
  if (lower.includes('loyalty') || lower.includes('points') || lower.includes('reward')) domain = 'loyalty'
  if (lower.includes('trend') || lower.includes('over time') || lower.includes('growing')) domain = 'time_series'
  if (lower.includes('vs') || lower.includes('compare') || lower.includes('difference')) domain = 'comparison'
  if (lower.includes('drop') || lower.includes('unusual') || lower.includes('weird')) domain = 'anomaly'

  // Action detection
  let action = 'summarize' // default
  if (lower.includes('detail') || lower.includes('specific') || lower.includes('all')) action = 'drill_down'
  if (lower.includes('compare') || lower.includes('vs')) action = 'compare'
  if (lower.includes('trend') || lower.includes('over time') || lower.includes('growing')) action = 'trend'
  if (lower.includes('top') || lower.includes('bottom') || lower.includes('best')) action = 'rank'
  if (lower.includes('calculate') || lower.includes('how many') || lower.includes('total')) action = 'calculate'

  // Confidence calculation
  let confidence = 0.5
  if (query.length > 15) confidence += 0.15
  if (['sentiment', 'theme', 'community', 'loyalty'].some((w) => lower.includes(w))) confidence += 0.2
  confidence = Math.min(confidence, 0.95)

  return {
    domain,
    action,
    confidence,
    reasoning: `Detected as ${domain} query with ${action} action. High specificity in your question helps me understand better.`,
  }
}

/**
 * Response Generation - Mirrors backend ResponseFormatter
 * Implements: Empathy (archetype awareness), Friendliness (tone), Craft (precision)
 */
function generateResponse(
  query: string,
  interpretation: any,
  userArchetype: string
) {
  // Simulated data based on query
  const responses: Record<string, any> = {
    sentiment: {
      headline: 'Your sentiment is trending positively 📈',
      insights: [
        '68% positive reviews (↑5% from last week)',
        '4.65⭐ average rating across all platforms',
        'Downtown community leading at 8.7/10',
        'Westside shows opportunity (7.9/10) - mainly parking concerns',
      ],
      followUps: [
        'What are people saying about Westside?',
        'Compare Downtown vs Westside in detail',
        'Show me the negative reviews',
      ],
    },
    themes: {
      headline: 'Top themes in customer feedback 💬',
      insights: [
        'Service Quality (156 mentions) - 35.8%',
        'Staff Friendliness (89 mentions) - 20.4%',
        'Location/Parking (45 mentions) - 10.3%',
        'Wait Time (23 mentions) - 5.3%',
      ],
      followUps: [
        'Which communities complain most about parking?',
        'Show positive themes',
        'Trend for service quality over time',
      ],
    },
    communities: {
      headline: 'Community performance snapshot 🗺️',
      insights: [
        'Downtown (H3: hex_001) - 8.5/10, 52 reviews, strong momentum',
        'Uptown (H3: hex_003) - 8.7/10, 45 reviews, highest quality',
        'Midtown (H3: hex_002) - 8.2/10, 38 reviews, stable',
        'Westside (H3: hex_004) - 7.9/10, 19 reviews, declining (alert)',
      ],
      followUps: [
        'Why is Westside sentiment declining?',
        'What makes Uptown so strong?',
        'Loyalty points by community',
      ],
    },
    loyalty: {
      headline: 'Loyalty program performing well 🎁',
      insights: [
        'Points Awarded: 4,850 (↑12% vs last month)',
        'Points Redeemed: 2,340 (↑8%)',
        'Net Accrual: 2,510 points',
        'Redemption Rate: 48.2% (healthy)',
      ],
      followUps: [
        'Top redemption options?',
        'Which communities earn most?',
        'Compare to Yotpo benchmarks',
      ],
    },
  }

  // Default response
  const baseResponse = responses[interpretation.domain] || responses.sentiment

  // Adapt based on user archetype
  let headline = baseResponse.headline
  let insights = baseResponse.insights

  if (userArchetype === 'executive') {
    // Just headline + 1 key insight
    headline = baseResponse.headline
    insights = [baseResponse.insights[0]]
  } else if (userArchetype === 'manager') {
    // Problem-focused
    headline = baseResponse.headline + ' - Action needed!'
  }

  return {
    headline,
    insights,
    followUps: baseResponse.followUps,
    metadata: {
      recordCount: Math.floor(Math.random() * 500) + 50,
      processingTime: Math.floor(Math.random() * 2000) + 300,
    },
  }
}
