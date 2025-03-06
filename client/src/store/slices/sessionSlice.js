import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const createSession = createAsyncThunk(
  'sessions/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/study-sessions`, sessionData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const joinSession = createAsyncThunk(
  'sessions/joinSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/study-sessions/${sessionId}/join`, {}, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const leaveSession = createAsyncThunk(
  'sessions/leaveSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/study-sessions/${sessionId}/leave`, {}, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addNote = createAsyncThunk(
  'sessions/addNote',
  async ({ sessionId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/study-sessions/${sessionId}/notes`,
        { content },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addFlashcard = createAsyncThunk(
  'sessions/addFlashcard',
  async ({ sessionId, question, answer }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/study-sessions/${sessionId}/flashcards`,
        { question, answer },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateWhiteboard = createAsyncThunk(
  'sessions/updateWhiteboard',
  async ({ sessionId, whiteboard }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/study-sessions/${sessionId}/whiteboard`,
        { whiteboard },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  currentSession: null,
  loading: false,
  error: null
};

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Join Session
      .addCase(joinSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(joinSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Leave Session
      .addCase(leaveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(leaveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Add Note
      .addCase(addNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Add Flashcard
      .addCase(addFlashcard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFlashcard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(addFlashcard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update Whiteboard
      .addCase(updateWhiteboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWhiteboard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(updateWhiteboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  }
});

export const { setCurrentSession, clearError } = sessionSlice.actions;
export default sessionSlice.reducer; 