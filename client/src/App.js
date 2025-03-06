import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudyGroups from './pages/StudyGroups';
import StudySession from './pages/StudySession';
import StudyUniverse from './pages/StudyUniverse';
import HowToStudy from './pages/HowToStudy';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <StudyGroups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/session/:id"
                element={
                  <PrivateRoute>
                    <StudySession />
                  </PrivateRoute>
                }
              />
              <Route
                path="/universe"
                element={
                  <PrivateRoute>
                    <StudyUniverse />
                  </PrivateRoute>
                }
              />
              <Route path="/how-to-study" element={<HowToStudy />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App; 