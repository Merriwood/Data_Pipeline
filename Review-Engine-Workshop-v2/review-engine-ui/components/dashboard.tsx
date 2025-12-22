'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Star, TrendingUp, Users, MessageSquare, Zap, MapPin } from 'lucide-react'

const sentimentData = [
  { name: 'Positive', value: 68, color: '#34C759' },
  { name: 'Neutral', value: 22, color: '#FF9500' },
  { name: 'Negative', value: 10, color: '#FF3B30' },
]

const trendData = [
  { date: 'Mon', reviews: 24, sentiment: 8.2 },
  { date: 'Tue', reviews: 32, sentiment: 8.4 },
  { date: 'Wed', reviews: 28, sentiment: 8.1 },
  { date: 'Thu', reviews: 45, sentiment: 8.6 },
  { date: 'Fri', reviews: 38, sentiment: 8.3 },
  { date: 'Sat', reviews: 52, sentiment: 8.8 },
  { date: 'Sun', reviews: 41, sentiment: 8.5 },
]

const platformData = [
  { platform: 'Google', count: 156, rating: 4.7 },
  { platform: 'Yelp', count: 89, rating: 4.5 },
  { platform: 'Facebook', count: 124, rating: 4.6 },
  { platform: 'Synup', count: 67, rating: 4.8 },
]

const communityData = [
  { id: 1, hexId: 'hex_001', neighborhood: 'Downtown', reviews: 45, sentiment: 8.5, loyalty: 156 },
  { id: 2, hexId: 'hex_002', neighborhood: 'Midtown', reviews: 38, sentiment: 8.2, loyalty: 142 },
  { id: 3, hexId: 'hex_003', neighborhood: 'Uptown', reviews: 52, sentiment: 8.7, loyalty: 189 },
  { id: 4, hexId: 'hex_004', neighborhood: 'Westside', reviews: 31, sentiment: 7.9, loyalty: 98 },
]

export function Dashboard() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Review Engine Dashboard</h1>
        <p className="text-gray-600 mt-2">Enterprise Review Analytics & Insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
        <KPICard
          title="Total Reviews"
          value="436"
          change="+12%"
          icon={<MessageSquare className="w-6 h-6" />}
          color="blue"
        />
        <KPICard
          title="Avg Rating"
          value="4.65"
          change="+0.2"
          icon={<Star className="w-6 h-6" />}
          color="green"
        />
        <KPICard
          title="Loyalty Points Awarded"
          value="1,247"
          change="+8.5%"
          icon={<Zap className="w-6 h-6" />}
          color="orange"
        />
        <KPICard
          title="Communities Active"
          value="4"
          change="+1"
          icon={<MapPin className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="px-8 pb-8">
        {/* Sentiment & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sentiment Pie Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Review Trends */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Review Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reviews" stroke="#007AFF" strokeWidth={2} />
                <Line type="monotone" dataKey="sentiment" stroke="#34C759" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Performance & Community Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Platform Stats */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#007AFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Community Insights */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Insights (H3 Hexagons)</h2>
            <div className="space-y-3">
              {communityData.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{community.neighborhood}</p>
                    <p className="text-sm text-gray-600">{community.hexId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{community.sentiment}/10</div>
                    <div className="text-xs text-gray-600">{community.reviews} reviews</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {[
              {
                author: 'Sarah Johnson',
                platform: 'Google',
                rating: 5,
                text: 'Excellent service! Highly recommended.',
                sentiment: 'Positive',
                date: '2 hours ago',
                pointsAwarded: 100,
              },
              {
                author: 'Michael Chen',
                platform: 'Yelp',
                rating: 4,
                text: 'Good experience, could use better parking.',
                sentiment: 'Positive',
                date: '5 hours ago',
                pointsAwarded: 75,
              },
              {
                author: 'Emma Rodriguez',
                platform: 'Facebook',
                rating: 5,
                text: 'Amazing team and fantastic results!',
                sentiment: 'Positive',
                date: '8 hours ago',
                pointsAwarded: 100,
              },
              {
                author: 'David Kim',
                platform: 'Google',
                rating: 3,
                text: 'Average experience, met expectations.',
                sentiment: 'Neutral',
                date: '12 hours ago',
                pointsAwarded: 0,
              },
            ].map((review, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.author}</p>
                    <p className="text-sm text-gray-600">{review.platform} • {review.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                      {'⭐'.repeat(review.rating)}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      review.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {review.sentiment}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700">{review.text}</p>
                {review.pointsAwarded > 0 && (
                  <p className="text-sm text-green-600 mt-2">✓ {review.pointsAwarded} points awarded via Yotpo</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-green-600 mt-2 font-medium">{change}</p>
        </div>
        <div className={`${colorMap[color as keyof typeof colorMap]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
