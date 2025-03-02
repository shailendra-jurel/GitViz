// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import repositoryReducer from './repositorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repository: repositoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling non-serializable values like Date objects
    }),
});

export default store;