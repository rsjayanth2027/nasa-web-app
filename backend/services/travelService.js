const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

class TravelService {
  constructor() {
    this.nasaApiKey = process.env.NASA_API_KEY || 'iyJSYZGvocAPedgTECmpuizoLJCxEidgpgKBfNga';
    this.openWeatherKey = process.env.OPENWEATHER_API_KEY || '969cdba4bb73b77d6d4cf8846286fa94';
    this.locationIqKey = process.env.LOCATIONIQ_API_KEY || 'pk.e7a04104abcd5be2356b4a700e3da660';
  }

  async getTravelInsights(location) {
    const cacheKey = `travel_${location.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🧳 Analyzing travel for: ${location}`);
      
      // Step 1: Geocode location
      const geoData = await this.geocodeLocation(location);
      console.log(`📍 Located: ${geoData.name} (${geoData.lat}, ${geoData.lon})`);
      
      // Step 2: Get NASA climate data
      const nasaData = await this.getNasaClimateData(geoData.lat, geoData.lon);
      console.log('📊 NASA data received');
      
      // Step 3: Get current weather
      const currentWeather = await this.getCurrentWeather(geoData.lat, geoData.lon);
      
      // Step 4: Analyze with Telegram bot logic
      const analysis = this.analyzeTravelData(nasaData, geoData.name);
      
