import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../redux/userSlice';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function Dashboard() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
            <CurrencyExchangeIcon sx={{ fontSize: '40px', marginRight: '10px' }}/>
        <Typography
            variant="h4"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CRYPTO EXCHANGE
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/profile">
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        {!user.isVerified && (
          <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <VerifiedIcon />
            </ListItemIcon>
            <ListItemText primary="Verification" />
          </ListItemButton>
          </ListItem>
        )}
      </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        {!user.isVerified && (
          <h3>Verify your account in order to access the application's functionalities.</h3>
        )}
      </Box>
    </Box>
  );
}