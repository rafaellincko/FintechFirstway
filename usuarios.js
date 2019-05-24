module.exports = [
    {
        cnpj: '01234567890123',
        razaoSocial: 'Rodolpho sa',
        atividade: 'prestador de serviços de informática',
        dataDeAbertura: '01/01/2019',
        faturamento: 10000,
        contas: {
            numero: '11111-x',
            saldo: '12000'
        },
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
        contas: {
            numero: '13151-x',
            saldo: '5000'
        },
        endereco: [
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