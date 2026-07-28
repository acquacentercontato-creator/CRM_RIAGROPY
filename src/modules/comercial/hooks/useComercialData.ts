import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AgendaCompromisso, Cliente, Oportunidade, Visita } from '@/modules/comercial/types'
import { ComercialService } from '@/modules/comercial/services/ComercialService'
import type {
  AgendaFormInput,
  ClienteFormInput,
  VisitaFormInput,
} from '@/modules/comercial/validators/comercialValidators'

const keys = {
  clientes: ['comercial', 'clientes'] as const,
  agenda: ['comercial', 'agenda'] as const,
  visitas: ['comercial', 'visitas'] as const,
  oportunidades: ['comercial', 'oportunidades'] as const,
}

export const useClientes = () =>
  useQuery<Cliente[]>({
    queryKey: keys.clientes,
    queryFn: () => ComercialService.listClientes(),
  })

export const useAgenda = () =>
  useQuery<AgendaCompromisso[]>({
    queryKey: keys.agenda,
    queryFn: () => ComercialService.listAgenda(),
  })

export const useVisitas = () =>
  useQuery<Visita[]>({
    queryKey: keys.visitas,
    queryFn: () => ComercialService.listVisitas(),
  })

export const useOportunidades = () =>
  useQuery<Oportunidade[]>({
    queryKey: keys.oportunidades,
    queryFn: () => ComercialService.listOportunidades(),
  })

export const useClienteMutations = () => {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.clientes })
    await queryClient.invalidateQueries({ queryKey: keys.oportunidades })
  }

  return {
    createCliente: useMutation({
      mutationFn: (payload: ClienteFormInput) => ComercialService.createCliente(payload),
      onSuccess: refresh,
    }),
    updateCliente: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: ClienteFormInput }) =>
        ComercialService.updateCliente(id, payload),
      onSuccess: refresh,
    }),
    deleteCliente: useMutation({
      mutationFn: (id: string) => ComercialService.deleteCliente(id),
      onSuccess: refresh,
    }),
  }
}

export const useAgendaMutations = () => {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.agenda })
  }

  return {
    createAgenda: useMutation({
      mutationFn: (payload: AgendaFormInput) => ComercialService.createAgenda(payload),
      onSuccess: refresh,
    }),
    updateAgenda: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: AgendaFormInput }) =>
        ComercialService.updateAgenda(id, payload),
      onSuccess: refresh,
    }),
    deleteAgenda: useMutation({
      mutationFn: (id: string) => ComercialService.deleteAgenda(id),
      onSuccess: refresh,
    }),
  }
}

export const useVisitaMutations = () => {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.visitas })
    await queryClient.invalidateQueries({ queryKey: keys.oportunidades })
  }

  return {
    createVisita: useMutation({
      mutationFn: (payload: VisitaFormInput) => ComercialService.createVisita(payload),
      onSuccess: refresh,
    }),
    updateVisita: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: VisitaFormInput }) =>
        ComercialService.updateVisita(id, payload),
      onSuccess: refresh,
    }),
    deleteVisita: useMutation({
      mutationFn: (id: string) => ComercialService.deleteVisita(id),
      onSuccess: refresh,
    }),
  }
}
