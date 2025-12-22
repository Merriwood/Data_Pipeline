'use client'

import { useState } from 'react'
import { Send, Sparkles, Clock, BarChart3, AlertCircle, TrendingUp } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'calculation' | 'report' | 'insight'
  timestamp: Date
  metadata?: {
    queryType?: string
    dataPoints?: number
    processingTime?: number
  }
}

export function NLAnalyticsInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Review Engine Analytics AI. Ask me anything about your reviews, sentiment trends, community insights, loyalty performance, or marketing analytics.',
      type: 'text',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const examplePrompts = [
    'What was our sentiment trend last week by community?',
    'Which neighborhoods had the most 5-star reviews?',
    'Calculate loyalty points awarded vs redeemed this month',
    'Show me underperforming locations by rating',
    'What themes are customers mentioning most?',
    'Compare platform performance: Google vs Yelp',
  ]

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

    // Simulate AI processing
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: generateMockResponse(input),
        type: 'calculation',
        timestamp: new Date(),
        metadata: {
          queryType: detectQueryType(input),
          dataPoints: Math.floor(Math.random() * 500) + 50,
          processingTime: Math.floor(Math.random() * 2000) + 300,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Analytics Assistant</h1>
        </div>
        <p className="text-gray-600 text-sm">Ask natural language questions about your reviews, sentiment, communities, and loyalty metrics</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.metadata && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {message.metadata.dataPoints} data points
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {message.metadata.processingTime}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-900 rounded-lg rounded-bl-none px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-6">
        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about reviews, sentiment, communities, loyalty points, or marketing..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Ask
          </button>
        </div>

        {/* Capabilities */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Capability icon="📊" label="Sentiment Analysis" />
          <Capability icon="🗺️" label="Community Insights" />
          <Capability icon="🎁" label="Loyalty Metrics" />
          <Capability icon="📈" label="Trend Analysis" />
        </div>
      </div>
    </div>
  )
}

function Capability({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-700">{label}</span>
    </div>
  )
}

function generateMockResponse(prompt: string): string {
  const responses: { [key: string]: string } = {
    sentiment: `Based on your data from the past 7 days:
- Positive reviews: 68% (↑5% from previous week)
- Neutral: 22% (↓2%)
- Negative: 10% (↓3%)

Top performing community (Downtown) averaged 8.5/10 sentiment. Westside showed room for improvement at 7.9/10. Key positive themes: "excellent service" (23% of mentions), "friendly staff" (18%), "quick response" (15%).`,

    neighborhood: `Downtown and Uptown neighborhoods led with 52 and 45 five-star reviews respectively. 
Breakdown by community:
- Downtown: 52 ⭐⭐⭐⭐⭐ (H3: hex_001)
- Uptown: 45 ⭐⭐⭐⭐⭐ (H3: hex_003)
- Midtown: 38 ⭐⭐⭐⭐⭐ (H3: hex_002)
- Westside: 19 ⭐⭐⭐⭐⭐ (H3: hex_004)

Opportunity: Westside needs attention - lowest 5-star volume but highest complaint density.`,

    loyalty: `December Loyalty Performance:
- Points Awarded: 4,850 (↑12% vs November)
- Points Redeemed: 2,340 (↑8%)
- Net Accrual: 2,510 points
- Avg Points/Customer: 87
- Redemption Rate: 48.2%

Top redemption: 15% used for "Free Service" tier, 12% for "VIP Treatment"`,

    platform: `Platform Comparison (Last 30 Days):
Google My Business: 156 reviews (4.7⭐ avg) - 35.8%
Facebook: 124 reviews (4.6⭐ avg) - 28.4%
Yelp: 89 reviews (4.5⭐ avg) - 20.4%
Synup: 67 reviews (4.8⭐ avg) - 15.4%

Google dominates volume but Synup achieves highest quality. Facebook shows best engagement rate (12.3%).`,

    theme: `Top themes mentioned across all reviews (NLP Analysis):
1. Service Quality (156 mentions) - 35.8%
2. Staff Friendliness (89 mentions) - 20.4%
3. Responsiveness (67 mentions) - 15.4%
4. Location/Parking (45 mentions) - 10.3%
5. Pricing (34 mentions) - 7.8%
6. Wait Time (23 mentions) - 5.3%

Sentiment by theme: Service Quality (8.7/10), Staff (8.5/10), Location (7.2/10)`,

    underperforming: `Locations Below Target (Target: 4.5⭐):
- Westside Branch: 4.2⭐ (23 reviews) - Complaints: parking (9), slow response (5)
- Downtown Satellite: 4.3⭐ (15 reviews) - Complaints: staffing (4), quality (3)
- Midtown Kiosk: 4.4⭐ (28 reviews) - Complaints: limited hours (6), consistency (4)

Recommendation: Increase staffing at Westside, improve parking partnership, accelerate response protocols.`,
  }

  for (const [key, value] of Object.entries(responses)) {
    if (prompt.toLowerCase().includes(key)) {
      return value
    }
  }

  return `I analyzed your data across ${Math.floor(Math.random() * 500) + 50} data points. Here's what I found:

${Math.random() > 0.5 ? '✓ Strong' : '⚠️ Notable'} performance: Your 7-day rolling average shows positive momentum. 

Key insights:
• Community clustering analysis shows Downtown leading with highest engagement
• Sentiment distribution remains healthy (68% positive)
• Loyalty program driving 12% month-over-month growth
• Platform performance varies - Google/Facebook leading, but Synup quality highest

Would you like me to dive deeper into any specific community, platform, or metric?`
}

function detectQueryType(prompt: string): string {
  if (prompt.includes('sentiment')) return 'Sentiment Analysis'
  if (prompt.includes('neighborhood') || prompt.includes('location')) return 'Geospatial'
  if (prompt.includes('loyalty') || prompt.includes('points')) return 'Loyalty'
  if (prompt.includes('platform') || prompt.includes('google') || prompt.includes('yelp')) return 'Platform'
  if (prompt.includes('theme') || prompt.includes('mention')) return 'Theme Detection'
  return 'Analytics'
}
