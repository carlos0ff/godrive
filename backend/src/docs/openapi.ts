import { config } from '../config.js'

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

const protegida = [{ bearerAuth: [] }]
const naoAutenticado = erro('Token ausente, inválido ou expirado')

export const documentoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'API goDrive',
    version: '2.0.0',
    description:
      'API REST do sistema de locação de veículos. Faça login em POST /auth/login, copie o token e clique em Authorize. Para cadastrar veículos, entre como administrador (admin@godrive.com / admin123).',
  },
  servers: [{ url: config.caminhoPublicoApi }],
  tags: [{ name: 'Autenticação' }, { name: 'Veículos' }, { name: 'Locações' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Erro: { type: 'object', properties: { erro: { type: 'string' } } },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          email: { type: 'string' },
          papel: { type: 'string', enum: ['ADMIN', 'CLIENTE'] },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
      Veiculo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          placa: { type: 'string' },
          ano: { type: 'integer' },
          valorDiaria: { type: 'number' },
          disponivel: { type: 'boolean' },
          categoria: { type: 'string' },
          cor: { type: 'string', nullable: true },
          combustivel: { type: 'string', nullable: true },
          lugares: { type: 'integer' },
          quilometragem: { type: 'integer' },
          imagemUrl: { type: 'string', nullable: true },
        },
      },
      NovoVeiculo: {
        type: 'object',
        required: ['marca', 'modelo', 'placa', 'ano', 'valorDiaria', 'categoria'],
        properties: {
          marca: { type: 'string', example: 'Toyota' },
          modelo: { type: 'string', example: 'Yaris' },
          placa: { type: 'string', example: 'XYZ-1A23' },
          ano: { type: 'integer', example: 2024 },
          valorDiaria: { type: 'number', example: 159.9 },
          disponivel: { type: 'boolean', example: true },
          categoria: { type: 'string', example: 'Hatch' },
          cor: { type: 'string', example: 'Prata' },
          combustivel: { type: 'string', example: 'Flex' },
          lugares: { type: 'integer', example: 5 },
          quilometragem: { type: 'integer', example: 0 },
          imagemUrl: { type: 'string', example: 'https://exemplo.com/yaris.png' },
        },
      },
      Locacao: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          veiculo: ref('Veiculo'),
          dataInicio: { type: 'string', format: 'date-time' },
          dataPrevistaDevolucao: { type: 'string', format: 'date-time' },
          dataDevolucao: { type: 'string', format: 'date-time', nullable: true },
          valorDiaria: { type: 'number' },
          valorTotal: { type: 'number' },
          status: { type: 'string', enum: ['ATIVA', 'FINALIZADA'] },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um usuário (sempre com papel CLIENTE)',
        requestBody: corpo(
          {
            nome: { type: 'string', example: 'Ana Souza' },
            email: { type: 'string', format: 'email', example: 'ana@email.com' },
            senha: { type: 'string', example: 'segredo1' },
          },
          ['nome', 'email', 'senha'],
        ),
        responses: {
          201: {
            description: 'Conta criada',
            ...json({ type: 'object', properties: { mensagem: { type: 'string' }, usuario: ref('Usuario') } }),
          },
          400: erro('Dados inválidos'),
          409: erro('E-mail já cadastrado'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Verifica as credenciais e retorna o JWT',
        requestBody: corpo(
          {
            email: { type: 'string', format: 'email', example: 'cliente@godrive.com' },
            senha: { type: 'string', example: 'cliente123' },
          },
          ['email', 'senha'],
        ),
        responses: {
          200: {
            description: 'Login realizado',
            ...json({ type: 'object', properties: { token: { type: 'string' }, usuario: ref('Usuario') } }),
          },
          400: erro('Dados inválidos'),
          401: erro('E-mail ou senha incorretos'),
          429: erro('Muitas tentativas de login'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Retorna o usuário identificado pelo token',
        security: protegida,
        responses: { 200: { description: 'Usuário autenticado', ...json(ref('Usuario')) }, 401: naoAutenticado },
      },
    },
    '/veiculos': {
      get: {
        tags: ['Veículos'],
        summary: 'Lista os veículos com a disponibilidade',
        security: protegida,
        parameters: [
          { name: 'disponivel', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'busca', in: 'query', schema: { type: 'string' } },
          { name: 'categoria', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lista de veículos', ...json({ type: 'array', items: ref('Veiculo') }) },
          401: naoAutenticado,
        },
      },
      post: {
        tags: ['Veículos'],
        summary: 'Cadastra um veículo (somente ADMIN; placa única e diária positiva)',
        security: protegida,
        requestBody: { required: true, ...json(ref('NovoVeiculo')) },
        responses: {
          201: { description: 'Veículo cadastrado', ...json(ref('Veiculo')) },
          400: erro('Dados inválidos'),
          401: naoAutenticado,
          403: erro('Usuário não é administrador'),
          409: erro('Placa já cadastrada'),
        },
      },
    },
    '/veiculos/disponiveis': {
      get: {
        tags: ['Veículos'],
        summary: 'Lista apenas os veículos disponíveis para locação',
        security: protegida,
        responses: {
          200: { description: 'Veículos disponíveis', ...json({ type: 'array', items: ref('Veiculo') }) },
          401: naoAutenticado,
        },
      },
    },
    '/locacoes': {
      get: {
        tags: ['Locações'],
        summary: 'Lista as locações do usuário autenticado, incluindo o histórico',
        security: protegida,
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['ATIVA', 'FINALIZADA'] } }],
        responses: {
          200: { description: 'Locações do usuário', ...json({ type: 'array', items: ref('Locacao') }) },
          401: naoAutenticado,
        },
      },
      post: {
        tags: ['Locações'],
        summary: 'Registra uma locação; o valor total é calculado no backend',
        security: protegida,
        requestBody: corpo(
          {
            veiculoId: { type: 'integer', example: 1 },
            dataInicio: { type: 'string', format: 'date-time', example: '2026-12-01T10:00:00-03:00' },
            dataPrevistaDevolucao: { type: 'string', format: 'date-time', example: '2026-12-03T12:00:00-03:00' },
          },
          ['veiculoId', 'dataInicio', 'dataPrevistaDevolucao'],
        ),
        responses: {
          201: { description: 'Locação registrada', ...json(ref('Locacao')) },
          400: erro('Dados ou datas inválidos'),
          401: naoAutenticado,
          404: erro('Veículo não encontrado'),
          409: erro('Veículo indisponível'),
        },
      },
    },
    '/locacoes/{id}/finalizar': {
      patch: {
        tags: ['Locações'],
        summary: 'Finaliza a locação, registra a devolução e libera o veículo',
        security: protegida,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Locação finalizada', ...json(ref('Locacao')) },
          400: erro('Identificador inválido'),
          401: naoAutenticado,
          404: erro('Locação não encontrada ou de outro usuário'),
          409: erro('Locação já finalizada'),
        },
      },
    },
  },
}
