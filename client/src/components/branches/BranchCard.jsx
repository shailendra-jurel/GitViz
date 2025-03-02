// src/components/branches/BranchCard.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  CardActions,
  Button,
  Menu,
  MenuItem,
  Collapse,
  useTheme,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Divider
} from '@mui/material';
import {
  CallSplit as BranchIcon,
  Commit as CommitIcon,
  Lock as LockIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  CompareArrows as CompareIcon,
  MergeType as MergeIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const BranchCard = ({ branch, isDefault, repository }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Shorten commit SHA 
  const shortSha = branch.commit.sha.substring(0, 7);
  
  // Extract name parts for display
  const parts = branch.name.split('/');
  const prefixPart = parts.length > 1 ? parts[0] : null;
  const namePart = parts.length > 1 ? parts.slice(1).join('/') : branch.name;
  
  // Determine branch type for visual indicators
  let branchType = 'other';
  if (isDefault) {
    branchType = 'default';
  } else if (prefixPart) {
    if (['feature', 'feat'].includes(prefixPart.toLowerCase())) {
      branchType = 'feature';
    } else if (['bugfix', 'fix', 'bug'].includes(prefixPart.toLowerCase())) {
      branchType = 'bugfix';
    } else if (['hotfix'].includes(prefixPart.toLowerCase())) {
      branchType = 'hotfix';
    } else if (['release'].includes(prefixPart.toLowerCase())) {
      branchType = 'release';
    }
  }
  
  // Branch type colors
  const branchTypeColors = {
    default: theme.palette.secondary.main,
    feature: theme.palette.primary.main,
    bugfix: theme.palette.error.main,
    hotfix: theme.palette.warning.main,
    release: theme.palette.success.main,
    other: theme.palette.grey[500]
  };
  
  // Truncate branch name if it's too long
  const isBranchNameLong = namePart.length > 20;
  const displayName = isBranchNameLong 
    ? `${namePart.substring(0, 20)}...` 
    : namePart;
  
  // GitHub branch URL
  const branchUrl = `${repository.htmlUrl}/tree/${encodeURIComponent(branch.name)}`;
  
  // Commit URL
  const commitUrl = `${repository.htmlUrl}/commit/${branch.commit.sha}`;
  
  // Compare URL
  const compareUrl = `${repository.htmlUrl}/compare/${repository.defaultBranch}...${encodeURIComponent(branch.name)}`;
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle branch functions
  const handleCompare = () => {
    window.open(compareUrl, '_blank');
    handleMenuClose();
  };
  
  const handleViewCommits = () => {
    window.open(`${repository.htmlUrl}/commits/${encodeURIComponent(branch.name)}`, '_blank');
    handleMenuClose();
  };
  
  const handleViewFiles = () => {
    window.open(branchUrl, '_blank');
    handleMenuClose();
  };
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Card 
      elevation={isDefault ? 2 : 1} 
      sx={{ 
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isDefault ? `2px solid ${theme.palette.secondary.main}` : branch.protected ? `1px solid ${theme.palette.primary.main}` : 'none',
        '&:hover': {
          boxShadow: theme.shadows[isDefault ? 4 : 2]
        },
        transition: 'all 0.2s'
      }}
    >
      {isDefault && (
        <Chip
          label="Default"
          color="secondary"
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="flex-start">
            <BranchIcon 
              sx={{ 
                mr: 1, 
                mt: 0.5,
                color: branchTypeColors[branchType] 
              }} 
            />
            <Box>
              <Tooltip title={isBranchNameLong ? branch.name : ""}>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {prefixPart && (
                    <Typography component="span" variant="caption" sx={{ opacity: 0.7, mr: 0.5 }}>
                      {prefixPart}/
                    </Typography>
                  )}
                  {displayName}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            edge="end" 
            onClick={handleMenuOpen}
            aria-label="branch options"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewFiles}>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Files" />
            </MenuItem>
            <MenuItem onClick={handleViewCommits}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Commits" />
            </MenuItem>
            {!isDefault && (
              <MenuItem onClick={handleCompare}>
                <ListItemIcon>
                  <CompareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={`Compare with ${repository.defaultBranch}`} />
              </MenuItem>
            )}
          </Menu>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1.5}>
          <Tooltip title="Latest commit">
            <Box component="a" 
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <CommitIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {shortSha}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={0.5}>
          {branch.protected && (
            <Chip 
              icon={<LockIcon fontSize="small" />} 
              label="Protected" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ height: 24 }}
            />
          )}
          
          <Chip 
            label={branchType.charAt(0).toUpperCase() + branchType.slice(1)} 
            size="small"
            sx={{ 
              height: 24,
              bgcolor: `${branchTypeColors[branchType]}22`,
              color: branchTypeColors[branchType],
              border: `1px solid ${branchTypeColors[branchType]}`
            }}
          />
        </Box>
        
        <Button 
          size="small"
          endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          onClick={handleToggleExpand}
          sx={{ mt: 1, textTransform: 'none', px: 1 }}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </Button>
      </CardContent>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Divider sx={{ my: 1 }} />
          <List dense disablePadding>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CommitIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Commit SHA"
                secondary={shortSha}
              />
            </ListItem>
            
            {branch.commit.url && (
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <VisibilityIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="API URL"
                  secondary={branch.commit.url.split('/').pop().substring(0, 20) + '...'}
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Collapse>
      
      <CardActions sx={{ pt: 0 }}>
        <Button
          startIcon={<OpenInNewIcon />}
          size="small"
          href={branchUrl}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          variant="text"
        >
          View on GitHub
        </Button>
      </CardActions>
    </Card>
  );
};

BranchCard.propTypes = {
  branch: PropTypes.shape({
    name: PropTypes.string.isRequired,
    protected: PropTypes.bool,
    commit: PropTypes.shape({
      sha: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  isDefault: PropTypes.bool,
  repository: PropTypes.object.isRequired
};

BranchCard.defaultProps = {
  isDefault: false
};

export default BranchCard;