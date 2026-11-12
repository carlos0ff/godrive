import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { useRota } from './rotas'

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  para: string
  classeAtiva?: string
  children: ReactNode
}

export function Link({ para, classeAtiva, className, children, ...resto }: Props) {
  const { caminho } = useRota()
  const ativo = classeAtiva && caminho === para.split('?')[0]
  const classes = [className, ativo ? classeAtiva : ''].filter(Boolean).join(' ')

  return (
    <a
      href={`#${para}`}
      className={classes || undefined}
      aria-current={ativo ? 'page' : undefined}
      {...resto}
    >
      {children}
    </a>
  )
}
