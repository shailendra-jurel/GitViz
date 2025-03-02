// src/components/layout/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  GitHub as GitHubIcon,
  AccountCircle,
  Code as CodeIcon,
  CallSplit as BranchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { fetchUserProfile, logout } from '../../store/authSlice';
import { 
  fetchRepositories, 
  selectRepository, 
  deselectRepository, 
  setCurrentRepository 
} from '../../store/repositorySlice';
import Loader from '../common/Loader';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { repositories, selectedRepositories, currentRepository, loading: repoLoading } = useSelector((state) => state.repository);
  
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  
  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
    dispatch(fetchRepositories());
  }, [dispatch, user]);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };
  
  const handleRepositoryClick = (repo) => {
    dispatch(selectRepository(repo));
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
  };
  
  const handleRemoveRepository = (e, repo) => {
    e.stopPropagation();
    dispatch(deselectRepository(repo.id));
  };
  
  const isLoading = authLoading || repoLoading;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBarStyled position="fixed" open={drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <GitHubIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            GitViz
          </Typography>
          
          {user && (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  {user.avatarUrl ? (
                    <Avatar 
                      src={user.avatarUrl} 
                      alt={user.name || user.login} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBarStyled>
      
      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Repositories
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        {/* Selected Repositories List */}
        <List>
          {selectedRepositories.length > 0 ? (
            selectedRepositories.map((repo) => (
              <ListItem 
                key={repo.id} 
                disablePadding
                sx={{
                  bgcolor: currentRepository && currentRepository.id === repo.id ? 'action.selected' : 'transparent'
                }}
              >
                <ListItemButton onClick={() => handleRepositoryClick(repo)}>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={repo.name} 
                    secondary={repo.owner.login}
                    primaryTypographyProps={{
                      fontWeight: currentRepository && currentRepository.id === repo.id ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No repositories selected" />
            </ListItem>
          )}
        </List>
        
        <Divider />
        
        {/* All Repositories Section */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Select a Repository
          </Typography>
        </Box>
        
        <List sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          {repositories.slice(0, 20).map((repo) => {
            const isSelected = selectedRepositories.some(r => r.id === repo.id);
            return (
              <ListItem key={repo.id} disablePadding>
                <ListItemButton 
                  onClick={() => !isSelected && handleRepositoryClick(repo)}
                  disabled={isSelected}
                >
                  <ListItemIcon>
                    {isSelected ? <BranchIcon color="secondary" /> : <CodeIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={repo.name} 
                    secondary={repo.owner.login}
                    sx={{ 
                      opacity: isSelected ? 0.7 : 1
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Main open={drawerOpen}>
        <DrawerHeader />
        {isLoading ? <Loader /> : <Outlet />}
      </Main>
    </Box>
  );
};

export default AppLayout;