      const result = {
        location: geoData,
        analysis: {
          ...analysis,
          currentConditions: this.getCurrentConditions(currentWeather)
        },
        timestamp: new Date().toISOString(),
        dataPoints: analysis.dataPoints,
        yearsAnalyzed: 5
      };

      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Travel service error:', error);
      return this.getDemoData(location);
    }
  }

  async geocodeLocation(location) {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${this.locationIqKey}&q=${encodeURIComponent(location)}&format=json&limit=1`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data[0]) {
        return {
          name: response.data[0].display_name,
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          country: response.data[0].address?.country || 'Unknown'
        };
      }
      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error.message);
      const demoCoords = this.getDemoCoordinates(location);
      return {
        name: location,
        lat: demoCoords.lat,
        lon: demoCoords.lon,
        country: 'Earth'
      };
    }
  }

  async getNasaClimateData(lat, lon) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 5); // 5 years of data

      const formatDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
      
      const params = {
        parameters: 'T2M,PRECTOT,RH2M',
        start: formatDate(startDate),
        end: formatDate(endDate),
        latitude: lat,
        longitude: lon,
        community: 'RE',
        format: 'JSON'
      };

      console.log('🛰️ Fetching NASA POWER data...');
      const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
        params,
        timeout: 15000
      });

      if (!response.data.properties) {
        throw new Error('No climate data received from NASA');
      }

      return response.data;
    } catch (error) {
      console.error('NASA API error:', error.response?.data || error.message);
      return this.getDemoClimateData();
    }
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherKey}&units=metric`,
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error.message);
      return {
        main: { 
          temp: 25 + Math.random() * 10 - 5, 
          humidity: 60 + Math.random() * 20,
          feels_like: 25 + Math.random() * 10 - 5
        },
        weather: [{ description: 'clear sky', main: 'Clear' }],
        wind: { speed: 2 + Math.random() * 5 }
      };
    }
  }

  analyzeTravelData(nasaData, locationName) {
    const monthlyScores = this.calculateMonthlyComfortScores(nasaData);
    const bestMonth = this.findBestTravelMonth(monthlyScores);
    const activities = this.getActivityRecommendations(bestMonth);

    return {
      bestTravelMonths: [bestMonth],
      monthlyBreakdown: monthlyScores,
      recommendations: this.generateTravelRecommendations(bestMonth, activities, monthlyScores),
      confidenceScore: this.calculateConfidenceScore(nasaData),
      dataPoints: Object.keys(nasaData.properties?.parameter?.T2M || {}).length
    };
  }

  calculateMonthlyComfortScores(nasaData) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyScores = [];

    const temperatures = nasaData.properties?.parameter?.T2M || {};
    const rainfall = nasaData.properties?.parameter?.PRECTOT || {};
    const humidity = nasaData.properties?.parameter?.RH2M || {};

    // Calculate monthly averages
    for (let month = 1; month <= 12; month++) {
      const monthTemps = [];
      const monthRain = [];
      const monthHumidity = [];

      Object.keys(temperatures).forEach(dateStr => {
        if (dateStr.endsWith(month.toString().padStart(2, '0'))) {
          const temp = temperatures[dateStr];
          const rain = rainfall[dateStr] || 0;
          const humid = humidity[dateStr] || 50;

          if (temp !== -999) {
            monthTemps.push(temp);
            monthRain.push(rain);
            monthHumidity.push(humid);
          }
        }
      });

      if (monthTemps.length > 0) {
        const avgTemp = monthTemps.reduce((a, b) => a + b, 0) / monthTemps.length;
        const avgRain = monthRain.reduce((a, b) => a + b, 0) / monthRain.length;
        const avgHumidity = monthHumidity.reduce((a, b) => a + b, 0) / monthHumidity.length;

        // Telegram bot scoring algorithm
        const tempScore = Math.max(0, 10 - Math.abs(avgTemp - 22.5) / 2.5);
        const rainScore = Math.max(0, 10 - avgRain / 20);
        const humidityScore = Math.max(0, 10 - Math.abs(avgHumidity - 50) / 5);

        const overallScore = (tempScore + rainScore + humidityScore) / 3;

        monthlyScores.push({
          month: monthNames[month - 1],
          monthIndex: month - 1,
          overallScore: Math.round(overallScore * 10) / 10,
          temperature: Math.round(avgTemp * 10) / 10,
          rainfall: Math.round(avgRain * 10) / 10,
          humidity: Math.round(avgHumidity),
          subScores: {
            temperature: Math.round(tempScore * 10) / 10,
            rainfall: Math.round(rainScore * 10) / 10,
            humidity: Math.round(humidityScore * 10) / 10
          }
        });
      }
    }

    return monthlyScores.sort((a, b) => b.overallScore - a.overallScore);
  }

  findBestTravelMonth(monthlyScores) {
    return monthlyScores[0] || this.getDemoMonthData(0);
  }

  getActivityRecommendations(bestMonth) {
    const activities = [];
    const temp = bestMonth.temperature;
    const rain = bestMonth.rainfall;

    if (temp > 25) {
      activities.push('🏊 Beach activities', '🍦 Ice cream tours', '🏛️ Indoor museums');
    } else if (temp > 15) {
      activities.push('🚶 City walking tours', '🌳 Park visits', '📸 Photography');
    } else {
      activities.push('☕ Cafe hopping', '🏛️ Museums', '🎭 Theater shows');
    }

    if (rain < 50) {
      activities.push('🥾 Hiking', '🚴 Cycling', '🏖️ Outdoor markets');
    } else if (rain < 100) {
      activities.push('☂️ Light outdoor activities');
    } else {
      activities.push('🏢 Shopping malls', '🎬 Indoor entertainment');
    }

    return activities.slice(0, 4);
  }

  generateTravelRecommendations(bestMonth, activities, monthlyScores) {
    const recommendations = [];

    recommendations.push({
      type: 'best_time',
      title: '🌟 Best Month to Visit',
      content: `${bestMonth.month} has the best conditions with a score of ${bestMonth.overallScore}/10`,
      emoji: '🌟'
    });

    recommendations.push({
      type: 'activities',
      title: '🎯 Recommended Activities',
      content: activities.join(', '),
      emoji: '🎯'
    });

    // Climate advice
    const annualAvgTemp = monthlyScores.reduce((sum, month) => sum + month.temperature, 0) / monthlyScores.length;
    if (annualAvgTemp > 28) {
      recommendations.push({
        type: 'hot_climate',
        title: '🔥 Hot Climate Tip',
        content: 'Pack light clothing and stay hydrated during your visit',
        emoji: '🔥'
      });
    }

    return recommendations;
  }

  getCurrentConditions(weatherData) {
    const weatherIcons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️'
    };

    return {
      temperature: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 10) / 10,
      feelsLike: Math.round(weatherData.main.feels_like || weatherData.main.temp),
      icon: weatherIcons[weatherData.weather[0].main] || '🌍'
    };
  }

  calculateConfidenceScore(nasaData) {
    if (nasaData.demo) return 85;
    
    const dataPoints = Object.keys(nasaData.properties?.parameter?.T2M || {}).length;
    const expectedPoints = 365 * 5;
    const coverage = Math.min(100, (dataPoints / expectedPoints) * 100);
    return Math.round(coverage * 10) / 10;
  }

  // DEMO DATA METHODS
  getDemoData(location) {
    const geoData = {
      name: location,
      lat: this.getDemoCoordinates(location).lat,
      lon: this.getDemoCoordinates(location).lon,
      country: 'Earth'
    };

    const nasaData = this.getDemoClimateData();
    const analysis = this.analyzeTravelData(nasaData, location);
    const currentWeather = {
      main: { temp: 25, humidity: 65, feels_like: 26 },
      weather: [{ description: 'sunny', main: 'Clear' }],
      wind: { speed: 3.2 }
    };
    
    return {
      location: geoData,
      analysis: {
        ...analysis,
        currentConditions: this.getCurrentConditions(currentWeather)
      },
      timestamp: new Date().toISOString(),
      dataPoints: 1825,
      yearsAnalyzed: 5,
      demo: true
    };
  }

  getDemoCoordinates(location) {
    const cityCoords = {
      'delhi': { lat: 28.6139, lon: 77.2090 },
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'chennai': { lat: 13.0827, lon: 80.2707 }
    };

    const lowerLocation = location.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoords)) {
      if (lowerLocation.includes(city)) {
        return coords;
      }
    }

    return { lat: 28.6139, lon: 77.2090 };
  }

  getDemoClimateData() {
    return {
      properties: {
        parameter: {
          T2M: this.generateDemoTemperatureData(),
          PRECTOT: this.generateDemoRainfallData(),
          RH2M: this.generateDemoHumidityData()
        }
      },
      demo: true
    };
  }

  generateDemoTemperatureData() {
    const data = {};
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - 5);

    for (let i = 0; i < 1825; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const month = date.getMonth();
      const baseTemp = 25 + Math.sin((month - 6) * Math.PI / 6) * 8;
      const dailyVariation = (Math.random() - 0.5) * 6;
      
      data[dateStr] = Math.round((baseTemp + dailyVariation) * 100) / 100;
    }
    return data;
  }

  generateDemoRainfallData() {
    const data = {};
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - 5);

    for (let i = 0; i < 1825; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const month = date.getMonth();
      let rainChance = 0.1;
      if (month >= 5 && month <= 8) rainChance = 0.6;
      
      data[dateStr] = Math.random() < rainChance ? (Math.random() * 20) : 0;
    }
    return data;
  }

  generateDemoHumidityData() {
    const data = {};
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - 5);

    for (let i = 0; i < 1825; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      data[dateStr] = 60 + (Math.random() * 20);
    }
    return data;
  }

  getDemoMonthData(monthIndex) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseTemp = 25 + Math.sin((monthIndex - 6) * Math.PI / 6) * 8;
    const rain = monthIndex >= 5 && monthIndex <= 8 ? 150 + Math.random() * 100 : 20 + Math.random() * 30;
    const humidity = 60 + (Math.random() * 20);

    const tempScore = Math.max(0, 10 - Math.abs(baseTemp - 22.5) / 2.5);
    const rainScore = Math.max(0, 10 - rain / 20);
    const humidityScore = Math.max(0, 10 - Math.abs(humidity - 50) / 5);
    const overallScore = (tempScore + rainScore + humidityScore) / 3;

    return {
      month: monthNames[monthIndex],
      monthIndex: monthIndex,
      overallScore: Math.round(overallScore * 10) / 10,
      temperature: Math.round(baseTemp * 10) / 10,
      rainfall: Math.round(rain * 10) / 10,
      humidity: Math.round(humidity),
      subScores: {
        temperature: Math.round(tempScore * 10) / 10,
        rainfall: Math.round(rainScore * 10) / 10,
        humidity: Math.round(humidityScore * 10) / 10
      }
    };
  }
}

module.exports = new TravelService();

// 709   