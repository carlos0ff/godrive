import { app } from './app.js'
import { config } from './config.js'

app.listen(config.porta, config.host, (erro) => {
  if (erro) {
    console.error(`Não foi possível iniciar a API na porta ${config.porta}: ${erro.message}`)
    process.exit(1)
  }

  console.log(`API goDrive rodando em http://localhost:${config.porta}/api`)
})
