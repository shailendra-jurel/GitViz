import React from 'react';
import BranchList from '../components/BranchList';
import PRList from '../components/PRList';
import RepoList from '../components/RepoList';

const Home = () => {
  return (
    <div className="flex h-screen">
      <RepoList />
      <div className="flex-1 flex flex-col">
        <BranchList />
        <PRList />
      </div>
    </div>
  );
};

export default Home;