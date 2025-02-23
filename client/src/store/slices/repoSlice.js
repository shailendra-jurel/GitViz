import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  repos: [],
  selectedRepo: null,
  branches: [],
  prs: [],
};

const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {
    setRepos: (state, action) => {
      state.repos = action.payload;
    },
    setSelectedRepo: (state, action) => {
      state.selectedRepo = action.payload;
    },
    setBranches: (state, action) => {
      state.branches = action.payload;
    },
    setPRs: (state, action) => {
      state.prs = action.payload;
    },
  },
});

export const { setRepos, setSelectedRepo, setBranches, setPRs } = repoSlice.actions;

export default repoSlice.reducer;