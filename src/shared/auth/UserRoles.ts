export const UserRole = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  COMERCIAL: 'comercial',
  ENGENHARIA: 'engenharia',
  OBRAS: 'obras',
  ASSISTENCIA: 'assistencia',
  FINANCEIRO: 'financeiro',
  VISUALIZADOR: 'visualizador',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
