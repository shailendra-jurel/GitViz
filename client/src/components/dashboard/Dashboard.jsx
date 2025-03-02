// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Button,
  Container,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Storage as StorageIcon,
  CallSplit as BranchIcon,
  People as PeopleIcon,
  AccountTree as TreeIcon,
  GitHub as GitHubIcon,
  Commit as CommitIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Code as CodeIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as CompletedIcon,
  Refresh as RefreshIcon,
  MergeType as MergeIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchRepositories, selectRepository } from '../../store/repositorySlice';
import Loader from '../common/Loader';
import { formatDistanceToNow } from 'date-fns';
import repositoryService from '../../services/repositoryService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { repositories, selectedRepositories, loading } = useSelector((state) => state.repository);

  const [activityTab, setActivityTab] = useState(0);
  const [activityData, setActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [recentCommits, setRecentCommits] = useState([]);
  const [recentPRs, setRecentPRs] = useState([]);
  const [contributorStats, setContributorStats] = useState(null);

  useEffect(() => {
    if (repositories.length === 0) {
      dispatch(fetchRepositories());
    }
  }, [dispatch, repositories.length]);

  useEffect(() => {
    // Only fetch activity data if we have selected repositories
    if (selectedRepositories.length > 0) {
      fetchActivityData();
    }
  }, [selectedRepositories]);

  const fetchActivityData = async () => {
    if (selectedRepositories.length === 0) return;
    
    setActivityLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Use the first selected repository for demo
      const repo = selectedRepositories[0];
      
      // Fetch commit data
      const commitsResponse = await repositoryService.getRepositoryNetwork(
        token, 
        repo.owner.login, 
        repo.name
      );
      
      // Fetch PR data
      const prsResponse = await repositoryService.getPullRequestActivity(
        token, 
        repo.owner.login, 
        repo.name
      );
      
      // Fetch contributor data
      const contributorResponse = await repositoryService.getContributorActivity(
        token, 
        repo.owner.login, 
        repo.name
      );
      
      setActivityData({
        commits: prepareCommitData(commitsResponse),
        prs: preparePRData(prsResponse)
      });
      
      // Set recent commits and PRs for the activity feed
      if (commitsResponse.graph && commitsResponse.graph.nodes) {
        const commits = commitsResponse.graph.nodes
          .filter(node => node.type === 'commit')
          .map(node => node.data)
          .slice(0, 5);
        
        setRecentCommits(commits);
      }
      
      if (prsResponse && prsResponse.pullRequests) {
        setRecentPRs(prsResponse.pullRequests.slice(0, 5));
      }
      
      if (contributorResponse) {
        setContributorStats(contributorResponse);
      }
      
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const prepareCommitData = (data) => {
    // If no data, return placeholder
    if (!data || !data.graph || !data.graph.nodes) {
      return {
        labels: Array(7).fill(0).map((_, i) => `Day ${i+1}`),
        datasets: [{
          label: 'Commits',
          data: Array(7).fill(0).map(() => Math.floor(Math.random() * 10)),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main,
        }]
      };
    }
    
    // Process the real data
    const commits = data.graph.nodes.filter(node => node.type === 'commit');
    
    // Group by date
    const commitsByDate = commits.reduce((acc, commit) => {
      const date = new Date(commit.data.author.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Sort dates and take the last 7 days
    const sortedDates = Object.keys(commitsByDate).sort();
    const last7Dates = sortedDates.slice(-7);
    
    return {
      labels: last7Dates.map(date => date.split('-').slice(1).join('/')), // Format as MM/DD
      datasets: [{
        label: 'Commits',
        data: last7Dates.map(date => commitsByDate[date]),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
      }]
    };
  };

  const preparePRData = (data) => {
    // If no data, return placeholder
    if (!data || !data.summary) {
      return {
        labels: ['Open', 'Merged', 'Closed'],
        datasets: [{
          label: 'Pull Requests',
          data: [3, 5, 2],
          backgroundColor: [
            theme.palette.success.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
          ],
          borderColor: [
            theme.palette.success.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
          ],
          borderWidth: 1,
        }]
      };
    }
    
    // Process the real data
    return {
      labels: ['Open', 'Merged', 'Closed'],
      datasets: [{
        label: 'Pull Requests',
        data: [
          data.summary.open || 0,
          data.summary.merged || 0,
          data.summary.closed || 0
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
        ],
        borderWidth: 1,
      }]
    };
  };

  const handleSelectRepository = (repo) => {
    dispatch(selectRepository(repo));
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
  };

  const handleTabChange = (event, newValue) => {
    setActivityTab(newValue);
  };

  const handleRefreshActivity = () => {
    fetchActivityData();
  };

  if (loading || !user) {
    return <Loader />;
  }

  const recentRepositories = repositories.slice(0, 6);
  
  // Create language distribution data
  const languageStats = repositories.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});
  
  const languageData = {
    labels: Object.keys(languageStats),
    datasets: [{
      label: 'Languages',
      data: Object.values(languageStats),
      backgroundColor: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main,
        '#9c27b0',
        '#795548',
        '#607d8b',
      ],
      borderWidth: 1,
    }]
  };

  return (
    <Container maxWidth="lg">
      {/* User welcome section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {user?.avatarUrl && (
              <Avatar
                src={user.avatarUrl}
                alt={user.name || user.login}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid white'
                }}
              />
            )}
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.name || user?.login || 'GitHub User'}!
            </Typography>
            <Typography variant="body1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/repositories')}
            >
              Browse Repositories
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <StorageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {repositories.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Repositories
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BranchIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {selectedRepositories.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Selected Repos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.error.main, mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {contributorStats ? contributorStats.contributionSummary.length : '--'}
                  </Typography>
                  <Typography color="text.secondary">
                    Contributors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <CommitIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {recentCommits.length > 0 ? recentCommits.length : '--'}
                  </Typography>
                  <Typography color="text.secondary">
                    Recent Commits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Repository Activity Section */}
      {selectedRepositories.length > 0 ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1}>
                  <Typography variant="h6">
                    Repository Activity
                  </Typography>
                  <Tooltip title="Refresh data">
                    <IconButton onClick={handleRefreshActivity} size="small">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Tabs 
                  value={activityTab} 
                  onChange={handleTabChange} 
                  aria-label="repository activity tabs"
                  sx={{ px: 2 }}
                >
                  <Tab icon={<CommitIcon />} iconPosition="start" label="Commits" />
                  <Tab icon={<MergeIcon />} iconPosition="start" label="Pull Requests" />
                  <Tab icon={<BarChartIcon />} iconPosition="start" label="Languages" />
                </Tabs>
              </Box>
              <CardContent>
                {activityLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {activityTab === 0 && (
                      <Box height={300}>
                        {activityData && activityData.commits ? (
                          <Line 
                            data={activityData.commits} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                                title: {
                                  display: true,
                                  text: 'Commit Activity (Last 7 Days)',
                                },
                              },
                            }}
                          />
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">No commit data available</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {activityTab === 1 && (
                      <Box height={300} display="flex" justifyContent="center">
                        {activityData && activityData.prs ? (
                          <Box sx={{ maxWidth: 400, width: '100%' }}>
                            <Pie 
                              data={activityData.prs} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: true,
                                    text: 'Pull Request Status',
                                  },
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">No pull request data available</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {activityTab === 2 && (
                      <Box height={300} display="flex" justifyContent="center">
                        {languageData.labels.length > 0 ? (
                          <Box sx={{ maxWidth: 400, width: '100%' }}>
                            <Pie 
                              data={languageData} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: true,
                                    text: 'Repository Languages',
                                  },
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">No language data available</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Repositories Selected
          </Typography>
          <Typography variant="body1" paragraph>
            Select repositories from the sidebar to see activity data and visualizations.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/repositories')}
            sx={{ mt: 1 }}
          >
            Browse Repositories
          </Button>
        </Paper>
      )}

      {/* Recent Activity and Recent Repositories */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ paddingBottom: 0 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
            </CardContent>
            
            <List sx={{ pb: 0 }}>
              {recentCommits.length > 0 || recentPRs.length > 0 ? (
                <>
                  {recentCommits.slice(0, 3).map((commit, index) => (
                    <React.Fragment key={`commit-${commit.sha}`}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar src={commit.author.avatarUrl || ''}>
                            <CommitIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {commit.message.split('\n')[0]}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {commit.author.name} committed {formatDistanceToNow(new Date(commit.author.date))} ago
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentCommits.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                  ))}
                  
                  {recentPRs.slice(0, 2).map((pr, index) => (
                    <React.Fragment key={`pr-${pr.id}`}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar src={pr.user.avatarUrl || ''}>
                            <MergeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {pr.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {pr.user.login} {pr.state === 'open' ? 'opened' : pr.state} a PR {formatDistanceToNow(new Date(pr.createdAt))} ago
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentPRs.length - 1 && <Divider component="li" variant="inset" />}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No recent activity"
                    secondary="Select a repository to see recent commits and pull requests"
                  />
                </ListItem>
              )}
            </List>
            
            <Box textAlign="center" py={2}>
              {selectedRepositories.length > 0 && (
                <Button 
                  color="primary" 
                  onClick={() => navigate(`/repositories/${selectedRepositories[0].owner.login}/${selectedRepositories[0].name}`)}
                >
                  View More Activity
                </Button>
              )}
            </Box>
          </Card>
        </Grid>
        
        {/* Recent Repositories */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ paddingBottom: 0 }}>
              <Typography variant="h6" gutterBottom>
                Recent Repositories
              </Typography>
            </CardContent>
            
            <Grid container spacing={2} sx={{ p: 2 }}>
              {recentRepositories.slice(0, 4).map((repo) => (
                <Grid item xs={12} sm={6} key={repo.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardActionArea 
                      onClick={() => handleSelectRepository(repo)}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ bgcolor: 'action.selected', mr: 1, width: 28, height: 28 }}>
                            <FolderIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="subtitle1" component="div" noWrap>
                            {repo.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {repo.owner.login}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '40px'
                        }}>
                          {repo.description || 'No description available'}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                          {repo.language && (
                            <Chip 
                              label={repo.language} 
                              size="small" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Updated {formatDistanceToNow(new Date(repo.updatedAt))} ago
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box textAlign="center" py={2}>
              <Button 
                color="primary" 
                onClick={() => navigate('/repositories')}
              >
                View All Repositories
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;