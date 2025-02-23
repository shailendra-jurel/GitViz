import { configureStore } from '@reduxjs/toolkit';
import repoReducer from './slices/repoSlice';
import githubReducer from './slices/githubSlice';

export const store = configureStore({
  reducer: {
    // repos: repoReducer,
    github: githubReducer,
  },
});