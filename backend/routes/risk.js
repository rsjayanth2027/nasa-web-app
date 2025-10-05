const express = require('express');
const router = express.Router();
const riskService = require('../services/riskService');

router.get('/:location', async (req, res) => {
  try {
    const location = req.params.location;
    console.log(`⚠️ Risk route called for: ${location}`);
    
    if (!location || location.trim() === '') {
      return res.status(400).json({ 
        error: 'Location parameter is required',
        details: 'Please provide a valid location name'
      });
    }

    const result = await riskService.getRiskAssessment(location);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'No risk data found',
        details: `Could not analyze climate risks for ${location}`
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Risk route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch risk assessment',
      details: error.message,
      type: 'risk_error'
    });
  }
});

module.exports = router;