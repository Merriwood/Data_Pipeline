'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Lightbulb, TrendingUp, AlertCircle, Check, Zap, Gauge } from 'lucide-react'

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
 * High-Performance Analytics Interface
 * Integrated Racing Metaphors (Horsepower, Step on the Gas, Full Throttle, Heart of the Machine)
 * 
 * With professional taste and discretion:
 * - Horsepower = Analytics processing power
 * - Step on the Gas = Submit query (Send button interaction)
 * - Full Throttle = Real-time analysis mode
 * - Heart of the Machine = Core processing engine (pulse animation)
 */
export function RacingMetaphorInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'assistant',
      content:
        "Welcome to Review Engine Analytics Console. Fire up your insights—let's see what your data can do.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFullThrottle, setIsFullThrottle] = useState(false) // Real-time mode
  const [horsepower, setHorsepower] = useState(0) // Analytics power level (0-100)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate horsepower increase when data is processed
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setHorsepower((prev) => Math.min(prev + Math.random() * 15, 95))
      }, 300)
      return () => clearInterval(interval)
    } else {
      setHorsepower(0)
    }
  }, [isLoading])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Step on the Gas: submit query
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsFullThrottle(true) // Engage full throttle mode

    // Simulate query processing with heart of the machine pulse
    setTimeout(() => {
      const interpretation = parseQuery(input)
      const response = generateResponse(input, interpretation)

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
      setIsFullThrottle(false)
      setHorsepower(0)
    }, 1500)
  }

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
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      {/* Gradient background effect - racing feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />

      {/* Header - Sleek, high-tech aesthetic */}
      <div className="relative border-b border-amber-900/30 px-8 py-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Engine icon - Heart of the Machine */}
            <div className="p-2 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg">
              <Gauge className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">ANALYTICS CONSOLE</h1>
              <p className="text-sm text-amber-300/70 mt-1">High-Performance Review Intelligence Engine</p>
            </div>
          </div>

          {/* Horsepower Display - Real-time power meter */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-amber-300 uppercase tracking-widest">Horsepower</div>
              <div className="text-2xl font-bold text-amber-400">{Math.round(horsepower)}</div>
            </div>
            {/* Power gauge visualization */}
            <div className="w-24 h-12 bg-slate-700/40 border border-amber-600/30 rounded-lg p-1 flex items-end gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-200 ${
                    i < Math.round((horsepower / 100) * 8)
                      ? 'bg-gradient-to-t from-amber-500 to-red-500'
                      : 'bg-slate-600/40'
                  }`}
                  style={{ height: `${20 + i * 8}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          {isFullThrottle && (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 tracking-wider uppercase">FULL THROTTLE</span>
            </>
          )}
          {!isFullThrottle && !isLoading && (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400 tracking-wider">READY TO ACCELERATE</span>
            </>
          )}
          {isLoading && !isFullThrottle && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="text-amber-400 tracking-wider">COOLING DOWN</span>
            </>
          )}
        </div>
      </div>

      {/* Messages - Racing console aesthetic */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 relative z-10">
        {messages.map((message, idx) => (
          <div key={message.id}>
            <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="max-w-2xl">
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-br-none'
                      : 'bg-slate-800/60 border border-amber-600/30 text-gray-100 rounded-bl-none backdrop-blur-sm'
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${message.role === 'assistant' ? 'font-medium' : ''}`}>
                    {message.content}
                  </p>

                  {message.role === 'assistant' && message.response && (
                    <>
                      {message.response.insights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-600/30 space-y-2">
                          {message.response.insights.map((insight, i) => (
                            <div key={i} className="flex gap-2 text-xs text-gray-200">
                              <span className="text-amber-400 font-bold">⚡</span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-amber-600/30 flex gap-3 text-xs text-amber-300/70">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-400" />
                          {message.response.metadata.recordCount} data points
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {message.response.metadata.processingTime}ms
                        </span>
                        {message.interpretation && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-red-400" />
                            {Math.round(message.interpretation.confidence * 100)}% power
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {message.interpretation && (
                  <div className="mt-2 text-xs text-amber-300/60 px-1">
                    <details className="cursor-pointer hover:text-amber-300/80">
                      <summary className="uppercase tracking-wider">Engine diagnostics</summary>
                      <div className="mt-1 space-y-1 text-gray-300 bg-slate-800/40 p-2 rounded border border-amber-600/20">
                        <p>
                          <span className="font-semibold text-amber-400">Domain:</span> {message.interpretation.domain}
                        </p>
                        <p>
                          <span className="font-semibold text-amber-400">Throttle:</span> {message.interpretation.action}
                        </p>
                        <p className="text-gray-400">{message.interpretation.reasoning}</p>
                      </div>
                    </details>
                  </div>
                )}

                {message.response && message.response.followUps.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.response.followUps.map((followUp, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(followUp)}
                        className="block w-full text-left text-xs px-3 py-2 bg-slate-800/50 border border-amber-600/30 rounded hover:bg-slate-800/80 hover:border-amber-500 text-amber-300 transition-all"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                  U
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Heart of the Machine - Loading state */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-slate-800/60 border border-amber-600/30 rounded-lg rounded-bl-none px-4 py-3 backdrop-blur-sm">
              <div className="flex gap-3 items-center mb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-amber-300">Heart of the machine running...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Gas Pedal Control */}
      <div className="relative border-t border-amber-900/30 bg-gradient-to-t from-slate-900 to-slate-800/80 backdrop-blur-sm p-8">
        {messages.length < 3 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-amber-400 uppercase mb-2 tracking-widest">
              Floor it with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getContextualSuggestions()
                .slice(0, 4)
                .map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-sm p-3 border border-amber-600/30 rounded-lg hover:border-amber-500 hover:bg-amber-600/10 transition-all group cursor-pointer bg-slate-800/30"
                  >
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-amber-100 group-hover:text-amber-300">{suggestion}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Gas Pedal Input */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Step on the gas—ask anything about your data..."
              className="w-full px-4 py-3 border border-amber-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-800/50 text-white placeholder-gray-400"
              disabled={isLoading}
              autoFocus
            />
            {input.length > 0 && (
              <div className="absolute right-3 top-3 text-xs text-amber-400/60">
                {input.length} chars
              </div>
            )}
          </div>

          {/* Step on the Gas - Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-lg hover:from-amber-500 hover:to-red-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-bold uppercase tracking-wide relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Step on Gas</span>
          </button>
        </div>

        {/* Engine Capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { icon: '⚡', label: 'Sentiment Turbo' },
            { icon: '🗺️', label: 'Community Race' },
            { icon: '🏁', label: 'Loyalty Shift' },
            { icon: '🚀', label: 'Trend Boost' },
          ].map((cap, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 border border-amber-600/20 rounded-lg text-amber-300 hover:border-amber-500/50 transition-colors">
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
 * Query Parsing - Engine diagnostics
 */
function parseQuery(query: string) {
  const lower = query.toLowerCase()

  let domain = 'sentiment'
  if (lower.includes('theme') || lower.includes('mention') || lower.includes('say')) domain = 'themes'
  if (lower.includes('community') || lower.includes('location') || lower.includes('neighborhood')) domain = 'communities'
  if (lower.includes('google') || lower.includes('yelp') || lower.includes('facebook')) domain = 'platforms'
  if (lower.includes('loyalty') || lower.includes('points') || lower.includes('reward')) domain = 'loyalty'
  if (lower.includes('trend') || lower.includes('over time') || lower.includes('growing')) domain = 'time_series'
  if (lower.includes('vs') || lower.includes('compare') || lower.includes('difference')) domain = 'comparison'
  if (lower.includes('drop') || lower.includes('unusual') || lower.includes('weird')) domain = 'anomaly'

  let action = 'summarize'
  if (lower.includes('detail') || lower.includes('specific') || lower.includes('all')) action = 'drill_down'
  if (lower.includes('compare') || lower.includes('vs')) action = 'compare'
  if (lower.includes('trend') || lower.includes('over time') || lower.includes('growing')) action = 'trend'
  if (lower.includes('top') || lower.includes('bottom') || lower.includes('best')) action = 'rank'
  if (lower.includes('calculate') || lower.includes('how many') || lower.includes('total')) action = 'calculate'

  let confidence = 0.5
  if (query.length > 15) confidence += 0.15
  if (['sentiment', 'theme', 'community', 'loyalty'].some((w) => lower.includes(w))) confidence += 0.2
  confidence = Math.min(confidence, 0.95)

  return {
    domain,
    action,
    confidence,
    reasoning: `Engine detected ${domain} query with ${action} throttle. Revving at ${Math.round(confidence * 100)} HP.`,
  }
}

/**
 * Response Generation - Race results
 */
function generateResponse(query: string, interpretation: any) {
  const responses: Record<string, any> = {
    sentiment: {
      headline: '🏁 Sentiment running hot! 68% positive (↑5% from last lap)',
      insights: [
        '4.65⭐ average—you\'re in the fast lane',
        'Downtown community leading the race at 8.7/10',
        'Westside showing signs of drag—7.9/10 (mainly parking friction)',
      ],
      followUps: [
        'What\'s causing Westside to downshift?',
        'Show me the full lap breakdown',
        'Can we turbocharge the neutral mentions?',
      ],
    },
    themes: {
      headline: '⚡ Torque patterns detected—here\'s what\'s revving people up',
      insights: [
        'Service Quality (156 mentions) - 35.8% - Top fuel',
        'Staff Friendliness (89 mentions) - 20.4% - Engine oil',
        'Location/Parking (45 mentions) - 10.3% - Brake issues',
        'Wait Time (23 mentions) - 5.3% - Throttle lag',
      ],
      followUps: [
        'Which neighborhoods are misfiring on parking?',
        'Show me the positive combustion',
        'What\'s the service trend velocity?',
      ],
    },
    communities: {
      headline: '🏎️ Community horsepower report',
      insights: [
        'Downtown (H3: hex_001) - 8.5/10 - Redline condition',
        'Uptown (H3: hex_003) - 8.7/10 - Peak performance',
        'Midtown (H3: hex_002) - 8.2/10 - Cruising',
        'Westside (H3: hex_004) - 7.9/10 - Engine knock detected',
      ],
      followUps: [
        'What\'s causing Westside misfire?',
        'How do we extract more power from Uptown?',
        'Loyalty points distribution by neighborhood?',
      ],
    },
    loyalty: {
      headline: '🚀 Loyalty engine accelerating!',
      insights: [
        'Points Awarded: 4,850 (↑12% throttle)',
        'Points Redeemed: 2,340 (↑8% consumption)',
        'Net Accrual: 2,510 points (fuel tank full)',
        'Redemption Rate: 48.2% (healthy burn)',
      ],
      followUps: [
        'What are the top fuel-burning options?',
        'Which communities are turbo-charging?',
        'Compare our performance to benchmarks?',
      ],
    },
  }

  const baseResponse = responses[interpretation.domain] || responses.sentiment

  return {
    headline: baseResponse.headline,
    insights: baseResponse.insights,
    followUps: baseResponse.followUps,
    metadata: {
      recordCount: Math.floor(Math.random() * 500) + 50,
      processingTime: Math.floor(Math.random() * 2000) + 300,
    },
  }
}
