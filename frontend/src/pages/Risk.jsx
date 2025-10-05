//risk.jsx

import React, { useState, useEffect } from 'react'
import { Search, Shield, AlertTriangle, TrendingUp, Calendar, CheckCircle } from 'lucide-react'
import axios from 'axios'

const Risk = () => {
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

  const analyzeRisk = async (e) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/risk/${encodeURIComponent(location)}`)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze climate risks')
      console.error('Risk analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 70) return 'text-red-600'
    if (probability >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getTrendColor = (trend) => {
    if (trend === 'Increasing') return 'text-red-600'
    if (trend === 'Decreasing') return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Climate Risk Assessment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            20-year historical climate risk analysis and disaster preparedness guidance
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={analyzeRisk} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location for climate risk assessment..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Analyzing Climate Risks...' : 'Get Risk Assessment'}
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
                <Shield className="text-red-600" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Climate Risk Assessment</h2>
                  <p className="text-gray-600">{results.location.name}, {results.location.country}</p>
                </div>
                <div className="ml-auto">
                  <div className={`px-4 py-2 rounded-full text-white font-semibold ${getRiskColor(results.riskAnalysis.overallRiskLevel)}`}>
                    {results.riskAnalysis.overallRiskLevel} Overall Risk
                  </div>
                </div>
              </div>
            </div>

            {/* Disaster Probabilities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                Disaster Risk Probabilities
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(results.riskAnalysis.disasterProbabilities).map(([disaster, probability]) => (
                  <div key={disaster} className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="text-white" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-900 capitalize mb-2">
                      {disaster} Risk
                    </h4>
                    <p className={`text-2xl font-bold ${getProbabilityColor(probability)}`}>
                      {probability}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getRiskColor(
                          probability >= 70 ? 'high' : probability >= 50 ? 'medium' : 'low'
                        )}`}
                        style={{ width: `${probability}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Climate Trends */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <TrendingUp className="text-blue-500 mr-2" size={20} />
                20-Year Climate Trends ({results.riskAnalysis.climateTrends.dataPeriod})
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(results.riskAnalysis.climateTrends).map(([metric, data]) => {
                  if (typeof data === 'object' && data.trend) {
                    return (
                      <div key={metric} className="text-center p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 capitalize mb-3">
                          {metric.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <div className="space-y-2">
                          <p className={`text-lg font-bold ${getTrendColor(data.trend)}`}>
                            {data.trend}
                          </p>
                          <p className="text-sm text-gray-600">
                            Rate: {data.rate} {metric === 'temperature' ? '°C/year' : 'mm/year'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Confidence: {data.confidence}%
                          </p>
                          <div className="w-16 h-1 bg-gray-300 rounded mx-auto">
                            <div 
                              className={`h-1 rounded ${
                                data.trend === 'Increasing' ? 'bg-red-500' : 
                                data.trend === 'Decreasing' ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${data.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>

              {/* Extreme Events Analysis */}
              {results.riskAnalysis.climateTrends.extremeEvents && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-3">Extreme Events Frequency</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(results.riskAnalysis.climateTrends.extremeEvents).map(([event, count]) => (
                      <div key={event} className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{count}</p>
                        <p className="text-sm text-orange-700 capitalize">
                          {event.replace(/([A-Z])/g, ' $1')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seasonal Risk Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="text-purple-500 mr-2" size={20} />
                Seasonal Risk Calendar
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.riskAnalysis.riskCalendar.map((month, index) => (
                  <div key={index} className={`text-center p-3 rounded-lg border-2 ${
                    month.riskLevel === 'High' ? 'bg-red-50 border-red-200' :
                    month.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <p className="font-semibold text-gray-900 mb-1">{month.month}</p>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      month.riskLevel === 'High' ? 'bg-red-500 text-white' :
                      month.riskLevel === 'Medium' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {month.riskLevel}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 capitalize">
                      {month.primaryRisk}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparedness Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Preparedness & Safety Recommendations</h3>
              <div className="space-y-3">
                {results.riskAnalysis.preparedness.map((prep, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">{prep.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{prep.title}</h4>
                      <p className="text-gray-700">{prep.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Risks */}
            {results.riskAnalysis.seasonalRisks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Detailed Seasonal Risks</h3>
                <div className="space-y-4">
                  {results.riskAnalysis.seasonalRisks.map((season, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{season.month}</h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          season.overallRisk === 'High' ? 'bg-red-100 text-red-800' :
                          season.overallRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {season.overallRisk} Risk
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {season.risks.map((risk, riskIndex) => (
                          <span
                            key={riskIndex}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              risk.level === 'High' ? 'bg-red-500 text-white' :
                              risk.level === 'Medium' ? 'bg-yellow-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}
                          >
                            {risk.type} ({risk.level})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Risk