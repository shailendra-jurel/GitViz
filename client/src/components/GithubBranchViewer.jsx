import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  GithubIcon, 
  GitBranch, 
  GitPullRequest, 
  Check, 
  Search,
  Calendar,
  User,
  GitCommit,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  Filter,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

import {
  getRepositories,
  getBranches,
  getPullRequests,
  selectRepo,
  unselectRepo
} from '../store/slices/githubSlice';

// Custom Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

// Custom Accordion Components
const Accordion = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

const AccordionItem = ({ children, isOpen, onToggle, title, icon }) => (
  <div className="border rounded-lg overflow-hidden">
    <button
      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </button>
    {isOpen && (
      <div className="p-4 bg-white">{children}</div>
    )}
  </div>
);

// Custom Dropdown Component
const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
          {children}
        </div>
      )}
    </div>
  );
};

const GithubBranchViewer = () => {
  const dispatch = useDispatch();
  const {
    repositories,
    selectedRepos,
    branches,
    pullRequests,
    loading,
    error
  } = useSelector((state) => state.github);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPRs, setExpandedPRs] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getRepositories());
  }, [dispatch]);

  useEffect(() => {
    selectedRepos.forEach(repo => {
      const [owner, name] = repo.full_name.split('/');
      dispatch(getBranches({ owner, repo: name }));
      dispatch(getPullRequests({ owner, repo: name }));
    });
  }, [selectedRepos, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all(selectedRepos.map(repo => {
        const [owner, name] = repo.full_name.split('/');
        return Promise.all([
          dispatch(getBranches({ owner, repo: name })),
          dispatch(getPullRequests({ owner, repo: name }))
        ]);
      }));
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSection = (repoId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${repoId}-${section}`]: !prev[`${repoId}-${section}`]
    }));
  };

  const handleRepoSelect = (repo) => {
    if (selectedRepos.find(r => r.id === repo.id)) {
      dispatch(unselectRepo(repo));
    } else {
      dispatch(selectRepo(repo));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyles = (state) => {
    const styles = {
      open: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-purple-100 text-purple-800 border-purple-200',
      merged: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[state] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterPRs = (prs) => {
    let filtered = [...prs];
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pr => pr.state === filterStatus);
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'most-comments':
        filtered.sort((a, b) => b.comments - a.comments);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => dispatch(getRepositories())}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-4">
            <GithubIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Repositories</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRepos.find(r => r.id === repo.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleRepoSelect(repo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{repo.name}</span>
                  <span className="text-sm text-gray-500">{repo.owner.login}</span>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1" />
                    {repo.stargazers_count}
                  </div>
                </div>
                {selectedRepos.find(r => r.id === repo.id) && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Repository Overview</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-md hover:bg-gray-100 ${refreshing ? 'animate-spin' : ''}`}
              disabled={refreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Dropdown
              trigger={
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              }
            >
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'all' ? 'bg-blue-50' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'open' ? 'bg-blue-50' : ''}`}
                onClick={() => setFilterStatus('open')}
              >
                Open
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterStatus === 'closed' ? 'bg-blue-50' : ''}`}
                onClick={() => setFilterStatus('closed')}
              >
                Closed
              </button>
            </Dropdown>
          </div>
        </div>

        <div className="grid gap-6">
          {selectedRepos.map(repo => {
            const repoBranches = branches[repo.name] || [];
            const repoPRs = filterPRs(pullRequests[repo.name] || []);
            
            return (
              <Card key={repo.id}>
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-5 h-5" />
                      <span className="font-semibold">{repo.full_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {repoBranches.length} branches • {repoPRs.length} PRs
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Accordion>
                    <AccordionItem
                      title="Branches"
                      icon={<GitBranch className="w-5 h-5" />}
                      isOpen={expandedSections[`${repo.id}-branches`]}
                      onToggle={() => toggleSection(repo.id, 'branches')}
                    >
                      <div className="grid gap-3">
                        {repoBranches.map(branch => (
                          <div
                            key={branch.name}
                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <GitBranch className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{branch.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <GitCommit className="w-4 h-4" />
                                <span>{branch.commit.sha.substring(0, 7)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionItem>

                    <AccordionItem
                      title="Pull Requests"
                      icon={<GitPullRequest className="w-5 h-5" />}
                      isOpen={expandedSections[`${repo.id}-prs`]}
                      onToggle={() => toggleSection(repo.id, 'prs')}
                    >
                      <div className="space-y-4">
                        {repoPRs.map(pr => (
                          <div
                            key={pr.id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <button
                              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                              onClick={() => togglePRExpand(repo.id, pr.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`px-2 py-1 rounded-md text-sm ${getStatusStyles(pr.state)}`}>
                                    {pr.state}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{pr.title}</h4>
                                    <div className="text-sm text-gray-500 mt-1">
                                      #{pr.number} by {pr.user.login}
                                    </div>
                                  </div>
                                  </div>
                                {expandedPRs[`${repo.id}-${pr.id}`] ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </div>
                            </button>
                            
                            {expandedPRs[`${repo.id}-${pr.id}`] && (
                              <div className="p-4 bg-gray-50 border-t">
                                <div className="space-y-4">
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Created: {formatDate(pr.created_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4" />
                                      <span>Author: {pr.user.login}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MessageSquare className="w-4 h-4" />
                                      <span>Comments: {pr.comments}</span>
                                    </div>
                                    {pr.merged_at && (
                                      <div className="flex items-center space-x-2">
                                        <GitPullRequest className="w-4 h-4 text-purple-500" />
                                        <span>Merged: {formatDate(pr.merged_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="prose max-w-none text-sm text-gray-700">
                                    {pr.body ? (
                                      <p>{pr.body}</p>
                                    ) : (
                                      <p className="italic text-gray-500">No description provided</p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center space-x-1">
                                      <ThumbsUp className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">{pr.reactions?.total_count || 0}</span>
                                    </div>
                                    
                                    <a 
                                      href={pr.html_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      <span>View on GitHub</span>
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>

                                  {pr.labels?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {pr.labels.map(label => (
                                        <span
                                          key={label.id}
                                          className="px-2 py-1 text-xs rounded-full"
                                          style={{
                                            backgroundColor: `#${label.color}20`,
                                            color: `#${label.color}`,
                                            border: `1px solid #${label.color}40`
                                          }}
                                        >
                                          {label.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {repoPRs.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pull requests found</p>
                          </div>
                        )}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>
            );
          })}

          {selectedRepos.length === 0 && (
            <div className="text-center py-12">
              <GithubIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No repositories selected</h3>
              <p className="text-gray-500">Select repositories from the sidebar to view their details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GithubBranchViewer;