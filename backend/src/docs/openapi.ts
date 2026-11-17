const erro = (descricao: string) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
})

const json = (schema: object) => ({ content: { 'application/json': { schema } } })

const ref = (nome: string) => ({ $ref: `#/components/schemas/${nome}` })

const corpo = (propriedades: Record<string, object>, obrigatorios: string[]) => ({
  required: true,
  ...json({ type: 'object', required: obrigatorios, properties: propriedades }),
})

const mensagem = { description: 'Sucesso', ...json(ref('Mensagem')) }
const protegida = [{ bearerAuth: [] }]
const idPath = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
const email = { type: 'string', format: 'email', example: 'cliente@godrive.com' }
const codigo = { type: 'string', example: '123456' }
const finalidade = { type: 'string', enum: ['CONFIRMAR_EMAIL', 'RECUPERAR_SENHA'] }

export const documentoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'API goDrive',
    version: '1.0.0',
    description:
      'API REST do sistema de locação de veículos. Faça login em POST /auth/login, copie o token e clique em Authorize.',
  },
  servers: [{ url: '/api' }],
  tags: [{ name: 'Autenticação' }, { name: 'Veículos' }, { name: 'Locações' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Erro: { type: 'object', properties: { erro: { type: 'string' } } },
      Mensagem: { type: 'object', properties: { mensagem: { type: 'string' } } },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          email: { type: 'string' },
          papel: { type: 'string', enum: ['ADMIN', 'CLIENTE'] },
        },
      },
      Veiculo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          ano: { type: 'integer' },
          categoria: { type: 'string' },
          placa: { type: 'string' },
          cor: { type: 'string', nullable: true },
          combustivel: { type: 'string', nullable: true },
          lugares: { type: 'integer' },
          quilometragem: { type: 'integer' },
          precoDiaria: { type: 'number' },
          disponivel: { type: 'boolean' },
          imagemUrl: { type: 'string', nullable: true },
        },
      },
      NovoVeiculo: {
        type: 'object',
        required: ['marca', 'modelo', 'ano', 'categoria', 'placa', 'precoDiaria'],
        properties: {
          marca: { type: 'string', example: 'Toyota' },
          modelo: { type: 'string', example: 'Corolla' },
          ano: { type: 'integer', example: 2024 },
          categoria: { type: 'string', example: 'Sedã' },
          placa: { type: 'string', example: 'XYZ-1A23' },
          cor: { type: 'string', example: 'Prata' },
          combustivel: { type: 'string', example: 'Flex' },
          lugares: { type: 'integer', example: 5 },
          quilometragem: { type: 'integer', example: 0 },
          precoDiaria: { type: 'number', example: 199.9 },
          disponivel: { type: 'boolean', example: true },
          imagemUrl: { type: 'string', example: 'https://exemplo.com/corolla.png' },
        },
      },
      Locacao: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          veiculo: ref('Veiculo'),
          dataRetirada: { type: 'string', format: 'date' },
          dataDevolucao: { type: 'string', format: 'date' },
          devolvidoEm: { type: 'string', format: 'date-time', nullable: true },
          valorDiaria: { type: 'number' },
          valorTotal: { type: 'number' },
          status: { type: 'string', enum: ['ativa', 'finalizada'] },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/cadastro': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cria a conta e envia o código de confirmação (exibido no terminal da API)',
        requestBody: corpo(
          { nome: { type: 'string', example: 'Ana Souza' }, email, senha: { type: 'string', example: 'segredo1' } },
          ['nome', 'email', 'senha'],
        ),
        responses: {
          201: { description: 'Conta criada', ...json({ type: 'object', properties: { mensagem: { type: 'string' }, usuario: ref('Usuario') } }) },
          400: erro('Dados inválidos'),
          409: erro('E-mail já cadastrado'),
        },
      },
    },
    '/auth/confirmar-email': {
      post: {
        tags: ['Autenticação'],
        summary: 'Confirma o e-mail com o código de 6 dígitos',
        requestBody: corpo({ email, codigo }, ['email', 'codigo']),
        responses: { 200: mensagem, 400: erro('Código inválido ou expirado') },
      },
    },
    '/auth/reenviar-codigo': {
      post: {
        tags: ['Autenticação'],
        summary: 'Reenvia o código de confirmação ou de recuperação',
        requestBody: corpo({ email, finalidade }, ['email', 'finalidade']),
        responses: { 200: mensagem, 400: erro('Dados inválidos') },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Verifica as credenciais e retorna o JWT',
        requestBody: corpo({ email, senha: { type: 'string', example: 'cliente123' } }, ['email', 'senha']),
        responses: {
          200: { description: 'Login feito', ...json({ type: 'object', properties: { token: { type: 'string' }, usuario: ref('Usuario') } }) },
          400: erro('Dados inválidos'),
          401: erro('E-mail ou senha incorretos'),
          403: erro('E-mail não confirmado'),
          429: erro('Muitas tentativas de login'),
        },
      },
    },
    '/auth/recuperar': {
      post: {
        tags: ['Autenticação'],
        summary: 'Envia código de recuperação de senha',
        requestBody: corpo({ email }, ['email']),
        responses: { 200: mensagem, 400: erro('Dados inválidos') },
      },
    },
    '/auth/verificar-codigo': {
      post: {
        tags: ['Autenticação'],
        summary: 'Valida um código sem usá-lo',
        requestBody: corpo({ email, codigo, finalidade }, ['email', 'codigo', 'finalidade']),
        responses: {
          200: { description: 'Código válido', ...json({ type: 'object', properties: { valido: { type: 'boolean' } } }) },
          400: erro('Código inválido ou expirado'),
        },
      },
    },
    '/auth/redefinir-senha': {
      post: {
        tags: ['Autenticação'],
        summary: 'Troca a senha usando o código de recuperação',
        requestBody: corpo({ email, codigo, senha: { type: 'string', example: 'novasenha' } }, ['email', 'codigo', 'senha']),
        responses: { 200: mensagem, 400: erro('Código inválido ou expirado') },
      },
    },
    '/auth/perfil': {
      get: {
        tags: ['Autenticação'],
        summary: 'Dados do usuário logado',
        security: protegida,
        responses: { 200: { description: 'Usuário', ...json(ref('Usuario')) }, 401: erro('Sem login') },
      },
    },
    '/veiculos': {
      get: {
        tags: ['Veículos'],
        summary: 'Lista os veículos',
        security: protegida,
        parameters: [
          { name: 'busca', in: 'query', schema: { type: 'string' } },
          { name: 'categoria', in: 'query', schema: { type: 'string' } },
          { name: 'disponivel', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: {
          200: { description: 'Lista de veículos', ...json({ type: 'array', items: ref('Veiculo') }) },
          401: erro('Sem login'),
        },
      },
      post: {
        tags: ['Veículos'],
        summary: 'Cadastra um veículo (placa única e diária positiva)',
        security: protegida,
        requestBody: { required: true, ...json(ref('NovoVeiculo')) },
        responses: {
          201: { description: 'Veículo criado', ...json(ref('Veiculo')) },
          400: erro('Dados inválidos'),
          401: erro('Sem login'),
          409: erro('Placa já cadastrada'),
        },
      },
    },
    '/veiculos/{id}': {
      get: {
        tags: ['Veículos'],
        summary: 'Detalhe de um veículo',
        security: protegida,
        parameters: [idPath],
        responses: {
          200: { description: 'Veículo', ...json(ref('Veiculo')) },
          401: erro('Sem login'),
          404: erro('Veículo não encontrado'),
        },
      },
    },
    '/locacoes': {
      get: {
        tags: ['Locações'],
        summary: 'Lista as locações do usuário logado (ativas e finalizadas)',
        security: protegida,
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['ativa', 'finalizada'] } }],
        responses: {
          200: { description: 'Locações', ...json({ type: 'array', items: ref('Locacao') }) },
          401: erro('Sem login'),
        },
      },
      post: {
        tags: ['Locações'],
        summary: 'Registra uma locação e deixa o veículo indisponível',
        security: protegida,
        requestBody: corpo(
          {
            veiculoId: { type: 'integer', example: 2 },
            dataRetirada: { type: 'string', format: 'date', example: '2026-12-01' },
            dataDevolucao: { type: 'string', format: 'date', example: '2026-12-04' },
          },
          ['veiculoId', 'dataRetirada', 'dataDevolucao'],
        ),
        responses: {
          201: { description: 'Locação criada', ...json(ref('Locacao')) },
          400: erro('Dados ou datas inválidos'),
          401: erro('Sem login'),
          404: erro('Veículo não encontrado'),
          409: erro('Veículo indisponível'),
        },
      },
    },
    '/locacoes/{id}': {
      get: {
        tags: ['Locações'],
        summary: 'Detalhe de uma locação do usuário logado',
        security: protegida,
        parameters: [idPath],
        responses: {
          200: { description: 'Locação', ...json(ref('Locacao')) },
          401: erro('Sem login'),
          404: erro('Locação não encontrada ou de outro usuário'),
        },
      },
    },
    '/locacoes/{id}/devolucao': {
      patch: {
        tags: ['Locações'],
        summary: 'Finaliza a locação, registra a devolução e libera o veículo',
        security: protegida,
        parameters: [idPath],
        requestBody: {
          required: false,
          ...json({ type: 'object', properties: { quilometragem: { type: 'integer', example: 32500 } } }),
        },
        responses: {
          200: { description: 'Locação finalizada', ...json(ref('Locacao')) },
          400: erro('Quilometragem inválida'),
          401: erro('Sem login'),
          404: erro('Locação não encontrada ou de outro usuário'),
          409: erro('Locação já finalizada'),
        },
      },
    },
  },
}
