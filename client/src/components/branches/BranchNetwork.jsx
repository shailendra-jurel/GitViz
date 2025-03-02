// src/components/branches/BranchNetwork.jsx
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  useTheme
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CallSplit as BranchIcon,
  Commit as CommitIcon,
  MergeType as MergeIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';
import repositoryService from '../../services/repositoryService';

// Import visualization libraries for the network graph
import * as d3 from 'd3';

const BranchNetwork = ({ repository, branches }) => {
  const theme = useTheme();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [highlightDefault, setHighlightDefault] = useState(true);
  
  const colors = {
    branch: theme.palette.primary.main,
    commit: theme.palette.secondary.main,
    defaultBranch: theme.palette.success.main,
    merge: theme.palette.error.main,
    link: theme.palette.divider,
    text: theme.palette.text.primary,
    background: theme.palette.background.paper
  };
  
  // Fetch repository network data
  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!repository) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const data = await repositoryService.getRepositoryNetwork(
          token,
          repository.owner.login, 
          repository.name
        );
        
        setGraphData(data);
      } catch (err) {
        console.error('Error fetching network data:', err);
        setError('Failed to load repository network data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetworkData();
  }, [repository]);
  
  // Create visualization when data is available
  useEffect(() => {
    if (!graphData || !svgRef.current || loading) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create the network visualization
    createNetworkGraph();
  }, [graphData, loading, zoom, showLabels, highlightDefault, theme.palette.mode]);
  
  // Function to create the network graph visualization
  const createNetworkGraph = () => {
    if (!graphData || !graphData.graph) {
      return;
    }
    
    // Filter and prepare data
    const { nodes, edges } = graphData.graph;
    
    // If we don't have any nodes or edges, show a message
    if (!nodes || !edges || nodes.length === 0) {
      return;
    }
    
    const width = containerRef.current.clientWidth;
    const height = 600;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
    
    // Create a group for the zoomed content
    const g = svg.append('g')
      .attr('transform', `scale(${zoom})`);
    
    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(70))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2 / zoom, height / 2 / zoom))
      .force('x', d3.forceX())
      .force('y', d3.forceY());
    
    // Create links
    const link = g.append('g')
      .attr('stroke', colors.link)
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke-width', d => d.type === 'merge' ? 2 : 1)
      .attr('stroke-dasharray', d => d.type === 'merge' ? '5,5' : null)
      .attr('stroke', d => d.type === 'merge' ? colors.merge : colors.link);
    
    // Create nodes
    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(drag(simulation));
    
    // Node circles
    node.append('circle')
      .attr('r', d => d.type === 'branch' ? 7 : 5)
      .attr('fill', d => {
        if (d.type === 'branch') {
          if (highlightDefault && d.data && d.data.name === repository.defaultBranch) {
            return colors.defaultBranch;
          }
          return colors.branch;
        }
        return colors.commit;
      })
      .attr('stroke', colors.background)
      .attr('stroke-width', 1.5);
    
    // Node labels
    if (showLabels) {
      node.append('text')
        .attr('dx', 10)
        .attr('dy', 3)
        .text(d => {
          if (d.type === 'branch') {
            return d.data.name;
          } else if (d.type === 'commit') {
            return d.data.message ? d.data.message.split('\n')[0].substring(0, 20) + (d.data.message.length > 20 ? '...' : '') : d.id.substring(0, 7);
          }
          return '';
        })
        .attr('fill', colors.text)
        .attr('font-size', 10)
        .each(function(d) {
          const text = d3.select(this);
          if (d.type === 'commit' && (!d.data.message || d.data.message.length === 0)) {
            text.remove();
          }
        });
    }
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
        
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 90})`);
    
    // Background for legend
    legend.append('rect')
      .attr('width', 150)
      .attr('height', 80)
      .attr('fill', colors.background)
      .attr('stroke', colors.link)
      .attr('stroke-width', 1)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('opacity', 0.9);
    
    // Legend items
    const legendItems = [
      { type: 'branch', label: 'Branch', color: colors.branch },
      { type: 'defaultBranch', label: 'Default Branch', color: colors.defaultBranch },
      { type: 'commit', label: 'Commit', color: colors.commit },
      { type: 'merge', label: 'Merge', color: colors.merge }
    ];
    
    legendItems.forEach((item, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(10, ${i * 20 + 10})`);
      
      if (item.type === 'merge') {
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 5)
          .attr('x2', 20)
          .attr('y2', 5)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5');
      } else {
        g.append('circle')
          .attr('r', item.type === 'branch' || item.type === 'defaultBranch' ? 6 : 4)
          .attr('cx', 6)
          .attr('cy', 6)
          .attr('fill', item.color);
      }
      
      g.append('text')
        .attr('x', 25)
        .attr('y', 10)
        .text(item.label)
        .attr('fill', colors.text)
        .attr('font-size', 12);
    });
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2.5));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const data = await repositoryService.getRepositoryNetwork(
        token,
        repository.owner.login, 
        repository.name
      );
      
      setGraphData(data);
    } catch (err) {
      console.error('Error refreshing network data:', err);
      setError('Failed to refresh repository network data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Paper elevation={0} variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1">Network Visualization</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Tooltip title="Zoom out">
              <IconButton onClick={handleZoomOut} size="small" disabled={zoom <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            
            <Slider
              value={zoom}
              min={0.5}
              max={2.5}
              step={0.1}
              onChange={handleZoomChange}
              aria-label="Zoom"
              sx={{ width: 100, mx: 2 }}
            />
            
            <Tooltip title="Zoom in">
              <IconButton onClick={handleZoomIn} size="small" disabled={zoom >= 2.5}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider orientation="vertical" flexItem />
          
          <FormControlLabel
            control={<Switch checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />}
            label="Show Labels"
          />
          
          <FormControlLabel
            control={<Switch checked={highlightDefault} onChange={(e) => setHighlightDefault(e.target.checked)} />}
            label="Highlight Default"
          />
          
          <Tooltip title="Refresh network data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
      
      <Box ref={containerRef} sx={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !graphData || !graphData.graph || !graphData.graph.nodes || graphData.graph.nodes.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No network data available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This could be because the repository is empty or there's not enough data to visualize.
            </Typography>
            <Button
              variant="outlined"
              href={`${repository.htmlUrl}/network`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
            >
              View on GitHub
            </Button>
          </Box>
        ) : (
          <svg ref={svgRef} width="100%" height="600"></svg>
        )}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Tips: Drag nodes to reposition them. Use the zoom controls to adjust the view.
        </Typography>
      </Box>
    </Box>
  );
};

BranchNetwork.propTypes = {
  repository: PropTypes.object.isRequired,
  branches: PropTypes.array.isRequired
};

export default BranchNetwork;