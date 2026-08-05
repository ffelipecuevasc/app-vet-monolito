// Acá tú importas el módulo (librería) express bajo el nombre 'express'
import express from "express";
// Acá tú construyes el objeto que enruta (router) con el metodo express.Router()
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

export default router;