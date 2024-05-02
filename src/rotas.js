const express = require('express');
const rotas = express();

const { listarTodasAsContas, criarNovaConta, atualizarUsuario, deletarConta, depositar, sacar, transferir, saldo, extrato } = require('./controladores/controladores');
const { verificarSenha, dadosObrigatorios } = require('./intermediarios');


rotas.get('/contas', verificarSenha, listarTodasAsContas);
rotas.post('/contas', dadosObrigatorios, criarNovaConta);
rotas.put('/contas/:numeroConta/usuario', dadosObrigatorios, atualizarUsuario)
rotas.delete('/contas/:numeroConta', deletarConta)
rotas.post('/transacoes/depositar', depositar)
rotas.post('/transacoes/sacar', sacar)
rotas.post('/transacoes/transferir', transferir)
rotas.get('/contas/saldo', saldo)
rotas.get('/contas/extrato', extrato)

module.exports = rotas;


