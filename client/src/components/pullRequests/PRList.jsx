// src/components/pullRequests/PRList.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  MergeType as MergeIcon,
  RemoveCircle as CloseIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import PRCard from './PRCard';

const PRList = ({ pullRequests, repository }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter PRs by status and search term
  const filteredPRs = pullRequests.filter(pr => {
    // Filter by status
    if (statusFilter === 'open' && pr.state !== 'open') return false;
    if (statusFilter === 'merged' && (!pr.mergedAt)) return false;
    if (statusFilter === 'closed' && (pr.state !== 'closed' || pr.mergedAt)) return false;
    
    // Filter by search term (title, number, or author)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      return (
        pr.title.toLowerCase().includes(lowerCaseSearch) ||
        pr.number.toString().includes(lowerCaseSearch) ||
        pr.user.login.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    return true;
  });
  
  // Sort PRs
  const sortedPRs = [...filteredPRs].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'recently-updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'least-recently-updated':
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      default: // 'newest'
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  // Count PRs by status
  const counts = pullRequests.reduce((acc, pr) => {
    if (pr.state === 'open') {
      acc.open++;
    } else if (pr.mergedAt) {
      acc.merged++;
    } else {
      acc.closed++;
    }
    return acc;
  }, { open: 0, merged: 0, closed: 0 });
  
  const handleStatusChange = (event, newValue) => {
    setStatusFilter(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  return (
    <Box>
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={statusFilter} 
          onChange={handleStatusChange} 
          aria-label="PR status filter"
        >
          <Tab 
            label={`All (${pullRequests.length})`} 
            value="all" 
            icon={<MergeIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Open (${counts.open})`} 
            value="open" 
            icon={<PendingIcon />} 
            iconPosition="start"
            sx={{ color: counts.open > 0 ? 'success.main' : 'text.secondary' }}
          />
          <Tab 
            label={`Merged (${counts.merged})`} 
            value="merged" 
            icon={<MergeIcon />} 
            iconPosition="start"
            sx={{ color: counts.merged > 0 ? 'secondary.main' : 'text.secondary' }}
          />
          <Tab 
            label={`Closed (${counts.closed})`} 
            value="closed" 
            icon={<CloseIcon />} 
            iconPosition="start"
            sx={{ color: counts.closed > 0 ? 'error.main' : 'text.secondary' }}
          />
        </Tabs>
      </Box>
      
      {/* Search and Sort */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              placeholder="Search by title, PR number, or author..."
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
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="sort-pr-label">Sort</InputLabel>
              <Select
                labelId="sort-pr-label"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort"
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="recently-updated">Recently updated</MenuItem>
                <MenuItem value="least-recently-updated">Least recently updated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* PR List */}
      {sortedPRs.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No pull requests match your filters.
        </Alert>
      ) : (
        <Paper elevation={0} variant="outlined">
          {sortedPRs.map((pr, index) => (
            <React.Fragment key={pr.id}>
              <PRCard pr={pr} repository={repository} />
              {index < sortedPRs.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Paper>
      )}
    </Box>
  );
};

PRList.propTypes = {
  pullRequests: PropTypes.array.isRequired,
  repository: PropTypes.object.isRequired
};

export default PRList;