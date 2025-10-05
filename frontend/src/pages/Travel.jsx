import React, { useState, useEffect } from 'react'
import { Search, MapPin, Thermometer, CloudRain, Droplets, Sun, Calendar, Star } from 'lucide-react'
import axios from 'axios'

const Travel = () => {
  const [location, setLocation] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prefill from home page quick search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const prefill = urlParams.get('prefill')
    if (prefill) {
      setLocation(prefill)
    }
  }, [])

  const analyzeTravel = async (e) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/travel/${encodeURIComponent(location)}`)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze travel conditions')
      console.error('Travel analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComfortLevel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Very Good'
    if (score >= 60) return 'Good'
    if (score >= 50) return 'Moderate'
    return 'Poor'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Travel Intelligence</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get climate-optimized travel recommendations with seasonal insights powered by NASA climate data
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={analyzeTravel} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter destination (e.g., Goa, Kerala, Himachal Pradesh...)"
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Analyzing Climate Data...' : 'Get Travel Insights'}
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
                <MapPin className="text-blue-600" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{results.location.name}</h2>
                  <p className="text-gray-600">{results.location.country}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-500">Data Confidence</p>
                  <p className="text-lg font-semibold text-green-600">
                    {results.analysis.confidenceScore}%
                  </p>
                </div>
              </div>
            </div>

            {/* Current Conditions */}
            {results.analysis.currentConditions && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Thermometer className="text-orange-500 mr-2" size={20} />
                  Current Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Thermometer className="mx-auto text-orange-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{results.analysis.currentConditions.temperature}°C</p>
                    <p className="text-sm text-gray-600">Temperature</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <CloudRain className="mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {results.analysis.currentConditions.description}
                    </p>
                    <p className="text-sm text-gray-600">Weather</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <Droplets className="mx-auto text-cyan-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{results.analysis.currentConditions.humidity}%</p>
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Sun className="mx-auto text-yellow-500 mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">{results.analysis.currentConditions.windSpeed}m/s</p>
                    <p className="text-sm text-gray-600">Wind Speed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Best Travel Months */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="text-green-500 mr-2" size={20} />
                Best Time to Visit
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.analysis.bestTravelMonths.map((month, index) => (
                  <div key={index} className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="text-white" size={20} />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{month.month}</p>
                    <p className={`text-sm font-semibold ${getScoreColor(month.overallScore)}`}>
                      Score: {month.overallScore}/100
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {month.temperature}°C • {month.rainfall}mm rain
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Monthly Climate Breakdown</h3>
              <div className="grid gap-3">
                {results.analysis.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-lg font-semibold text-gray-900">{month.month}</div>
                      <div className="w-24">
                        <div className="flex items-center space-x-2">
                          <Thermometer size={16} className="text-orange-500" />
                          <span className="text-sm">{month.temperature}°C</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CloudRain size={16} className="text-blue-500" />
                          <span className="text-sm">{month.rainfall}mm</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(month.overallScore)}`}>
                          {month.overallScore}
                        </p>
                        <p className="text-xs text-gray-600">{getComfortLevel(month.overallScore)}</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            month.overallScore >= 80 ? 'bg-green-500' :
                            month.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${month.overallScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Travel Recommendations</h3>
              <div className="space-y-3">
                {results.analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">{rec.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-gray-700">{rec.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Data Sources & Methodology</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• NASA POWER API: 5-year historical climate data analysis</p>
                <p>• OpenWeatherMap: Real-time weather conditions</p>
                <p>• LocationIQ: Geocoding and location data</p>
                <p>• Algorithm: Multi-factor comfort scoring based on temperature, rainfall, humidity, and solar radiation</p>
                <p className="text-xs mt-2">Last updated: {new Date(results.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Travel