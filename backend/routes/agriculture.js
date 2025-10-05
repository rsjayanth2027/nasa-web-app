const express = require('express');
const router = express.Router();
const agricultureService = require('../services/agricultureService');

router.get('/rice/:location', async (req, res) => {
  try {
    const location = req.params.location;
    console.log(`🌾 Agriculture route called for: ${location}`);
    
    if (!location || location.trim() === '') {
      return res.status(400).json({ 
        error: 'Location parameter is required',
        details: 'Please provide a valid location name'
      });
    }

    const result = await agricultureService.getRiceInsights(location);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'No agriculture data found',
        details: `Could not analyze rice cultivation for ${location}`
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Agriculture route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agriculture intelligence',
      details: error.message,
      type: 'agriculture_error'
    });
  }
});

module.exports = router;