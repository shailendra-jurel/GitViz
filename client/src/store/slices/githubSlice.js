// src/store/githubSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getRepositories = createAsyncThunk(
  'github/getRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/repos', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch repositories');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBranches = createAsyncThunk(
  'github/getBranches',
  async ({ owner, repo }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/repos/${owner}/${repo}/branches`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      return { repo, branches: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPullRequests = createAsyncThunk(
  'github/getPullRequests',
  async ({ owner, repo }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/repos/${owner}/${repo}/pulls`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pull requests');
      const data = await response.json();
      return { repo, pulls: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState: {
    user: null,
    repositories: [],
    selectedRepos: [],
    branches: {},
    pullRequests: {},
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    selectRepo: (state, action) => {
      if (!state.selectedRepos.find(repo => repo.id === action.payload.id)) {
        state.selectedRepos.push(action.payload);
      }
    },
    unselectRepo: (state, action) => {
      state.selectedRepos = state.selectedRepos.filter(
        repo => repo.id !== action.payload.id
      );
    },
    clearSelection: (state) => {
      state.selectedRepos = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRepositories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
        state.error = null;
      })
      .addCase(getRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.branches[action.payload.repo] = action.payload.branches;
      })
      .addCase(getPullRequests.fulfilled, (state, action) => {
        state.pullRequests[action.payload.repo] = action.payload.pulls;
      });
  },
});

export const { setUser, selectRepo, unselectRepo, clearSelection } = githubSlice.actions;
export default githubSlice.reducer;

