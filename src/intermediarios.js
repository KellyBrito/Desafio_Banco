const { banco } = require('./bancodedados');

const verificarSenha = (req, res, next) => {
    const { senha_banco } = req.query;

    if (!senha_banco || senha_banco.trim().length === 0 || senha_banco !== "Cubos123Bank") {
        return res.status(401).json({
            mensagem: "A senha do banco informada é inválida!"
        });
    }

    next();
};

const dadosObrigatorios = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "O preenchimento de todos os campos é obrigatório!" });
    }

    next();
};

module.exports = {
    verificarSenha,
    dadosObrigatorios,
};
