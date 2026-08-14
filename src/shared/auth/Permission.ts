export interface Permission {
  dashboard: boolean
  clientes: boolean
  agenda: boolean
  visitas: boolean
  oportunidades: boolean
  riego: boolean
  imoto: boolean
  ecolife: boolean
  engenharia: boolean
  obras: boolean
  assistencia: boolean
  relatorios: boolean
  administracao: boolean
  configuracoes: boolean
  editar: boolean
  excluir: boolean
  upload: boolean
  download: boolean
  anexos: boolean
}

export type PermissionKey = keyof Permission
export type MenuPermissionKey =
  | 'dashboard'
  | 'clientes'
  | 'agenda'
  | 'visitas'
  | 'oportunidades'
  | 'riego'
  | 'imoto'
  | 'ecolife'
  | 'engenharia'
  | 'obras'
  | 'assistencia'
  | 'relatorios'
  | 'administracao'
  | 'configuracoes'
