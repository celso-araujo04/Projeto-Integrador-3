const express = require('express');
const router = express.Router();

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { cliente_id, profissional_id, data_horario, servico_id, observacao } = req.body;

    const [result] = await req.db.execute(
      'INSERT INTO agendamentos (cliente_id, profissional_id, data_horario, servico_id, observacao) VALUES (?, ?, ?, ?, ?)',
      [cliente_id, profissional_id, data_horario, servico_id, observacao]
    );

    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully',
      data: { agendamento_id: result.insertId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating appointment'
    });
  }
});

// Get appointments by client or professional ID
router.get('/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const query = tipo === 'cliente' 
      ? 'SELECT * FROM agendamentos WHERE cliente_id = ?'
      : 'SELECT * FROM agendamentos WHERE profissional_id = ?';

    const [appointments] = await req.db.execute(query, [id]);

    res.json({
      status: 'success',
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments'
    });
  }
});

module.exports = router;