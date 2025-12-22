import Link from 'next/link'
import { Sparkles, BarChart3, MessageSquare } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
          <span className="text-xs font-semibold text-blue-900">v2.0 Production Ready</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Enterprise Review Analytics Platform
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Multi-tenant analytics engine with AI-powered sentiment analysis, geospatial clustering, and
          automated loyalty workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-16 flex-wrap">
          <Link
            href="/analytics"
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Try NL Analytics
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all font-semibold border-2 border-blue-200"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '🤖',
              title: 'Natural Language Analytics',
              description: 'Ask questions in plain English. Get insights instantly.',
              tags: ['Sentiment', 'Themes', 'Trends'],
            },
            {
              icon: '📊',
              title: 'Multi-Platform Aggregation',
              description: 'Reviews from Google, Yelp, Facebook, Synup unified.',
              tags: ['Aggregation', 'Real-time', 'Multi-source'],
            },
            {
              icon: '🗺️',
              title: 'Geospatial Intelligence',
              description: 'H3 hexagon clustering for community-level insights.',
              tags: ['H3 Hexagons', 'Location', 'Clustering'],
            },
            {
              icon: '🎁',
              title: 'Loyalty Automation',
              description: 'Yotpo integration with automatic point awards.',
              tags: ['Yotpo', 'Rewards', 'Auto-trigger'],
            },
            {
              icon: '📧',
              title: 'Marketing Campaigns',
              description: 'Klaviyo workflows triggered by customer sentiment.',
              tags: ['Klaviyo', 'Marketing', 'GDPR'],
            },
            {
              icon: '🎨',
              title: 'White-Label System',
              description: 'Full branding customization per tenant.',
              tags: ['Multi-tenant', 'Theming', 'Custom Domains'],
            },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="flex gap-2 flex-wrap">
                {feature.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Design Principles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Built on Six Design Pillars
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '🎯 Craft Above All',
                description: 'Excellence in every detail—parsing accuracy, visual refinement, response quality.',
              },
              {
                title: '❤️ Empathy',
                description: 'Adaptive responses for executives, analysts, managers, and casual users.',
              },
              {
                title: '🔍 Focus',
                description: 'Single NL input area is THE interface; everything else supports discovery.',
              },
              {
                title: '✨ Impute (Quality Signals)',
                description: 'Visual hierarchy, confidence badges, and transparency signal intelligence.',
              },
              {
                title: '😊 Friendliness',
                description: 'Conversational tone, contextual suggestions, and helpful error recovery.',
              },
              {
                title: '🧩 Simplicity Through Metaphor',
                description: 'Interface feels like talking to a knowledgeable data analyst colleague.',
              },
            ].map((principle, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{principle.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Production-Grade Stack</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Backend</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ FastAPI 0.104+ (Python 3.11+)</li>
                <li>✓ CockroachDB Serverless</li>
                <li>✓ Redis 7+ Caching</li>
                <li>✓ Celery 5.4+ Background Jobs</li>
                <li>✓ Gemini Pro + Claude 3 AI</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Frontend</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Next.js 14 (TypeScript)</li>
                <li>✓ Tailwind CSS 3+</li>
                <li>✓ Recharts 2+ (Data viz)</li>
                <li>✓ React Hook Form + Zod</li>
                <li>✓ TanStack Query v5</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16 py-8 text-center text-gray-600">
        <p className="text-sm">
          Review Engine v2.0 • Production-Ready • Enterprise White-Label Platform
        </p>
      </div>
    </div>
  )
}
