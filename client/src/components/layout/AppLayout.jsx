// src/components/layout/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Badge,
  InputBase,
  useMediaQuery,
  Fade,
  Button,
  Chip,
  CssBaseline,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  GitHub as GitHubIcon,
  AccountCircle,
  Code as CodeIcon,
  CallSplit as BranchIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { fetchUserProfile, logout } from '../../store/authSlice';
import { 
  fetchRepositories, 
  selectRepository, 
  deselectRepository, 
  setCurrentRepository,
  saveFavoriteRepositories
} from '../../store/repositorySlice';
import Loader from '../common/Loader';
import RepositorySearchDialog from '../repositories/RepositorySearchDialog';
import { useSnackbar } from 'notistack';

const drawerWidth = 260;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && !isMobile && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })(
  ({ theme, open, isMobile }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    zIndex: theme.zIndex.drawer + 1,
    ...(open && !isMobile && {
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
  justifyContent: 'space-between',
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const AppLayout = ({ toggleColorMode }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { repositories, selectedRepositories, currentRepository, loading: repoLoading } = useSelector((state) => state.repository);
  
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  
  // Close drawer on mobile by default
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);
  
  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
    dispatch(fetchRepositories());
  }, [dispatch, user]);
  
  // Close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [location, isMobile]);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };
  
  const handleRepositoryClick = (repo) => {
    dispatch(selectRepository(repo));
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
    if (isMobile) {
      setDrawerOpen(false);
    }
    enqueueSnackbar(`Viewing repository: ${repo.name}`, { variant: 'info' });
  };
  
  const handleRemoveRepository = (e, repoId) => {
    e.stopPropagation();
    dispatch(deselectRepository(repoId));
    enqueueSnackbar('Repository removed from selection', { variant: 'success' });
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/repositories?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      if (isMobile) {
        setDrawerOpen(false);
      }
    }
  };
  
  const handleSearchDialogOpen = () => {
    setSearchOpen(true);
  };
  
  const handleSearchDialogClose = () => {
    setSearchOpen(false);
  };
  
  const handleSearchDialogSelect = (repo) => {
    dispatch(selectRepository(repo));
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
    setSearchOpen(false);
    enqueueSnackbar(`Selected repository: ${repo.name}`, { variant: 'success' });
  };
  
  const isLoading = authLoading || repoLoading;
  const activeRoute = location.pathname.split('/')[1] || 'dashboard';
  
  // Mobile menu
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={() => setMobileMoreAnchorEl(null)}
    >
      <MenuItem onClick={handleSearchDialogOpen}>
        <IconButton size="large" color="inherit">
          <SearchIcon />
        </IconButton>
        <p>Search</p>
      </MenuItem>
      <MenuItem onClick={toggleColorMode}>
        <IconButton size="large" color="inherit">
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <p>{theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-haspopup="true"
          color="inherit"
        >
          {user?.avatarUrl ? (
            <Avatar src={user.avatarUrl} alt={user.name || user.login} sx={{ width: 32, height: 32 }} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
  
  // Profile menu
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {user && (
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Avatar src={user.avatarUrl} alt={user.name || user.login} sx={{ width: 40, height: 40, mr: 1.5 }} />
          <Box>
            <Typography variant="subtitle1">{user.name || user.login}</Typography>
            <Typography variant="body2" color="text.secondary">@{user.login}</Typography>
          </Box>
        </Box>
      )}
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        My Profile
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBarStyled position="fixed" open={drawerOpen} isMobile={isMobile}>
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
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GitHubIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              GitViz
            </Typography>
          </Box>
          
          {/* Search bar - hidden on mobile */}
          <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search repositories..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
          </Search>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop Nav Icons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title="Search repositories">
              <IconButton 
                size="large" 
                color="inherit"
                onClick={handleSearchDialogOpen}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton
                size="large"
                color="inherit"
                onClick={toggleColorMode}
              >
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton size="large" color="inherit">
                <StyledBadge badgeContent={4} color="error">
                  <NotificationsIcon />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account settings">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.avatarUrl ? (
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
          </Box>
          
          {/* Mobile Nav Icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      {/* Mobile menu */}
      {renderMobileMenu}
      
      {/* Profile menu */}
      {renderMenu}
      
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
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        <DrawerHeader>
          <Box display="flex" alignItems="center">
            <GitHubIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              GitViz
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        {/* Navigation Links */}
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeRoute === 'dashboard'} 
              onClick={() => navigate('/dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon color={activeRoute === 'dashboard' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeRoute === 'repositories' && !location.pathname.includes('/')} 
              onClick={() => navigate('/repositories')}
            >
              <ListItemIcon>
                <CodeIcon color={activeRoute === 'repositories' && !location.pathname.includes('/') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="All Repositories" />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider />
        
        {/* Selected Repositories List */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Selected Repositories
          </Typography>
          <Tooltip title="Add repository">
            <IconButton size="small" onClick={handleSearchDialogOpen}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <List sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
          {selectedRepositories.length > 0 ? (
            selectedRepositories.map((repo) => (
              <ListItem 
                key={repo.id} 
                disablePadding
                secondaryAction={
                  <IconButton edge="end" onClick={(e) => handleRemoveRepository(e, repo.id)} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  bgcolor: currentRepository && currentRepository.id === repo.id ? 'action.selected' : 'transparent'
                }}
              >
                <ListItemButton onClick={() => handleRepositoryClick(repo)}>
                  <ListItemIcon>
                    <CodeIcon color={currentRepository && currentRepository.id === repo.id ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={repo.name} 
                    secondary={repo.owner.login}
                    primaryTypographyProps={{
                      fontWeight: currentRepository && currentRepository.id === repo.id ? 'bold' : 'normal',
                      variant: 'body2',
                      noWrap: true
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      noWrap: true
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No repositories selected" 
                secondary="Click the + button to add"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )}
        </List>
        
        {selectedRepositories.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              onClick={() => dispatch(saveFavoriteRepositories(selectedRepositories))}
              startIcon={<StarIcon fontSize="small" />}
            >
              Save Selection
            </Button>
          </Box>
        )}
        
        <Divider />
        
        {/* User Info at Bottom */}
        {user && (
          <Box sx={{ p: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={user.avatarUrl} 
                alt={user.name || user.login}
                sx={{ width: 32, height: 32, mr: 1.5 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>{user.name || user.login}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>@{user.login}</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
      
      {/* Repository Search Dialog */}
      <RepositorySearchDialog
        open={searchOpen}
        onClose={handleSearchDialogClose}
        onSelect={handleSearchDialogSelect}
        repositories={repositories}
        selectedRepositories={selectedRepositories}
      />
      
      {/* Main Content */}
      <Main open={drawerOpen} isMobile={isMobile}>
        <DrawerHeader />
        {isLoading ? <Loader /> : <Outlet />}
      </Main>
    </Box>
  );
};

export default AppLayout;