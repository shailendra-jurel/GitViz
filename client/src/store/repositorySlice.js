// src/store/repositorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import repositoryService from '../services/repositoryService';

export const fetchRepositories = createAsyncThunk(
  'repository/fetchRepositories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const repositories = await repositoryService.getRepositories(token);
      return repositories;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRepositoryDetails = createAsyncThunk(
  'repository/fetchRepositoryDetails',
  async ({ owner, repo }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const repository = await repositoryService.getRepositoryDetails(token, owner, repo);
      return repository;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBranches = createAsyncThunk(
  'repository/fetchBranches',
  async ({ owner, repo }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const branches = await repositoryService.getBranches(token, owner, repo);
      return { owner, repo, branches };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPullRequests = createAsyncThunk(
  'repository/fetchPullRequests',
  async ({ owner, repo }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const pullRequests = await repositoryService.getPullRequests(token, owner, repo);
      return { owner, repo, pullRequests };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveFavoriteRepositories = createAsyncThunk(
  'repository/saveFavoriteRepositories',
  async (repositories, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await repositoryService.saveFavoriteRepositories(token, repositories);
      return repositories;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  repositories: [],
  selectedRepositories: [],
  currentRepository: null,
  branches: {},
  pullRequests: {},
  loading: false,
  error: null,
};

const repositorySlice = createSlice({
  name: 'repository',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectRepository: (state, action) => {
      const repo = action.payload;
      const isAlreadySelected = state.selectedRepositories.some(r => r.id === repo.id);
      
      if (!isAlreadySelected) {
        state.selectedRepositories.push(repo);
      }
      
      state.currentRepository = repo;
    },
    deselectRepository: (state, action) => {
      const repoId = action.payload;
      state.selectedRepositories = state.selectedRepositories.filter(r => r.id !== repoId);
      
      // If the current repository is being deselected, set the current to first in the list or null
      if (state.currentRepository && state.currentRepository.id === repoId) {
        state.currentRepository = state.selectedRepositories.length > 0 ? state.selectedRepositories[0] : null;
      }
    },
    setCurrentRepository: (state, action) => {
      state.currentRepository = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRepositories
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload.repositories;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repositories';
      })
      
      // fetchRepositoryDetails
      .addCase(fetchRepositoryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRepository = action.payload;
      })
      .addCase(fetchRepositoryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repository details';
      })
      
      // fetchBranches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        const { owner, repo, branches } = action.payload;
        state.branches[`${owner}/${repo}`] = branches;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch branches';
      })
      
      // fetchPullRequests
      .addCase(fetchPullRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPullRequests.fulfilled, (state, action) => {
        state.loading = false;
        const { owner, repo, pullRequests } = action.payload;
        state.pullRequests[`${owner}/${repo}`] = pullRequests;
      })
      .addCase(fetchPullRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pull requests';
      })
      
      // saveFavoriteRepositories
      .addCase(saveFavoriteRepositories.fulfilled, (state, action) => {
        // Set the selected repositories to the ones saved as favorites
        state.selectedRepositories = action.payload;
      });
  },
});

export const { 
  clearError,
  selectRepository,
  deselectRepository,
  setCurrentRepository,
} = repositorySlice.actions;

export default repositorySlice.reducer;