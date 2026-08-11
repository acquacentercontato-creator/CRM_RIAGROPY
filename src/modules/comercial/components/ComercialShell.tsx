import { Box, Tab, Tabs } from '@mui/material'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslationService } from '@/shared/hooks/useTranslationService'

type TabItem = {
  key: string
  label: string
  path: string
}

type ComercialShellProps = {
  children: ReactNode
}

export const ComercialShell = ({ children }: ComercialShellProps) => {
  const ts = useTranslationService()
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(location.pathname)

  const tabs = useMemo<TabItem[]>(
    () => [
      { key: 'clientes', label: ts('menu.clientes'), path: '/clientes' },
      { key: 'agenda', label: ts('menu.agenda'), path: '/agenda' },
      { key: 'visitas', label: ts('menu.visitas'), path: '/visitas' },
      { key: 'oportunidades', label: ts('menu.oportunidades'), path: '/oportunidades' },
    ],
    [ts]
  )

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Tabs
        value={value}
        onChange={(_, next) => {
          setValue(next)
          navigate(next)
        }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        {tabs.map((item) => (
          <Tab key={item.key} label={item.label} value={item.path} />
        ))}
      </Tabs>
      {children}
    </Box>
  )
}
