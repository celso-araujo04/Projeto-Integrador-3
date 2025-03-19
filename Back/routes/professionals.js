const express = require('express');
const router = express.Router();

// Get all professionals
router.get('/', async (req, res) => {
  try {
    const [professionals] = await req.db.execute(`
      SELECT p.*, u.email, u.nome, u.telefone
      FROM profissionais p
      JOIN usuarios u ON p.usuario_id = u.usuario_id
    `);

    res.json({
      status: 'success',
      data: professionals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching professionals'
    });
  }
});

// Get professional by ID
router.get('/:id', async (req, res) => {
  try {
    const [professionals] = await req.db.execute(`
      SELECT p.*, u.email, u.nome, u.telefone,
             GROUP_CONCAT(DISTINCT s.nome) as servicos,
             GROUP_CONCAT(DISTINCT e.cidade) as cidades
      FROM profissionais p
      JOIN usuarios u ON p.usuario_id = u.usuario_id
      LEFT JOIN servicos_profissionais sp ON p.profissional_id = sp.profissional_id
      LEFT JOIN servicos s ON sp.servico_id = s.servico_id
      LEFT JOIN enderecos e ON p.profissional_id = e.profissional_id
      WHERE p.profissional_id = ?
      GROUP BY p.profissional_id
    `, [req.params.id]);

    if (professionals.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Professional not found'
      });
    }

    res.json({
      status: 'success',
      data: professionals[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching professional'
    });
  }
});

module.exports = router;