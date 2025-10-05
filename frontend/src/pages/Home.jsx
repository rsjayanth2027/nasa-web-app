import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Globe, Sun, Sprout, Shield, ArrowRight, Satellite } from 'lucide-react'
import axios from 'axios'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickResults, setQuickResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const features = [
    {
      icon: Globe,
      title: 'Travel Intelligence',
      description: 'Get climate-optimized travel recommendations with seasonal insights',
      path: '/travel',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sprout,
      title: 'Agriculture Insights',
      description: 'Rice cultivation advice with optimal planting and harvest timing',
      path: '/agriculture',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sun,
      title: 'Solar Potential',
      description: 'Calculate solar energy ROI and installation feasibility',
      path: '/solar',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Climate disaster risk analysis and preparedness guidance',
      path: '/risk',
      color: 'from-red-500 to-pink-500'
    }
  ]

  const handleQuickSearch = async (command) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/${command}/${encodeURIComponent(searchQuery)}`)
      setQuickResults({
        command,
        data: response.data,
        location: searchQuery
      })
    } catch (error) {
      console.error('Quick search failed:', error)
      setQuickResults({
        command,
        error: 'Failed to fetch data. Please try again.',
        location: searchQuery
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Satellite size={64} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            NASA Climate Intelligence Assistant
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform climate data into actionable insights for travel, agriculture, 
            solar energy, and risk assessment using NASA's powerful APIs.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter any location (e.g., Mumbai, Delhi, Bangalore...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-nasa-blue"
              />
            </div>
            
            {/* Quick Action Buttons */}
            {searchQuery && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button
                  onClick={() => handleQuickSearch('travel')}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Globe size={16} />
                  <span>Travel Insights</span>
                </button>
                <button
                  onClick={() => handleQuickSearch('agriculture/rice')}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sprout size={16} />
                  <span>Rice Analysis</span>
                </button>
                <button
                  onClick={() => handleQuickSearch('solar')}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sun size={16} />
                  <span>Solar Potential</span>
                </button>
                <button
                  onClick={() => handleQuickSearch('risk')}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Shield size={16} />
                  <span>Risk Assessment</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Results */}
          {quickResults && (
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">
                Quick {quickResults.command} Results for {quickResults.location}
              </h3>
              
              {quickResults.error ? (
                <p className="text-red-300">{quickResults.error}</p>
              ) : (
                <div className="text-left">
                  {quickResults.command === 'travel' && quickResults.data.analysis && (
                    <div>
                      <p className="text-lg mb-2">
                        🌟 Best months: {quickResults.data.analysis.bestTravelMonths.map(m => m.month).join(', ')}
                      </p>
                      <p className="text-gray-300">
                        Current: {quickResults.data.analysis.currentConditions.temperature}°C, 
                        {quickResults.data.analysis.currentConditions.description}
                      </p>
                    </div>
                  )}
                  
                  {quickResults.command === 'agriculture/rice' && quickResults.data.analysis && (
                    <div>
                      <p className="text-lg mb-2">
                        🌱 {quickResults.data.analysis.growingSeasons.length > 0 
                          ? `Plant in ${quickResults.data.analysis.growingSeasons[0].plantingWindow}`
                          : 'Limited growing seasons'
                        }
                      </p>
                      <p className="text-gray-300">
                        Yield Potential: {quickResults.data.analysis.yieldPotential.category}
                      </p>
                    </div>
                  )}
                  
                  {quickResults.command === 'solar' && quickResults.data.analysis && (
                    <div>
                      <p className="text-lg mb-2">
                        ☀️ {quickResults.data.analysis.annualPotential.quality} Solar Potential
                      </p>
                      <p className="text-gray-300">
                        ROI: {quickResults.data.analysis.financialAnalysis.roi}% | 
                        Payback: {quickResults.data.analysis.financialAnalysis.paybackPeriod} years
                      </p>
                    </div>
                  )}
                  
                  {quickResults.command === 'risk' && quickResults.data.riskAnalysis && (
                    <div>
                      <p className="text-lg mb-2">
                        🛡️ Overall Risk: {quickResults.data.riskAnalysis.overallRiskLevel}
                      </p>
                      <p className="text-gray-300">
                        Primary risks: {Object.entries(quickResults.data.riskAnalysis.disasterProbabilities)
                          .filter(([_, prob]) => prob > 50)
                          .map(([type]) => type)
                          .join(', ')
                        }
                      </p>
                    </div>
                  )}
                  
                  <Link
                    to={`/${quickResults.command.split('/')[0]}`}
                    state={{ prefill: searchQuery }}
                    className="inline-flex items-center space-x-2 text-blue-300 hover:text-white mt-4"
                  >
                    <span>View Full Analysis</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Climate Intelligence Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <Link
                  key={index}
                  to={feature.path}
                  className="block group"
                >
                  <div className="card-hover bg-gray-50 rounded-xl p-6 h-full border border-gray-200 group-hover:border-gray-300">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                      <span>Explore</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Powered by NASA & Scientific Data
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-nasa-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Satellite className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">NASA POWER API</h3>
              <p className="text-gray-600">20+ years of climate and solar data</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">OpenWeatherMap</h3>
              <p className="text-gray-600">Real-time weather conditions</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Agricultural Models</h3>
              <p className="text-gray-600">Crop-specific intelligence algorithms</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home