// src/components/repositories/RepositorySearchDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Avatar,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Box,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Star as StarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const RepositorySearchDialog = ({ open, onClose, onSelect, repositories, selectedRepositories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    // Reset search when dialog opens
    if (open) {
      setSearchTerm('');
      setIsSearching(false);
    }
  }, [open]);
  
  // Extract unique languages from repositories
  const languages = repositories
    .reduce((acc, repo) => {
      if (repo.language && !acc.includes(repo.language)) {
        acc.push(repo.language);
      }
      return acc;
    }, [])
    .sort();
  
  // Filter repositories based on search term and language
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = language === 'all' || repo.language === language;
    return matchesSearch && matchesLanguage;
  });
  
  // Sort repositories
  const sortedRepositories = [...filteredRepositories].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return (b.stargazersCount || 0) - (a.stargazersCount || 0);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
    
    // Simulate search delay for better UX
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  };
  
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleClose = () => {
    onClose();
  };
  
  const handleRepoSelect = (repo) => {
    onSelect(repo);
  };
  
  const isAlreadySelected = (repoId) => {
    return selectedRepositories.some(r => r.id === repoId);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Select Repository</Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box px={3} pb={2}>
        <TextField
          autoFocus
          margin="dense"
          id="search"
          placeholder="Search repositories..."
          type="text"
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Box display="flex" gap={2} mt={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="language-filter-label">Language</InputLabel>
            <Select
              labelId="language-filter-label"
              value={language}
              onChange={handleLanguageChange}
              label="Language"
            >
              <MenuItem value="all">All Languages</MenuItem>
              {languages.map(lang => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" fullWidth>
            <InputLabel id="sort-by-label">Sort</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="stars">Stars</MenuItem>
              <MenuItem value="updated">Recently Updated</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Divider />
      
      <DialogContent sx={{ px: 0, pb: 0 }}>
        {sortedRepositories.length > 0 ? (
          <List disablePadding sx={{ overflow: 'auto' }}>
            {sortedRepositories.map((repo) => {
              const selected = isAlreadySelected(repo.id);
              return (
                <React.Fragment key={repo.id}>
                  <ListItem 
                    disablePadding 
                    secondaryAction={
                      selected ? (
                        <Chip 
                          label="Selected" 
                          color="primary" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="primary"
                          onClick={() => handleRepoSelect(repo)}
                          sx={{ mr: 1 }}
                        >
                          Select
                        </Button>
                      )
                    }
                  >
                    <ListItemButton 
                      onClick={() => !selected && handleRepoSelect(repo)}
                      disabled={selected}
                      sx={{ opacity: selected ? 0.7 : 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: selected ? 'primary.main' : 'action.selected' }}>
                          <CodeIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" noWrap>
                            {repo.name}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" noWrap color="text.secondary">
                              {repo.owner.login} • {repo.visibility}
                            </Typography>
                            {repo.description && (
                              <Typography variant="body2" noWrap color="text.secondary">
                                {repo.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              {repo.language && (
                                <Chip
                                  label={repo.language}
                                  size="small"
                                  sx={{ mr: 1, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              {repo.stargazersCount > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                  <StarIcon sx={{ fontSize: 14, mr: 0.5, color: 'warning.main' }} />
                                  <Typography variant="caption">{repo.stargazersCount}</Typography>
                                </Box>
                              )}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm
                ? 'No repositories found matching your search'
                : 'Start typing to search repositories'}
            </Typography>
            {searchTerm && (
              <Button
                variant="text"
                color="primary"
                onClick={() => setSearchTerm('')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

RepositorySearchDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  repositories: PropTypes.array.isRequired,
  selectedRepositories: PropTypes.array.isRequired,
};

export default RepositorySearchDialog;