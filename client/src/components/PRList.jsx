import React from 'react';
import { useSelector } from 'react-redux';
import { List, Tag } from 'antd';

const PRList = () => {
  const prs = useSelector((state) => state.repos.prs);

  return (
    <div className="w-3/4 p-4">
      <h2 className="text-lg font-semibold mb-4">Pull Requests</h2>
      <List
        dataSource={prs}
        renderItem={(pr) => (
          <List.Item>
            <div>
              <p>{pr.title}</p>
              <Tag color={pr.state === 'open' ? 'green' : 'red'}>
                {pr.state}
              </Tag>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PRList;