import { useFeedback } from '../context/feedback'
import { IconeAlerta, IconeCheck, IconeFechar } from './Icones'

/* Mensagens de sucesso e erro das operações. */
export function Avisos() {
  const { avisos, dispensar } = useFeedback()

  if (avisos.length === 0) return null

  return (
    <div className="avisos" role="status" aria-live="polite">
      {avisos.map((aviso) => (
        <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`}>
          {aviso.tipo === 'sucesso' ? <IconeCheck /> : <IconeAlerta />}

          <p>{aviso.texto}</p>

          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => dispensar(aviso.id)}
          >
            <IconeFechar width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
