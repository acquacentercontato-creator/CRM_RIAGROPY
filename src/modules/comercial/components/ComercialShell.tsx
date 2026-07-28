import { Box, Tab, Tabs } from '@mui/material'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

type TabItem = {
  key: string
  label: string
  path: string
}

type ComercialShellProps = {
  children: ReactNode
}

export const ComercialShell = ({ children }: ComercialShellProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(location.pathname)

  const tabs = useMemo<TabItem[]>(
    () => [
      { key: 'clientes', label: t('menu.clientes'), path: '/clientes' },
      { key: 'agenda', label: t('menu.agenda'), path: '/agenda' },
      { key: 'visitas', label: t('menu.visitas'), path: '/visitas' },
      { key: 'oportunidades', label: t('menu.oportunidades'), path: '/oportunidades' },
    ],
    [t]
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
