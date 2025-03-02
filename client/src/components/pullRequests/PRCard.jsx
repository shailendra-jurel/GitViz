// src/components/pullRequests/PRCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Link,
  Button,
  Tooltip
} from '@mui/material';
import {
  MergeType as MergeIcon,
  RemoveCircle as CloseIcon,
  Schedule as PendingIcon,
  CallSplit as BranchIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const PRCard = ({ pr, repository }) => {
  // Determine PR status and corresponding color/icon
  const getStatusInfo = () => {
    if (pr.state === 'open') {
      return {
        label: 'Open',
        color: 'success',
        icon: <PendingIcon fontSize="small" />
      };
    } else if (pr.mergedAt) {
      return {
        label: 'Merged',
        color: 'secondary',
        icon: <MergeIcon fontSize="small" />
      };
    } else {
      return {
        label: 'Closed',
        color: 'error',
        icon: <CloseIcon fontSize="small" />
      };
    }
  };
  
  const status = getStatusInfo();
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate time elapsed
  const timeElapsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };
  
  return (
    <Box sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" mb={0.5}>
            <Chip 
              icon={status.icon}
              label={status.label}
              size="small"
              color={status.color}
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              #{pr.number} opened {timeElapsed(pr.createdAt)}
            </Typography>
          </Box>
          
          <Typography variant="h6" component="h3" gutterBottom>
            <Link 
              href={pr.htmlUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              underline="hover"
              color="text.primary"
            >
              {pr.title}
            </Link>
          </Typography>
          
          <Box display="flex" alignItems="center" mt={1} mb={1}>
            <BranchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {pr.head.ref} → {pr.base.ref}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center">
          <Tooltip title={`Author: ${pr.user.login}`}>
            <Avatar 
              src={pr.user.avatarUrl} 
              alt={pr.user.login}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
          </Tooltip>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            href={pr.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </Button>
        </Box>
      </Box>
      
      {/* Additional metadata */}
      <Box display="flex" alignItems="center" mt={1} flexWrap="wrap" gap={2}>
        {pr.mergedAt && (
          <Typography variant="body2" color="text.secondary">
            <Tooltip title={formatDate(pr.mergedAt)}>
              <span>Merged: {timeElapsed(pr.mergedAt)}</span>
            </Tooltip>
          </Typography>
        )}
        
        {pr.closedAt && !pr.mergedAt && (
          <Typography variant="body2" color="text.secondary">
            <Tooltip title={formatDate(pr.closedAt)}>
              <span>Closed: {timeElapsed(pr.closedAt)}</span>
            </Tooltip>
          </Typography>
        )}
        
        {pr.updatedAt && (
          <Typography variant="body2" color="text.secondary">
            <Tooltip title={formatDate(pr.updatedAt)}>
              <span>Updated: {timeElapsed(pr.updatedAt)}</span>
            </Tooltip>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

PRCard.propTypes = {
  pr: PropTypes.object.isRequired,
  repository: PropTypes.object.isRequired
};

export default PRCard;