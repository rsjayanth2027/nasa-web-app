import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('travel');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [wakeUpLoading, setWakeUpLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://nasa-web-app-cxjn.onrender.com';

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      console.log(`🔍 Checking backend health at: ${BACKEND_URL}/api/health`);
      const response = await axios.get(`${BACKEND_URL}/api/health`, { 
        timeout: 10000 
      });
      setBackendStatus('connected');
      setError('');
      console.log('✅ Backend connected:', response.data);
    } catch (err) {
      console.error('❌ Backend health check failed:', err.message);
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('timeout')) {
        setBackendStatus('sleeping');
        setError('Server is sleeping. Click "Wake Up Server" to start it.');
      } else {
        setBackendStatus('disconnected');
        setError('Backend server is offline. Click "Wake Up Server" to start it.');
      }
    }
  };

  const wakeUpServer = async () => {
    setWakeUpLoading(true);
    setError('Waking up server... This may take 30-60 seconds.');
    
    try {
      console.log('🔄 Attempting to wake up server...');
      
      const response = await axios.get(`${BACKEND_URL}/api/health`, {
        timeout: 45000
      });
      
      console.log('✅ Server response:', response.data);
      setBackendStatus('connected');
      setError('');
      setWakeUpLoading(false);
      
    } catch (err) {
      console.log('🔄 Server is waking up slowly, will auto-retry...');
      
      setTimeout(() => {
        checkBackendHealth();
      }, 10000);
      
      setWakeUpLoading(false);
    }
  };

  const analyzeData = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    if (backendStatus === 'sleeping' || backendStatus === 'disconnected') {
      setError('Server is sleeping. Waking it up first...');
      await wakeUpServer();
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let endpoint = '';
      switch (activeTab) {
        case 'travel':
          endpoint = `/api/travel/${encodeURIComponent(location)}`;
          break;
        case 'agriculture':
          endpoint = `/api/agriculture/rice/${encodeURIComponent(location)}`;
          break;
        case 'solar':
          endpoint = `/api/solar/${encodeURIComponent(location)}`;
          break;
        case 'risk':
          endpoint = `/api/risk/${encodeURIComponent(location)}`;
          break;
      }

      const fullUrl = `${BACKEND_URL}${endpoint}`;
      console.log(`🔄 Fetching from: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, { 
        timeout: 30000 
      });
      
      console.log('✅ Response received:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      setResults(response.data);
    } catch (err) {
      console.error('❌ API Error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Failed to fetch data.';
      setError(errorMessage);
      
      if (err.code === 'ECONNREFUSED') {
        setBackendStatus('sleeping');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickTestLocations = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

  const renderTravelResults = () => {
    if (!results?.analysis) return null;

    return (
      <div className="results-container">
        <div className="location-header">
          <div className="location-title">
            <h3>🌍 {results.location?.name || location}</h3>
            <p className="location-subtitle">Travel Climate Analysis</p>
          </div>
        </div>

        {results.analysis.bestTravelMonths && results.analysis.bestTravelMonths.length > 0 && (
          <div className="best-months">
            <h4>🌟 Best Months to Visit</h4>
            <div className="months-grid">
              {results.analysis.bestTravelMonths.slice(0, 6).map((month, index) => (
                <div key={index} className="month-card">
                  <div className="month-name">{month.month}</div>
                  <div className="month-score">{month.overallScore}/10</div>
                  <div className="month-details">
                    <span>🌡️ {month.temperature}°C</span>
                    <span>🌧️ {month.rainfall}mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.analysis.recommendations && results.analysis.recommendations.length > 0 && (
          <div className="recommendations">
            <h4>💡 Travel Recommendations</h4>
            <div className="recommendations-grid">
              {results.analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-emoji">{rec.emoji}</div>
                  <div className="recommendation-content">
                    <h5>{rec.title}</h5>
                    <p>{rec.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgricultureResults = () => {
    if (!results?.analysis) return null;

    return (
      <div className="results-container">
        <div className="location-header">
          <div className="location-title">
            <h3>🌾 {results.location?.name || location}</h3>
            <p className="location-subtitle">Rice Cultivation Analysis</p>
          </div>
        </div>

        {results.analysis.yieldPotential && (
          <div className="yield-potential">
            <h4>📈 Yield Potential Analysis</h4>
            <div className="yield-content">
              <div className="yield-score">
                <div className="yield-value">{results.analysis.yieldPotential.score}/100</div>
                <div className={`yield-category ${results.analysis.yieldPotential.category?.toLowerCase() || 'medium'}`}>
                  {results.analysis.yieldPotential.category || 'Medium'} Potential
                </div>
              </div>
              <div className="yield-estimate">
                Estimated Production: <strong>{results.analysis.yieldPotential.estimatedYield}</strong>
              </div>
            </div>
          </div>
        )}

        {results.analysis.plantingSchedule && (
          <div className="planting-schedule">
            <h4>📅 Planting Schedule</h4>
            <div className="schedule-grid">
              <div className="schedule-item">
                <div className="schedule-emoji">🌱</div>
                <div className="schedule-content">
                  <strong>Planting</strong>
                  <p>{results.analysis.plantingSchedule.planting}</p>
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-emoji">🌿</div>
                <div className="schedule-content">
                  <strong>Growth</strong>
                  <p>{results.analysis.plantingSchedule.growth}</p>
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-emoji">🌾</div>
                <div className="schedule-content">
                  <strong>Harvest</strong>
                  <p>{results.analysis.plantingSchedule.harvest}</p>
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-emoji">📦</div>
                <div className="schedule-content">
                  <strong>Market</strong>
                  <p>{results.analysis.plantingSchedule.market}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {results.analysis.recommendations && results.analysis.recommendations.length > 0 && (
          <div className="recommendations">
            <h4>💡 Farming Recommendations</h4>
            <div className="recommendations-grid">
              {results.analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-emoji">{rec.emoji}</div>
                  <div className="recommendation-content">
                    <h5>{rec.title}</h5>
                    <p>{rec.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSolarResults = () => {
    if (!results?.analysis) return null;

    return (
      <div className="results-container">
        <div className="location-header">
          <div className="location-title">
            <h3>☀️ {results.location?.name || location}</h3>
            <p className="location-subtitle">Solar Potential Analysis</p>
          </div>
        </div>

        {results.analysis.annualPotential && (
          <div className="solar-potential">
            <h4>📊 Solar Resource Assessment</h4>
            <div className="potential-grid">
              <div className="potential-item">
                <div className="potential-icon">☀️</div>
                <span className="value">{results.analysis.annualPotential.avgDailyRadiation} kWh/m²/day</span>
                <span className="label">Daily Radiation</span>
              </div>
              <div className="potential-item">
                <div className="potential-icon">📈</div>
                <span className="value">{results.analysis.annualPotential.totalRadiation} kWh/m²/year</span>
                <span className="label">Annual Radiation</span>
              </div>
              <div className="potential-item">
                <div className="potential-icon">⚡</div>
                <span className="value">{results.analysis.annualPotential.capacityFactor}%</span>
                <span className="label">Capacity Factor</span>
              </div>
              <div className="potential-item">
                <div className="potential-icon">🏆</div>
                <span className="value">{results.analysis.annualPotential.potential}</span>
                <span className="label">Solar Quality</span>
              </div>
            </div>
          </div>
        )}

        {results.analysis.financialAnalysis && (
          <div className="financial-analysis">
            <h4>💰 Financial Analysis ({results.analysis.financialAnalysis.systemSize} kW System)</h4>
            <div className="financial-grid">
              <div className="financial-item">
                <span className="value">₹{results.analysis.financialAnalysis.totalCost?.toLocaleString()}</span>
                <span className="label">Total Cost</span>
              </div>
              <div className="financial-item">
                <span className="value">₹{results.analysis.financialAnalysis.subsidyAmount?.toLocaleString()}</span>
                <span className="label">Subsidy</span>
              </div>
              <div className="financial-item highlight">
                <span className="value">₹{results.analysis.financialAnalysis.netCost?.toLocaleString()}</span>
                <span className="label">Net Cost</span>
              </div>
              <div className="financial-item">
                <span className="value">{results.analysis.financialAnalysis.paybackPeriod} years</span>
                <span className="label">Payback Period</span>
              </div>
              <div className="financial-item">
                <span className="value">{results.analysis.financialAnalysis.roi}%</span>
                <span className="label">Annual ROI</span>
              </div>
            </div>
          </div>
        )}

        {results.analysis.recommendations && results.analysis.recommendations.length > 0 && (
          <div className="recommendations">
            <h4>💡 Solar Installation Recommendations</h4>
            <div className="recommendations-grid">
              {results.analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-emoji">{rec.emoji}</div>
                  <div className="recommendation-content">
                    <h5>{rec.title}</h5>
                    <p>{rec.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRiskResults = () => {
    if (!results?.riskAnalysis) return null;

    return (
      <div className="results-container">
        <div className="location-header">
          <div className="location-title">
            <h3>⚠️ {results.location?.name || location}</h3>
            <p className="location-subtitle">Climate Risk Assessment</p>
          </div>
          <div className={`risk-level-badge ${results.riskAnalysis.overallRiskLevel?.toLowerCase() || 'medium'}`}>
            {results.riskAnalysis.overallRiskLevel || 'Medium'} Risk
          </div>
        </div>

        {results.riskAnalysis.disasterProbabilities && (
          <div className="disaster-probabilities">
            <h4>🌪️ Disaster Risk Probabilities</h4>
            <div className="probabilities-grid">
              {Object.entries(results.riskAnalysis.disasterProbabilities).map(([disaster, probability]) => (
                <div key={disaster} className="probability-item">
                  <div className="probability-info">
                    <span className="disaster-name">{disaster.charAt(0).toUpperCase() + disaster.slice(1)}</span>
                    <span className="disaster-probability">{probability}%</span>
                  </div>
                  <div className="probability-bar">
                    <div 
                      className={`probability-fill ${probability >= 70 ? 'high' : probability >= 50 ? 'medium' : 'low'}`}
                      style={{ width: `${probability}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.riskAnalysis.preparedness && results.riskAnalysis.preparedness.length > 0 && (
          <div className="preparedness">
            <h4>🛡️ Preparedness Recommendations</h4>
            <div className="preparedness-grid">
              {results.riskAnalysis.preparedness.map((prep, index) => (
                <div key={index} className="preparedness-card">
                  <div className="preparedness-emoji">{prep.emoji}</div>
                  <div className="preparedness-content">
                    <h5>{prep.title}</h5>
                    <p>{prep.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <div className="space-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🛰️</div>
            <div className="logo-text">
              <h1>StarWave Climate</h1>
              <p>NASA-Powered Climate Intelligence</p>
            </div>
          </div>
          <div className={`status ${backendStatus}`}>
            {backendStatus === 'connected' ? '🟢 Systems Online' : 
             backendStatus === 'sleeping' ? '🟡 Server Sleeping' : 
             backendStatus === 'waking-up' ? '🟡 Waking Up...' : 
             '🔴 Systems Offline'}
            <div className="backend-url">Backend: {BACKEND_URL}</div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="mission-control">
          <h2>🌌 Mission Control</h2>
          <p>Analyze climate data for any location on Earth</p>
        </div>

        <div className="tabs">
          {[
            { id: 'travel', name: '🚀 Travel', icon: '🌍' },
            { id: 'agriculture', name: '🌾 Agriculture', icon: '🌱' },
            { id: 'solar', name: '☀️ Solar', icon: '⚡' },
            { id: 'risk', name: '⚠️ Risk', icon: '🛡️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="search-section">
          <div className="search-container">
            <div className="search-input-container">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={`Enter location for ${activeTab} analysis...`}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && analyzeData()}
              />
              <button
                onClick={analyzeData}
                disabled={loading || !location.trim() || backendStatus === 'sleeping' || backendStatus === 'disconnected'}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Launch Analysis</span>
                  </>
                )}
              </button>
            </div>

            <div className="quick-locations">
              <span className="quick-label">Quick test locations:</span>
              <div className="location-buttons">
                {quickTestLocations.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocation(city);
                      setTimeout(analyzeData, 100);
                    }}
                    className="quick-location-btn"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>
                {backendStatus === 'sleeping' ? 'Server Asleep' : 'Connection Error'}
              </strong>
              <p>{error}</p>
              
              {(backendStatus === 'disconnected' || backendStatus === 'sleeping') && (
                <div className="troubleshooting">
                  <p><strong>Free hosting alert:</strong> Server sleeps after 15 minutes of inactivity</p>
                  
                  <button 
                    onClick={wakeUpServer}
                    disabled={wakeUpLoading}
                    className="wake-up-button"
                  >
                    {wakeUpLoading ? (
                      <>
                        <div className="button-spinner"></div>
                        <span>Waking Up Server...</span>
                      </>
                    ) : (
                      <>
                        <span>🔔 Wake Up Server</span>
                      </>
                    )}
                  </button>
                  
                  <div className="server-info">
                    <p>⏱️ Takes 30-60 seconds to start</p>
                    <p>🔄 Will auto-retry once awake</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-animation">
            <div className="satellite">
              <div className="satellite-body">🛰️</div>
              <div className="orbit"></div>
            </div>
            <div className="loading-text">
              <h3>🛰️ Scanning Climate Data</h3>
              <p>Analyzing NASA climate data for {location}...</p>
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="results-section">
            {activeTab === 'travel' && renderTravelResults()}
            {activeTab === 'agriculture' && renderAgricultureResults()}
            {activeTab === 'solar' && renderSolarResults()}
            {activeTab === 'risk' && renderRiskResults()}
          </div>
        )}

        {!results && !loading && !error && (
          <div className="welcome-message">
            <div className="welcome-content">
              <h3>🌍 Welcome to StarWave Climate</h3>
              <p>Powered by NASA's Earth observation satellites and climate data</p>
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon">🛰️</div>
                  <h4>Climate Intelligence</h4>
                  <p>Real-time climate analysis</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h4>Multi-Year Analysis</h4>
                  <p>Comprehensive climate trend data</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌡️</div>
                  <h4>Multi-Parameter</h4>
                  <p>Temperature, rainfall, solar & risk analysis</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ from StarWave • NASA-Powered Climate Intelligence</p>
        <p>Backend: {BACKEND_URL}</p>
      </footer>
    </div>
  );
}

export default App;
