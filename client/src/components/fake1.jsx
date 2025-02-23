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
  ChevronUp
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  getRepositories,
  getBranches,
  getPullRequests,
  selectRepo,
  unselectRepo
} from '../store/slices/githubSlice';

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

  const handleRepoSelect = (repo) => {
    if (selectedRepos.find(r => r.id === repo.id)) {
      dispatch(unselectRepo(repo));
    } else {
      dispatch(selectRepo(repo));
    }
  };

  const togglePRExpand = (repoId, prId) => {
    setExpandedPRs(prev => ({
      ...prev,
      [`${repoId}-${prId}`]: !prev[`${repoId}-${prId}`]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPRStatusColor = (state) => {
    return state === 'open' ? 'text-green-500' : 'text-purple-500';
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <GithubIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Repositories</h2>
          </div>
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedRepos.find(r => r.id === repo.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleRepoSelect(repo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{repo.name}</span>
                  <span className="text-sm text-gray-500">{repo.owner.login}</span>
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
        <h1 className="text-2xl font-bold mb-6">Repository Overview</h1>
        <div className="grid grid-cols-1 gap-6">
          {selectedRepos.map(repo => {
            const repoBranches = branches[repo.name] || [];
            const repoPRs = pullRequests[repo.name] || [];
            
            return (
              <Card key={repo.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-5 h-5" />
                      <span>{repo.full_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {repoBranches.length} branches • {repoPRs.length} PRs
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="space-y-4">
                    {/* Branches Section */}
                    <AccordionItem value="branches">
                      <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="w-5 h-5" />
                          <span>Branches</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3 mt-3">
                          {repoBranches.map(branch => (
                            <div
                              key={branch.name}
                              className="p-3 border rounded-lg hover:bg-gray-50"
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
                      </AccordionContent>
                    </AccordionItem>

                    {/* Pull Requests Section */}
                    <AccordionItem value="pulls">
                      <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center space-x-2">
                          <GitPullRequest className="w-5 h-5" />
                          <span>Pull Requests</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3 mt-3">
                          {repoPRs.map(pr => (
                            <div
                              key={pr.id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => togglePRExpand(repo.id, pr.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <GitPullRequest className={`w-5 h-5 ${getPRStatusColor(pr.state)}`} />
                                    <div>
                                      <h4 className="font-medium">{pr.title}</h4>
                                      <div className="text-sm text-gray-500 mt-1">
                                        #{pr.number} opened by {pr.user.login}
                                      </div>
                                    </div>
                                  </div>
                                  {expandedPRs[`${repo.id}-${pr.id}`] ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </div>
                              </div>
                              
                              {expandedPRs[`${repo.id}-${pr.id}`] && (
                                <div className="px-4 pb-4 bg-gray-50">
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Created: {formatDate(pr.created_at)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <User className="w-4 h-4" />
                                        <span>Author: {pr.user.login}</span>
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      <p className="text-gray-700">{pr.body}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="font-medium">Status:</span>
                                      <span className={`capitalize ${getPRStatusColor(pr.state)}`}>
                                        {pr.state}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GithubBranchViewer;