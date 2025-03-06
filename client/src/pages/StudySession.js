import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  joinSession,
  leaveSession,
  addNote,
  addFlashcard,
  updateWhiteboard
} from '../store/slices/sessionSlice';
import io from 'socket.io-client';

const MEET_LINK = 'https://meet.google.com/zha-xzau-xop';

const StudySession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSession, loading, error } = useSelector((state) => state.sessions);
  const [activeTab, setActiveTab] = useState('timer');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [flashcard, setFlashcard] = useState({ question: '', answer: '' });
  const [whiteboardData, setWhiteboardData] = useState('');
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    dispatch(joinSession(id));
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join-room', id);

    return () => {
      dispatch(leaveSession(id));
      socketRef.current.emit('leave-room', id);
    };
  }, [dispatch, id]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play notification sound
      new Audio('/notification.mp3').play();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const handleAddNote = async () => {
    if (notes.trim()) {
      await dispatch(addNote({ sessionId: id, content: notes }));
      setNotes('');
    }
  };

  const handleAddFlashcard = async () => {
    if (flashcard.question.trim() && flashcard.answer.trim()) {
      await dispatch(addFlashcard({ sessionId: id, ...flashcard }));
      setFlashcard({ question: '', answer: '' });
    }
  };

  const handleWhiteboardChange = (e) => {
    const newData = e.target.value;
    setWhiteboardData(newData);
    socketRef.current.emit('whiteboard-update', { roomId: id, data: newData });
  };

  useEffect(() => {
    socketRef.current.on('whiteboard-update', (data) => {
      setWhiteboardData(data.data);
    });

    return () => {
      socketRef.current.off('whiteboard-update');
    };
  }, [id]);

  const handleJoinMeet = () => {
    window.open(MEET_LINK, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentSession?.title}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={handleJoinMeet}
            className="btn btn-primary"
          >
            Join Meet
          </button>
          <button
            onClick={() => navigate('/groups')}
            className="btn btn-secondary"
          >
            Leave Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('timer')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'timer'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Pomodoro Timer
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'notes'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'flashcards'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab('whiteboard')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'whiteboard'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Whiteboard
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {activeTab === 'timer' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Pomodoro Timer</h2>
              <div className="text-6xl font-bold text-center mb-6">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center space-x-4">
                {!isRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="btn btn-primary"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="btn btn-secondary"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={handleResetTimer}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Shared Notes</h2>
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input h-32"
                  placeholder="Add your notes here..."
                />
                <button
                  onClick={handleAddNote}
                  className="btn btn-primary w-full"
                >
                  Add Note
                </button>
                <div className="space-y-4">
                  {currentSession?.notes.map((note, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {note.createdBy.username} -{' '}
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={flashcard.question}
                  onChange={(e) =>
                    setFlashcard({ ...flashcard, question: e.target.value })
                  }
                  className="input"
                  placeholder="Question"
                />
                <input
                  type="text"
                  value={flashcard.answer}
                  onChange={(e) =>
                    setFlashcard({ ...flashcard, answer: e.target.value })
                  }
                  className="input"
                  placeholder="Answer"
                />
                <button
                  onClick={handleAddFlashcard}
                  className="btn btn-primary w-full"
                >
                  Add Flashcard
                </button>
                <div className="space-y-4">
                  {currentSession?.flashcards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <p className="font-semibold mb-2">{card.question}</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {card.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {activeTab === 'whiteboard' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Collaborative Whiteboard</h2>
              <textarea
                value={whiteboardData}
                onChange={handleWhiteboardChange}
                className="input h-[600px] font-mono"
                placeholder="Start drawing or writing..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudySession; 