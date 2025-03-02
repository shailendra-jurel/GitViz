// src/components/repositories/RepositoryList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  CallSplit as BranchIcon,
  Code as CodeIcon,
  Star as StarIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { fetchRepositories, selectRepository } from '../../store/repositorySlice';
import Loader from '../common/Loader';
import { useNavigate } from 'react-router-dom';

const RepositoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { repositories, selectedRepositories, loading, error } = useSelector((state) => state.repository);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 9;
  
  useEffect(() => {
    if (repositories.length === 0) {
      dispatch(fetchRepositories());
    }
  }, [dispatch, repositories.length]);
  
  // Extract unique languages from repositories
  const languages = repositories.reduce((acc, repo) => {
    if (repo.language && !acc.includes(repo.language)) {
      acc.push(repo.language);
    }
    return acc;
  }, []).sort();
  
  // Filter and sort repositories
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = filterLanguage === 'all' || repo.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });
  
  // Sort repositories
  const sortedRepositories = [...filteredRepositories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stars':
        return (b.stargazersCount || 0) - (a.stargazersCount || 0);
      case 'updated':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });
  
  // Paginate repositories
  const paginatedRepositories = sortedRepositories.slice((page - 1) * perPage, page * perPage);
  
  const totalPages = Math.ceil(sortedRepositories.length / perPage);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleLanguageChange = (e) => {
    setFilterLanguage(e.target.value);
    setPage(1); // Reset to first page when filtering
  };
  
  const handlePageChange = (e, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSelectRepository = (repo) => {
    dispatch(selectRepository(repo));
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
  };
  
  if (loading) {
    return <Loader />;
  }
  
  const isRepositorySelected = (repoId) => {
    return selectedRepositories.some(r => r.id === repoId);
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Your Repositories
      </Typography>
      
      {/* Filters and Search */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3.5}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="language-filter-label">Language</InputLabel>
            <Select
              labelId="language-filter-label"
              value={filterLanguage}
              onChange={handleLanguageChange}
              label="Language"
            >
              <MenuItem value="all">All Languages</MenuItem>
              {languages.map(lang => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3.5}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="updated">Last Updated</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="stars">Stars</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Repository list */}
      {error ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error loading repositories
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Box>
      ) : paginatedRepositories.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedRepositories.map(repo => (
              <Grid item xs={12} sm={6} md={4} key={repo.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: isRepositorySelected(repo.id) ? '2px solid' : 'none',
                    borderColor: 'secondary.main',
                  }}
                >
                  {isRepositorySelected(repo.id) && (
                    <Chip
                      color="secondary"
                      label="Selected"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <GitHubIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div" noWrap>
                        {repo.name}
                      </Typography>
                    </Box>
                    
                    <Typography color="text.secondary" gutterBottom>
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
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip 
                        label={repo.visibility} 
                        size="small" 
                        color={repo.visibility === 'private' ? 'error' : 'primary'} 
                        variant="outlined"
                      />
                      {repo.language && (
                        <Chip 
                          label={repo.language} 
                          size="small" 
                          color="default" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Box display="flex" alignItems="center">
                        <StarIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {repo.stargazersCount || 0}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <BranchIcon fontSize="small" sx={{ color: 'info.main', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {repo.forksCount || 0}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Updated {new Date(repo.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<CodeIcon />}
                      onClick={() => handleSelectRepository(repo)}
                      disabled={isRepositorySelected(repo.id)}
                      fullWidth
                    >
                      {isRepositorySelected(repo.id) ? 'Already Selected' : 'Select Repository'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              showFirstButton 
              showLastButton
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            No repositories found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || filterLanguage !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Connect your GitHub account to see your repositories'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default RepositoryList;