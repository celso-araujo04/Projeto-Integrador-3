const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Register new user
router.post('/register', [
  body('email').isEmail(),
  body('senha').isLength({ min: 6 }),
  body('nome').notEmpty(),
  body('tipo_usuario').isIn(['cliente', 'profissional'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha, nome, telefone, tipo_usuario } = req.body;
    const senha_hash = await bcrypt.hash(senha, 10);

    const [result] = await req.db.execute(
      'INSERT INTO usuarios (email, senha_hash, nome, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [email, senha_hash, nome, telefone, tipo_usuario]
    );

    if (tipo_usuario === 'profissional') {
      await req.db.execute(
        'INSERT INTO profissionais (usuario_id, primeiro_nome, ultimo_nome) VALUES (?, ?, ?)',
        [result.insertId, nome.split(' ')[0], nome.split(' ').slice(1).join(' ')]
      );
    } else {
      await req.db.execute(
        'INSERT INTO clientes (usuario_id) VALUES (?)',
        [result.insertId]
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [users] = await req.db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(senha, user.senha_hash);

    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.usuario_id, tipo: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.usuario_id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo_usuario
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
});

module.exports = router;