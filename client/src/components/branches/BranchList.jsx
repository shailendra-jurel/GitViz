// src/components/branches/BranchList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Link,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  CallSplit as BranchIcon,
  Lock as LockIcon,
  Commit as CommitIcon,
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const BranchList = ({ branchGroups, groupedBranches, repository }) => {
  return (
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
              label={groupedBranches[group].length} 
              size="small" 
              sx={{ ml: 1 }}
              color={group === 'main' ? 'secondary' : 'default'}
            />
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label={`${group} branches`} size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="40%">Branch Name</TableCell>
                  <TableCell>Last Commit</TableCell>
                  <TableCell align="center">Protected</TableCell>
                  <TableCell align="center">Default</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedBranches[group].map(branch => {
                  // Shorten commit SHA
                  const shortSha = branch.commit.sha.substring(0, 7);
                  
                  // Extract name parts for display
                  const parts = branch.name.split('/');
                  const displayName = parts.length > 1 
                    ? <><span style={{ opacity: 0.7 }}>{parts[0]}/</span>{parts.slice(1).join('/')}</>
                    : branch.name;
                  
                  // Is default branch?
                  const isDefault = branch.name === repository.defaultBranch;
                  
                  // GitHub branch URL
                  const branchUrl = `${repository.htmlUrl}/tree/${encodeURIComponent(branch.name)}`;
                  
                  // Commit URL
                  const commitUrl = `${repository.htmlUrl}/commit/${branch.commit.sha}`;
                  
                  return (
                    <TableRow 
                      key={branch.name}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: isDefault ? 'action.selected' : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BranchIcon 
                            color={isDefault ? "secondary" : "action"} 
                            fontSize="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" fontWeight={isDefault ? 'bold' : 'normal'}>
                            {displayName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                        >
                          <CommitIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {shortSha}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell align="center">
                        {branch.protected ? (
                          <Chip
                            icon={<LockIcon fontSize="small" />}
                            label="Yes"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isDefault ? (
                          <Chip
                            label="Default"
                            size="small"
                            color="secondary"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View on GitHub">
                          <IconButton 
                            size="small"
                            href={branchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </>
  );
};

BranchList.propTypes = {
  branchGroups: PropTypes.array.isRequired,
  groupedBranches: PropTypes.object.isRequired,
  repository: PropTypes.object.isRequired
};

export default BranchList;