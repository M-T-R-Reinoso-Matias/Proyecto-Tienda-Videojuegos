const express = require('express');
const router = express.Router();
const { verificarToken, soloRol } = require('../middleware/auth');

router.get('/admin-data', verificarToken, soloRol('admin'), (req, res) => {
  res.json({ mensaje: 'Acceso a datos de administrador' });
});

router.get('/cliente-data', verificarToken, soloRol('cliente'), (req, res) => {
  res.json({ mensaje: 'Acceso a datos de cliente' });
});

module.exports = router;
