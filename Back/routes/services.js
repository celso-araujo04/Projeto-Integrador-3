const express = require('express');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await req.db.execute('SELECT * FROM servicos');
    
    res.json({
      status: 'success',
      data: services
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching services'
    });
  }
});

// Get services by professional ID
router.get('/professional/:id', async (req, res) => {
  try {
    const [services] = await req.db.execute(`
      SELECT s.*
      FROM servicos s
      JOIN servicos_profissionais sp ON s.servico_id = sp.servico_id
      WHERE sp.profissional_id = ?
    `, [req.params.id]);

    res.json({
      status: 'success',
      data: services
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching professional services'
    });
  }
});

module.exports = router;