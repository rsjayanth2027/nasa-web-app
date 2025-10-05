const express = require('express');
const router = express.Router();
const solarService = require('../services/solarService');

router.get('/:location', async (req, res) => {
  try {
    const location = req.params.location;
    console.log(`☀️ Solar route called for: ${location}`);
    
    if (!location || location.trim() === '') {
      return res.status(400).json({ 
        error: 'Location parameter is required',
        details: 'Please provide a valid location name'
      });
    }

    const result = await solarService.getSolarAnalysis(location);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'No solar data found',
        details: `Could not analyze solar potential for ${location}`
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Solar route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch solar analysis',
      details: error.message,
      type: 'solar_error'
    });
  }
});

module.exports = router;