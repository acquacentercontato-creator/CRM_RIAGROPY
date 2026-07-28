import type { ReactNode } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupsIcon from '@mui/icons-material/Groups'
import EventIcon from '@mui/icons-material/Event'
import PinDropIcon from '@mui/icons-material/PinDrop'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import EngineeringIcon from '@mui/icons-material/Engineering'
import ConstructionIcon from '@mui/icons-material/Construction'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import SummarizeIcon from '@mui/icons-material/Summarize'
import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SettingsIcon from '@mui/icons-material/Settings'

export type NavigationItem = {
  path: string
  labelKey: string
  icon: ReactNode
}

export const navigationItems: NavigationItem[] = [
  { path: '/', labelKey: 'menu.dashboard', icon: <DashboardIcon fontSize="small" /> },
  {
    path: '/clientes',
    labelKey: 'menu.clientes',
    icon: <GroupsIcon fontSize="small" />,
  },
  { path: '/agenda', labelKey: 'menu.agenda', icon: <EventIcon fontSize="small" /> },
  {
    path: '/visitas',
    labelKey: 'menu.visitas',
    icon: <PinDropIcon fontSize="small" />,
  },
  {
    path: '/oportunidades',
    labelKey: 'menu.oportunidades',
    icon: <AutoGraphIcon fontSize="small" />,
  },
  {
    path: '/riego',
    labelKey: 'menu.riego',
    icon: <WaterDropIcon fontSize="small" />,
  },
  {
    path: '/imoto',
    labelKey: 'menu.imoto',
    icon: <PrecisionManufacturingIcon fontSize="small" />,
  },
  {
    path: '/engenharia',
    labelKey: 'menu.engenharia',
    icon: <EngineeringIcon fontSize="small" />,
  },
  { path: '/obras', labelKey: 'menu.obras', icon: <ConstructionIcon fontSize="small" /> },
  {
    path: '/assistencia',
    labelKey: 'menu.assistencia',
    icon: <SupportAgentIcon fontSize="small" />,
  },
  {
    path: '/relatorios',
    labelKey: 'menu.relatorios',
    icon: <SummarizeIcon fontSize="small" />,
  },
  {
    path: '/administracao',
    labelKey: 'menu.administracao',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
  },
  {
    path: '/configuracoes',
    labelKey: 'menu.configuracoes',
    icon: <SettingsIcon fontSize="small" />,
  },
]
