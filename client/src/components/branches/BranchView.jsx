// src/components/branches/BranchView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Chip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Tooltip,
  IconButton,
  Avatar,
  useTheme,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  CallSplit as BranchIcon,
  Commit as CommitIcon,
  MergeType as MergeIcon,
  Article as ArticleIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  People as PeopleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Assignment as AssignmentIcon,
  FormatListBulleted as ListIcon,
  ViewModule as GridIcon,
  Code as CodeIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { fetchRepositoryDetails, fetchBranches, fetchPullRequests } from '../../store/repositorySlice';
import Loader from '../common/Loader';
import BranchCard from './BranchCard';
import BranchList from './BranchList';
import BranchNetwork from './BranchNetwork';
import PRList from '../pullRequests/PRList';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';

const BranchView = () => {
  const { owner, repo } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const { currentRepository, branches, pullRequests, loading, error } = useSelector((state) => state.repository);
  
  const [activeTab, setActiveTab] = useState(0);
  const [branchViewMode, setBranchViewMode] = useState('grid'); // 'grid' or 'list'
  const [networkLoading, setNetworkLoading] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [branchFilter, setBranchFilter] = useState('all');
  
  useEffect(() => {
    // Fetch repository details if we don't have them or if they don't match the URL
    if (!currentRepository || 
        currentRepository.owner.login !== owner || 
        currentRepository.name !== repo) {
      dispatch(fetchRepositoryDetails({ owner, repo }));
    }
    
    // Fetch branches and PRs
    dispatch(fetchBranches({ owner, repo }));
    dispatch(fetchPullRequests({ owner, repo }));
  }, [dispatch, owner, repo, currentRepository]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleRefresh = () => {
    dispatch(fetchBranches({ owner, repo }));
    dispatch(fetchPullRequests({ owner, repo }));
    enqueueSnackbar('Repository data refreshed', { variant: 'success' });
  };
  
  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };
  
  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };
  
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };
  
  const handleFilterChange = (filter) => {
    setBranchFilter(filter);
    handleFilterMenuClose();
  };
  
  const toggleBranchViewMode = () => {
    setBranchViewMode(branchViewMode === 'grid' ? 'list' : 'grid');
  };
  
  // Get the branch and PR data for this specific repository
  const repoBranches = branches[`${owner}/${repo}`] || [];
  const repoPRs = pullRequests[`${owner}/${repo}`] || [];
  
  // Group branches by prefix (e.g., feature/, bugfix/)
  const groupedBranches = repoBranches.reduce((acc, branch) => {
    const parts = branch.name.split('/');
    let group = 'other';
    
    if (parts.length > 1) {
      const prefix = parts[0].toLowerCase();
      if (['feature', 'bugfix', 'hotfix', 'release', 'chore', 'refactor'].includes(prefix)) {
        group = prefix;
      }
    } else if (branch.name === currentRepository?.defaultBranch) {
      group = 'main';
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(branch);
    return acc;
  }, {});
  
  // Filter branches based on selected filter
  const filteredBranches = {};
  if (branchFilter === 'all') {
    Object.assign(filteredBranches, groupedBranches);
  } else if (branchFilter === 'protected') {
    Object.keys(groupedBranches).forEach(group => {
      const protected_branches = groupedBranches[group].filter(branch => branch.protected);
      if (protected_branches.length > 0) {
        filteredBranches[group] = protected_branches;
      }
    });
  } else {
    // Filter by specific branch type (feature, bugfix, etc.)
    if (groupedBranches[branchFilter]) {
      filteredBranches[branchFilter] = groupedBranches[branchFilter];
    }
  }
  
  // Make sure main branch is displayed first
  const branchGroups = Object.keys(filteredBranches).sort((a, b) => {
    if (a === 'main') return -1;
    if (b === 'main') return 1;
    return a.localeCompare(b);
  });
  
  // Total count of all branches
  const totalBranchCount = Object.values(groupedBranches).reduce((sum, branches) => sum + branches.length, 0);
  
  // PR status counts
  const prCounts = repoPRs.reduce((acc, pr) => {
    if (pr.state === 'open') {
      acc.open++;
    } else if (pr.mergedAt) {
      acc.merged++;
    } else {
      acc.closed++;
    }
    return acc;
  }, { open: 0, merged: 0, closed: 0 });
  
  if (loading && !currentRepository) {
    return <Loader />;
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {/* Repository header */}
      {currentRepository && (
        <>
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                color="inherit"
                component="button"
                variant="body2"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                color="inherit"
                component="button"
                variant="body2"
                onClick={() => navigate('/repositories')}
              >
                Repositories
              </Link>
              <Typography color="text.primary">{currentRepository.name}</Typography>
            </Breadcrumbs>
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
              <Box display="flex">
                <Avatar
                  src={currentRepository.owner.avatarUrl}
                  alt={currentRepository.owner.login}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="h1">
                    {currentRepository.name}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    component="a"
                    href={currentRepository.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {currentRepository.owner.login} / {currentRepository.name}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={1}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<GitHubIcon />}
                  href={currentRepository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </Button>
                
                <IconButton
                  onClick={handleMoreMenuOpen}
                  aria-label="more options"
                  aria-controls="repo-menu"
                  aria-haspopup="true"
                >
                  <MoreIcon />
                </IconButton>
                
                <Menu
                  id="repo-menu"
                  anchorEl={moreMenuAnchorEl}
                  keepMounted
                  open={Boolean(moreMenuAnchorEl)}
                  onClose={handleMoreMenuClose}
                >
                  <MenuItem onClick={() => {
                    window.open(`${currentRepository.htmlUrl}/issues`, '_blank');
                    handleMoreMenuClose();
                  }}>
                    <ListIcon fontSize="small" sx={{ mr: 1 }} />
                    View Issues
                  </MenuItem>
                  <MenuItem onClick={() => {
                    window.open(`${currentRepository.htmlUrl}/pulls`, '_blank');
                    handleMoreMenuClose();
                  }}>
                    <MergeIcon fontSize="small" sx={{ mr: 1 }} />
                    View Pull Requests
                  </MenuItem>
                  <MenuItem onClick={() => {
                    window.open(`${currentRepository.htmlUrl}/network`, '_blank');
                    handleMoreMenuClose();
                  }}>
                    <TreeIcon fontSize="small" sx={{ mr: 1 }} />
                    View Network Graph
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            {currentRepository.description && (
              <Typography variant="body1" paragraph>
                {currentRepository.description}
              </Typography>
            )}
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              <Chip 
                label={currentRepository.visibility} 
                color={currentRepository.visibility === 'private' ? 'error' : 'primary'} 
              />
              {currentRepository.language && (
                <Chip 
                  label={currentRepository.language} 
                />
              )}
              <Chip 
                icon={<TreeIcon />} 
                label={`Default: ${currentRepository.defaultBranch}`} 
                variant="outlined"
              />
              <Chip
                icon={<StarIcon />}
                label={`${currentRepository.stargazersCount || 0} stars`}
                variant="outlined"
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <BranchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Branches
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      {totalBranchCount || 0}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Last updated {formatDistanceToNow(new Date(currentRepository.updatedAt))} ago
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <MergeIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      Pull Requests
                    </Typography>
                    <Typography variant="h3" color="secondary.main">
                      {repoPRs.length || 0}
                    </Typography>
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        label={`${prCounts.open} open`} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${prCounts.merged} merged`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                      Issues
                    </Typography>
                    <Typography variant="h3" color="error.main">
                      {currentRepository.openIssuesCount || 0}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Open issues
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ height: '100%' }}
                >
                  <CardActionArea 
                    href={`${currentRepository.htmlUrl}/network`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <TreeIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                        Network
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View the full commit and branch network on GitHub
                      </Typography>
                      <Box mt={1} display="flex" justifyContent="flex-end">
                        <GitHubIcon color="action" />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs for branches and PRs */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab 
                icon={<BranchIcon />} 
                iconPosition="start" 
                label={`Branches (${totalBranchCount || 0})`} 
              />
              <Tab 
                icon={<MergeIcon />} 
                iconPosition="start" 
                label={`Pull Requests (${repoPRs.length || 0})`} 
              />
              <Tab 
                icon={<TreeIcon />} 
                iconPosition="start" 
                label="Network Graph" 
              />
            </Tabs>
          </Box>
          
          {/* Branch Actions Bar */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Button
                startIcon={<FilterIcon />}
                variant="outlined"
                onClick={handleFilterMenuOpen}
                size="small"
              >
                {branchFilter === 'all' ? 'All Branches' : 
                  branchFilter === 'protected' ? 'Protected Branches' : 
                  `${branchFilter.charAt(0).toUpperCase() + branchFilter.slice(1)} Branches`}
              </Button>
              
              <Menu
                anchorEl={filterMenuAnchorEl}
                open={Boolean(filterMenuAnchorEl)}
                onClose={handleFilterMenuClose}
              >
                <MenuItem 
                  onClick={() => handleFilterChange('all')}
                  selected={branchFilter === 'all'}
                >
                  All Branches
                </MenuItem>
                <MenuItem 
                  onClick={() => handleFilterChange('protected')}
                  selected={branchFilter === 'protected'}
                >
                  Protected Branches
                </MenuItem>
                <Divider />
                {Object.keys(groupedBranches).map(group => (
                  <MenuItem 
                    key={group}
                    onClick={() => handleFilterChange(group)}
                    selected={branchFilter === group}
                  >
                    {group.charAt(0).toUpperCase() + group.slice(1)} Branches ({groupedBranches[group].length})
                  </MenuItem>
                ))}
              </Menu>
              
              <Tooltip title={branchViewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
                <IconButton onClick={toggleBranchViewMode}>
                  {branchViewMode === 'grid' ? <ListIcon /> : <GridIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          {/* Tab content */}
          <Box sx={{ mt: 3 }}>
            {/* Branches Tab */}
            {activeTab === 0 && (
              <Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : Object.keys(filteredBranches).length > 0 ? (
                  branchViewMode === 'grid' ? (
                    // Grid View
                    <>
                      {branchGroups.map(group => (
                        <Box key={group} sx={{ mb: 4 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2, 
                              pb: 1, 
                              borderBottom: '1px solid', 
                              borderColor: 'divider'
                            }}
                          >
                            <BranchIcon 
                              color={group === 'main' ? 'secondary' : 'action'} 
                              sx={{ mr: 1 }} 
                            />
                            <Typography 
                              variant="h6" 
                              color={group === 'main' ? 'secondary' : 'textPrimary'}
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {group === 'main' ? 'Main Branch' : `${group} Branches`}
                            </Typography>
                            <Chip 
                              label={filteredBranches[group].length} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color={group === 'main' ? 'secondary' : 'default'}
                            />
                          </Box>
                          
                          <Grid container spacing={2}>
                            {filteredBranches[group].map(branch => (
                              <Grid item xs={12} sm={6} md={4} key={branch.name}>
                                <BranchCard 
                                  branch={branch} 
                                  isDefault={branch.name === currentRepository.defaultBranch}
                                  repository={currentRepository}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </>
                  ) : (
                    // List View
                    <BranchList 
                      branchGroups={branchGroups}
                      groupedBranches={filteredBranches}
                      repository={currentRepository}
                    />
                  )
                ) : (
                  <Alert severity="info">
                    No branches match your current filter. Try changing or resetting the filter.
                  </Alert>
                )}
              </Box>
            )}
            
            {/* Pull Requests Tab */}
            {activeTab === 1 && (
              <Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <PRList pullRequests={repoPRs} repository={currentRepository} />
                )}
              </Box>
            )}
            
            {/* Network Graph Tab */}
            {activeTab === 2 && (
              <Box>
                {networkLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <BranchNetwork 
                    repository={currentRepository}
                    branches={repoBranches}
                  />
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default BranchView;