import {
  AppBar,
  Box,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import MenuIcon from '@mui/icons-material/Menu'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslationService } from '@/shared/hooks/useTranslationService'
import { navigationItems } from '@/app/navigation'
import { useThemeMode } from '@/theme/ThemeModeContext'
import { useAuth } from '@/auth/AuthContext'
import { PermissionService } from '@/shared/auth/PermissionService'

const DRAWER_WIDTH = 260

export const MainLayout = () => {
  const { i18n } = useTranslation()
  const ts = useTranslationService()
  const { mode, toggleMode } = useThemeMode()
  const { logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const allowedNavigationItems = navigationItems.filter((item) =>
    PermissionService.canSeeMenu(user?.role, item.permission)
  )

  const navContent = (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ px: 1, pb: 1 }}>
        {ts('app.name')}
      </Typography>
      <List disablePadding>
        {allowedNavigationItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={ts(item.labelKey)} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255,255,255,0.82)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {ts('app.name')}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>{ts('layout.language')}</InputLabel>
            <Select
              value={i18n.language}
              label={ts('layout.language')}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
            >
              <MenuItem value="pt-BR">{ts('language.pt-BR')}</MenuItem>
              <MenuItem value="es-PY">{ts('language.es-PY')}</MenuItem>
              <MenuItem value="gn-PY">{ts('language.gn-PY')}</MenuItem>
            </Select>
          </FormControl>

          <IconButton color="inherit" onClick={toggleMode} aria-label={ts('layout.theme')}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          <ListItemButton onClick={logout} sx={{ width: 'auto', borderRadius: 2 }}>
            <ListItemText primary={ts('actions.logout')} />
          </ListItemButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {navContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {navContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Outlet />
        <Typography
          component="footer"
          variant="body2"
          color="text.secondary"
          sx={{ pt: 4, textAlign: 'center' }}
        >
          {ts('layout.footer')}
        </Typography>
      </Box>
    </Box>
  )
}
