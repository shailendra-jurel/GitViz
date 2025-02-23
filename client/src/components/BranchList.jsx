import React from 'react';
import { useSelector } from 'react-redux';

const BranchList = () => {
  const branches = useSelector((state) => state.repos.branches);

  return (
    <div className="w-3/4 p-4">
      <h2 className="text-lg font-semibold mb-4">Branches</h2>
      <ul>
        {branches.map((branch) => (
          <li key={branch.name} className="mb-2">
            {branch.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BranchList;