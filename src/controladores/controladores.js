const { contas, depositos, saques, transferencias, } = require('../bancodedados');

const listarTodasAsContas = (req, res) => {
    return res.json(contas);
};


const criarNovaConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const cpfExistente = contas.find(usuario => usuario.usuario.cpf === cpf);
    if (cpfExistente) {
        return res.status(400).json({
            mensagem: "Esse CPF já está cadastrado em outra conta."
        });
    }

    const emailExistente = contas.find(usuario => usuario.usuario.email === email);
    if (emailExistente) {
        return res.status(400).json({
            mensagem: "Esse email já está cadastrado em outra conta."
        });
    }

    const numero_conta = contas.length > 0 ? contas.length + 1 : 1;
    const contaNova = {
        numero_conta,
        saldo: 0,
        usuario: { nome, cpf, data_nascimento, telefone, email, senha }
    };
    contas.push(contaNova);

    return res.status(201).json({ mensagem: "Conta criada com sucesso!" });
};


const atualizarUsuario = (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const conta = contas.find(conta => conta.numero_conta == Number(numeroConta));
    const verificarCpf = contas.find((conta => conta.usuario.cpf == cpf))
    const verificarEmail = contas.find((conta => conta.usuario.email == email))

    if (!conta) {
        return res.status(404).json({
            mensagem: 'Conta não encontrada'
        })
    }

    if ((conta.usuario.cpf == cpf || !verificarCpf) && (conta.usuario.email == email) || !verificarEmail) {
        conta.usuario.cpf = cpf
        conta.usuario.email = email
        conta.usuario.nome = nome
        conta.usuario.data_nascimento = data_nascimento
        conta.usuario.telefone = telefone
        conta.usuario.senha = senha

        return res.json({
            mensagem: "Conta atualizada"
        })


    }

    if ((verificarCpf !== conta.usuario.cpf) && verificarCpf) {
        return res.status(400).json({
            mensagem: "CPF já cadastrado em outra conta"
        })
    }

    if ((verificarEmail !== conta.usuario.email) && verificarEmail) {
        return res.status(400).json({
            mensagem: "Email já cadastrado em outra conta"
        })
    }



}



const deletarConta = (req, res) => {
    const { numeroConta } = req.params;
    const contaIndex = contas.findIndex(conta => conta.numero_conta === Number(numeroConta));

    if (contaIndex === -1) {
        return res.status(404).json({
            mensagem: "Conta não encontrada."
        });
    }

    if (contas[contaIndex].saldo > 0) {
        return res.status(400).json({
            mensagem: "Conta com saldo maior que zero."
        });
    }

    contas.splice(contaIndex, 1);
    return res.status(200).json({
        mensagem: "Conta deletada com sucesso."
    });
};

const depositar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({
            mensagem: "O número da conta, o valor e a senha são obrigatórios!"
        });
    }


    const conta = contas.find(conta => conta.numero_conta === numero_conta)

    if (!conta) {
        return res.status(404).json({
            mensagem: "Conta bancária não existente!"
        });
    }

    if (valor <= 0) {
        return res.status(400).json({
            mensagem: "O valor não pode ser menor que zero!"
        });
    }

    conta.saldo += valor

    const dataHoraAtual = new Date()
    const dataFormatada = dataHoraAtual.toLocaleDateString()
    const horaFormatada = dataHoraAtual.toLocaleTimeString()

    const comprovante = {
        "data": dataFormatada + horaFormatada,
        numero_conta,
        valor
    }

    depositos.push(comprovante)
    // console.log(depositos)
    return res.json({
        mensagem: "Depósito efetuado com sucesso"
    })
};


const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    const conta = contas.find((conta) => conta.numero_conta === numero_conta)

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({
            mensagem: "O número da conta, o valor e a senha são obrigatórios!"
        });
    }

    if (!conta) {
        return res.status(404).json({
            mensagem: "Conta bancária não existente!"
        });
    }
    if (Number(conta.usuario.senha) !== senha) {
        return res.status(401).json({
            mensagem: 'Senha inválida'
        })
    }

    if (conta.saldo < valor) {
        return res.status(400).json({
            mensagem: 'O saldo não é suficiente para o saque'
        })
    }


    conta.saldo -= valor

    const dataHoraAtual = new Date()
    const dataFormatada = dataHoraAtual.toLocaleDateString()
    const horaFormatada = dataHoraAtual.toLocaleTimeString()

    const comprovante = {
        "data": dataFormatada + horaFormatada,
        numero_conta,
        valor
    }

    saques.push(comprovante)
    //console.log(saques)
    return res.json({
        mensagem: "Saque efetuado com sucesso"
    })
}


const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({
            mensagem: "Os campos são obrigatórios!"
        });
    }
    const contaDeOrigem = contas.find((conta) => {
        return conta.numero_conta === numero_conta_origem;
    });
    const contaDeDestino = contas.find((conta) => {
        return conta.numero_conta === numero_conta_destino;
    });


    if (!contaDeOrigem) {
        return res.status(404).json({
            mensagem: "Conta de origem inválida"
        })
    }



    if (!contaDeDestino) {
        return res.status(404).json({
            mensagem: "Conta de destino inválida"
        })
    }

    if (contaDeOrigem.usuario.senha !== senha) {
        return res.status(401).json({
            mensagem: 'Senha inválida'
        })
    }

    if (contaDeOrigem.saldo < valor) {
        return res.status(400).json({
            mensagem: 'O saldo não é suficiente'
        })
    }

    contaDeOrigem.saldo -= valor;
    contaDeDestino.saldo += valor;

    const dataHoraAtual = new Date()
    const dataFormatada = dataHoraAtual.toLocaleDateString()
    const horaFormatada = dataHoraAtual.toLocaleTimeString()

    const comprovanteTransferencia = {
        data: dataFormatada + " " + horaFormatada,
        numero_conta: numero_conta_destino,
        valor: valor
    }

    transferencias.push(comprovanteTransferencia)
    //console.log(transferencias)
    return res.json({
        mensagem: "Transferência efetuada com sucesso"
    })


}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({
            mensagem: 'Os campos são obrigatórios'
        })
    }

    const conta = contas.find((conta) => {
        return conta.numero_conta == numero_conta
    })

    if (!conta) {
        return res.status(400).json({
            mensagem: "Conta bancária não encontada!"
        })
    }

    if (conta.usuario.senha !== senha) {
        return res.status(401).json({
            mensagem: "Senha incorreta"
        })
    }

    return res.json({ saldo: conta.saldo })

}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({
            mensagem: 'Os campos são obrigatórios'
        })
    }

    const conta = contas.find((conta) => {
        return conta.numero_conta == numero_conta
    })

    if (!conta) {
        return res.status(400).json({
            mensagem: "Conta bancária não encontada!"
        })
    }

    if (conta.usuario.senha !== senha) {
        return res.status(400).json({
            mensagem: 'Senha incorreta'
        })
    }

    const extrato = {
        deposito: depositos.filter((deposito) => {
            return deposito.numero_conta == numero_conta
        }),
        saque: saques.filter((saque) => {
            return saque.numero_conta == numero_conta
        }),
        transferenciaEnvio: transferencias.filter((transferencia) => {
            return transferencia.numero_conta == numero_conta
        }),
        transferenciaRecebida: transferencias.filter((transferencia) => {
            return transferencia.numero_conta == numero_conta
        })
    }

    return res.json(extrato)

}


module.exports = {
    listarTodasAsContas,
    criarNovaConta,
    atualizarUsuario,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato,
};