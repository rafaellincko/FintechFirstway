module.exports = [
    {
        cnpj: '36981191881',
        razaoSocial: 'TESTE S.A.',
        atividade: 'testadores anonimos',
        dataDeAbertura: '01/01/2019',
        faturamento: 1000,
        contas: [
            {
            numero: '33334-x',
            saldo: 1200.00
            }
        ],
        enderecos: [
             {
                tipo: 'Comercial',
                logradouro: 'Novo Teste, 345',
                complemento: '',
                bairro: 'TEs',
                cidade: 'São Paulo',
                estado: 'São Paulo',
                cep: '08210-720',
                pais: 'Brasil'
            } 
        ],
        telefones: [
            {
                codigoPais: '55',
                codigoDDD: 11,
                numero: 992308551
            }
        ],
        beneficiarios: [
            {
                nome: 'Testador Um',
                cpfCnpj: '01234567890',
                pep: true
            },
            {   
                nome: 'Alan Salomao',
                cpfCnpj:'102030405060',
                pep: false
            }
        ],
        anexos: [
            {
                descricao: 'cpf',
                idAnexo: '1'
            },
            {
                descricao: 'ContratoSocial',
                idAnexo: '2'
            }
        ]
    },
    {
        cnpj: '68838833000160',
        razaoSocial: 'Rodolpho S.A.',
        atividade: 'prestador de serviços de informática',
        dataDeAbertura: '01/01/2019',
        faturamento: 10000,
        contas: [
            {
            numero: '62340019126',
            saldo: 12000.00
            }
        ],
        enderecos: [
             {
                tipo: 'Comercial',
                logradouro: 'Rua João Câmara, 183',
                complemento: '',
                bairro: 'Itaquera',
                cidade: 'São Paulo',
                estado: 'São Paulo',
                cep: '08210-720',
                pais: 'Brasil'
            } 
        ],
        telefones: [
            {
                codigoPais: '55',
                codigoDDD: 11,
                numero: 992308551
            }
        ],
        beneficiarios: [
            {
                nome: 'Rodolpho de Souza Lipovscek',
                cpfCnpj: '36981191881',
                pep: true
            },
            {   
                nome: 'Alan Salomao',
                cpfCnpj:'102030405060',
                pep: false
            }
        ],
        anexos: [
            {
                descricao: 'cpf',
                idAnexo: '1'
            },
            {
                descricao: 'ContratoSocial',
                idAnexo: '2'
            }
        ]
    },
    {
        cnpj: '12609019000100',
        razaoSocial: 'Cozinhando com Arte',
        atividade: 'Restaurante',
        dataDeAbertura: '01/01/2018',
        faturamento: 1500,
        contas: [
            {
            numero: '5003000600010002',
            saldo: 5000.00
            }
        ],
        enderecos: [
             {
                tipo: 'Cobrança',
                logradouro: 'Rua Jorge Latour, 183',
                complemento: '',
                bairro: 'Centro',
                cidade: 'Holambra',
                estado: 'São Paulo',
                cep: '13825-000',
                pais: 'Brasil'
            }   
        ],
        telefones: [
            {
                codigoPais: '55',
                codigoDDD: 19,
                numero: 38021244
            }
        ],
        beneficiarios: [
            {
                nome: 'Jonas C Almeida',
                cpfCnpj: '24639203861',
                pep: false
            }
        ],
        anexos: [
            {
                descricao: 'ContratoSocial',
                idAnexo: '3'
             }
        ]
    }
]