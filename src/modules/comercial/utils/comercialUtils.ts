import type { Cliente, Oportunidade, Visita } from '@/modules/comercial/types'

export const nowIso = () => new Date().toISOString()

export const makeEntityId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const nextCodigoInterno = (clientes: Cliente[]) => {
  const max = clientes.reduce((acc, item) => {
    const num = Number(item.codigoInterno.replace('CLI-', ''))
    if (Number.isNaN(num)) return acc
    return Math.max(acc, num)
  }, 0)

  return `CLI-${String(max + 1).padStart(5, '0')}`
}

export const sortVisitasByDateDesc = (visitas: Visita[]) => {
  return [...visitas].sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`))
}

export const buildOportunidades = (clientes: Cliente[], visitas: Visita[]): Oportunidade[] => {
  return clientes.map((cliente) => {
    const ultima = sortVisitasByDateDesc(visitas.filter((item) => item.clienteId === cliente.id))[0]

    const nivel =
      cliente.status === 'ATIVO' ? 'ALTA' : cliente.status === 'PROSPECT' ? 'MEDIA' : 'BAIXA'

    return {
      id: cliente.id,
      clienteNome: cliente.nomeFantasia || cliente.razaoSocial,
      statusCliente: cliente.status,
      ultimaVisita: ultima?.data ?? '',
      resultadoUltimaVisita: ultima?.resultado ?? '',
      nivel,
    }
  })
}
