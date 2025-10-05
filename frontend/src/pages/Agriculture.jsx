//agriculture.jsx

import React, { useState, useEffect } from 'react'
import { Search, Sprout, Calendar, TrendingUp, AlertTriangle, CheckCircle, Droplets, Thermometer } from 'lucide-react'
import axios from 'axios'

const Agriculture = () => {
  const [location, setLocation] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const prefill = urlParams.get('prefill')
    if (prefill) {
      setLocation(prefill)
    }
  }, [])

  const analyzeAgriculture = async (e) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/agriculture/rice/${encodeURIComponent(location)}`)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze agriculture conditions')
      console.error('Agriculture analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getYieldColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agriculture Intelligence</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rice cultivation insights with optimal planting timing and climate risk assessment
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={analyzeAgriculture} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location for rice cultivation analysis..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Analyzing Agriculture Data...' : 'Get Rice Cultivation Insights'}
          </button>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Location Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <Sprout className="text-green-600" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Rice Cultivation Analysis</h2>
                  <p className="text-gray-600">{results.location.name}, {results.location.country}</p>
                </div>
              </div>
            </div>

            {/* Growing Seasons */}
            {results.analysis.growingSeasons.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="text-green-500 mr-2" size={20} />
                  Optimal Growing Seasons
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {results.analysis.growingSeasons.slice(0, 2).map((season, index) => (
                    <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">Season {index + 1}</h4>
                          <p className="text-green-600 font-medium">
                            Score: {season.score}/100
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{season.duration}M</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Months:</span>
                          <span className="font-medium">{season.months.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Planting:</span>
                          <span className="font-medium">{season.plantingWindow}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harvest:</span>
                          <span className="font-medium">{season.harvestWindow}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Temp:</span>
                          <span className="font-medium">{season.avgTemperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rainfall:</span>
                          <span className="font-medium">{season.totalRainfall}mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yield Potential */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="text-blue-500 mr-2" size={20} />
                Yield Potential Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getYieldColor(results.analysis.yieldPotential.score)}`}>
                      {results.analysis.yieldPotential.score}/100
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      results.analysis.yieldPotential.category === 'High' ? 'bg-green-100 text-green-800' :
                      results.analysis.yieldPotential.category === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {results.analysis.yieldPotential.category} Potential
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Estimated Production</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {results.analysis.yieldPotential.estimatedYield} tons/hectare
                    </p>
                    <p className="text-sm text-gray-600">Under optimal conditions</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Factor Scores</h4>
                  {Object.entries(results.analysis.yieldPotential.factors).map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{factor.replace(/([A-Z])/g, ' $1')}:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-medium">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Climate Risks */}
            {results.analysis.risks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                  Climate Risks & Alerts
                </h3>
                <div className="grid gap-4">
                  {results.analysis.risks.map((risk, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {risk.type.replace('_', ' ')} Risk
                          </h4>
                          <p className="text-gray-600">{risk.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.level)}`}>
                          {risk.level} Risk ({risk.probability}% probability)
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">
                        💡 Mitigation: {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Cultivation Recommendations</h3>
              <div className="space-y-3">
                {results.analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <span className="text-2xl">{rec.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-gray-700">{rec.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Data */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Monthly Climate Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.analysis.monthlyData.map((month, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">{month.month}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center space-x-1">
                        <Thermometer size={12} className="text-orange-500" />
                        <span>{month.avgTemp}°C</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <Droplets size={12} className="text-blue-500" />
                        <span>{month.totalRain}mm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Agriculture