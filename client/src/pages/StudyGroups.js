import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchGroups,
  createGroup,
  joinGroup,
  leaveGroup
} from '../store/slices/groupSlice';

const MEET_LINK = 'https://meet.google.com/zha-xzau-xop';

const StudyGroups = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    description: '',
    schedule: []
  });
  const [scheduleItem, setScheduleItem] = useState({
    day: '',
    time: '',
    duration: ''
  });
  const dispatch = useDispatch();
  const { groups, loading, error } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const result = await dispatch(createGroup(newGroup));
    if (!result.error) {
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        subject: '',
        description: '',
        schedule: []
      });
    }
  };

  const handleAddScheduleItem = () => {
    if (scheduleItem.day && scheduleItem.time && scheduleItem.duration) {
      setNewGroup(prev => ({
        ...prev,
        schedule: [...prev.schedule, scheduleItem]
      }));
      setScheduleItem({
        day: '',
        time: '',
        duration: ''
      });
    }
  };

  const handleRemoveScheduleItem = (index) => {
    setNewGroup(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleJoinSession = () => {
    window.open(MEET_LINK, '_blank');
  };

  const subjects = [
    'Web Development',
    'Data Structures',
    'Physics',
    'Mathematics',
    'Chemistry',
    'Biology',
    'Competitive Exams'
  ];

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Study Groups
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          Create New Group
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="card">
              <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {group.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Subject: {group.subject}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Members: {group.members.length}
                </span>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleJoinSession}
                  className="btn btn-primary"
                >
                  Join Session
                </button>
                {group.members.includes(group.creator._id) ? (
                  <button
                    onClick={() => dispatch(leaveGroup(group._id))}
                    className="btn btn-secondary"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => dispatch(joinGroup(group._id))}
                    className="btn btn-primary"
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Study Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newGroup.subject}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, subject: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    className="input"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Schedule
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={scheduleItem.day}
                      onChange={(e) =>
                        setScheduleItem({ ...scheduleItem, day: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Day</option>
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={scheduleItem.time}
                      onChange={(e) =>
                        setScheduleItem({ ...scheduleItem, time: e.target.value })
                      }
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="Duration (min)"
                      value={scheduleItem.duration}
                      onChange={(e) =>
                        setScheduleItem({
                          ...scheduleItem,
                          duration: e.target.value
                        })
                      }
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={handleAddScheduleItem}
                      className="btn btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {newGroup.schedule.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
                      >
                        <span>
                          {item.day} at {item.time} ({item.duration} min)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups; 