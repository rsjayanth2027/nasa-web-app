const express = require('express');
const router = express.Router();
const travelService = require('../services/travelService');

router.get('/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const result = await travelService.getTravelInsights(location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch travel intelligence',
      details: error.message 
    });
  }
});

module.exports = router;