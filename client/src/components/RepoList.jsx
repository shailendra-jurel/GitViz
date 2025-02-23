import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRepo, setBranches, setPRs } from '../store/slices/repoSlice';
import { List } from 'antd';
import { setRepos } from '../store/slices/repoSlice';

const RepoList = () => {
  const dispatch = useDispatch();
  const repos = useSelector((state) => state.repos.repos);

  useEffect(() => {
    // Mock data for repositories
    const mockRepos = [
      { id: 1, name: 'repo-1' },
      { id: 2, name: 'repo-2' },
    ];
    dispatch(setRepos(mockRepos));
  }, [dispatch]);

  const handleRepoClick = (repo) => {
    dispatch(setSelectedRepo(repo));
    // Mock data for branches and PRs
    const mockBranches = [
      { name: 'main' },
      { name: 'develop' },
    ];
    const mockPRs = [
      { id: 1, title: 'PR 1', state: 'open' },
      { id: 2, title: 'PR 2', state: 'closed' },
    ];
    dispatch(setBranches(mockBranches));
    dispatch(setPRs(mockPRs));
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Repositories</h2>
      <List
        dataSource={repos}
        renderItem={(repo) => (
          <List.Item
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => handleRepoClick(repo)}
          >
            {repo.name}
          </List.Item>
        )}
      />
    </div>
  );
};

export default RepoList;