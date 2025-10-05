import React, { useState, useEffect } from 'react'
import { Search, Sun, DollarSign, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const Solar = () => {
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

  const analyzeSolar = async (e) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/solar/${encodeURIComponent(location)}`)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze solar potential')
      console.error('Solar analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excellent': return 'text-green-600'
      case 'Very Good': return 'text-blue-600'
      case 'Good': return 'text-yellow-600'
      case 'Moderate': return 'text-orange-600'
      default: return 'text-red-600'
    }
  }

  const getRecommendationColor = (rec) => {
    if (rec.includes('Highly')) return 'bg-green-100 text-green-800'
    if (rec.includes('Recommended')) return 'bg-blue-100 text-blue-800'
    if (rec.includes('Moderately')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Solar Potential Analysis</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate solar energy ROI and installation feasibility with NASA climate data
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={analyzeSolar} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location for solar potential analysis..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Analyzing Solar Potential...' : 'Get Solar Analysis'}
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
                <Sun className="text-yellow-600" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Solar Potential Analysis</h2>
                  <p className="text-gray-600">{results.location.name}, {results.location.country}</p>
                </div>
              </div>
            </div>

            {/* Solar Potential Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Solar Resource Assessment</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Sun className="mx-auto text-yellow-500 mb-3" size={32} />
                  <p className={`text-2xl font-bold ${getQualityColor(results.analysis.annualPotential.quality)}`}>
                    {results.analysis.annualPotential.quality}
                  </p>
                  <p className="text-sm text-gray-600">Solar Quality</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="mx-auto text-blue-500 mb-3" size={32} />
                  <p className="text-2xl font-bold text-gray-900">
                    {results.analysis.annualPotential.avgDailyRadiation}
                  </p>
                  <p className="text-sm text-gray-600">kWh/m²/day</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="mx-auto text-green-500 mb-3" size={32} />
                  <p className="text-2xl font-bold text-gray-900">
                    {results.analysis.annualPotential.capacityFactor}%
                  </p>
                  <p className="text-sm text-gray-600">Capacity Factor</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="mx-auto text-purple-500 mb-3" size={32} />
                  <p className="text-2xl font-bold text-gray-900">
                    {results.analysis.annualPotential.totalRadiation}
                  </p>
                  <p className="text-sm text-gray-600">kWh/m²/year</p>
                </div>
              </div>
            </div>

            {/* Financial Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <DollarSign className="text-green-500 mr-2" size={20} />
                Financial Analysis - {results.analysis.financialAnalysis.systemSize} kW System
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Cost Breakdown */}
                <div>
                  <h4 className="font-semibold mb-4">Cost Breakdown (INR)</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total System Cost</span>
                      <span className="font-semibold">₹{results.analysis.financialAnalysis.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-blue-600">Government Subsidy</span>
                      <span className="font-semibold text-blue-600">-₹{results.analysis.financialAnalysis.subsidyAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                      <span className="text-green-700 font-semibold">Net Cost After Subsidy</span>
                      <span className="font-bold text-green-700">₹{results.analysis.financialAnalysis.netCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ROI Analysis */}
                <div>
                  <h4 className="font-semibold mb-4">Return on Investment</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Savings</span>
                      <span className="font-semibold">₹{results.analysis.financialAnalysis.annualSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback Period</span>
                      <span className="font-semibold">{results.analysis.financialAnalysis.paybackPeriod} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual ROI</span>
                      <span className="font-semibold text-green-600">{results.analysis.financialAnalysis.roi}%</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Lifetime Profit</span>
                      <span className="text-green-600">₹{results.analysis.financialAnalysis.netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`mt-6 p-4 rounded-lg ${getRecommendationColor(results.analysis.financialAnalysis.recommendation)}`}>
                <div className="flex items-center">
                  {results.analysis.financialAnalysis.recommendation.includes('Highly') ? (
                    <CheckCircle className="mr-2" size={20} />
                  ) : (
                    <AlertTriangle className="mr-2" size={20} />
                  )}
                  <span className="font-semibold">{results.analysis.financialAnalysis.recommendation}</span>
                </div>
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">Monthly Solar Radiation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.analysis.monthlyData.map((month, index) => (
                  <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">{month.month}</p>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-yellow-600">{month.dailyRadiation}</p>
                      <p className="text-xs text-gray-600">kWh/m²/day</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${(month.dailyRadiation / 8) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Installation Guidance</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Feasibility Score</h4>
                    <p className="text-3xl font-bold text-green-600">
                      {results.analysis.installationRecommendation.overallScore}/100
                    </p>
                    <p className="text-sm text-green-700">
                      {results.analysis.installationRecommendation.feasible ? 'Suitable for Solar' : 'Consider Alternatives'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Best Installation Time</h4>
                    <p className="text-lg text-blue-600 font-semibold">
                      {results.analysis.installationRecommendation.bestInstallationTime}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Peak Production Months</h4>
                    <p className="text-yellow-600 font-medium">
                      {results.analysis.installationRecommendation.peakProductionMonths.join(', ')}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Lower Production</h4>
                    <p className="text-orange-600 font-medium">
                      {results.analysis.installationRecommendation.lowProductionMonths.join(', ') || 'Minimal variation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                {results.analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">{rec.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-gray-700">{rec.content}</p>
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

export default Solar