// frontend/src/components/interviews/InterviewList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const InterviewList = () => {
  const { templateId } = useParams();
  const { authToken } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInterviewLink, setNewInterviewLink] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch template details
        const templateResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/templates/${templateId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setTemplate(templateResponse.data);

        // Fetch interviews for this template
        const interviewsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/interviews/template/${templateId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setInterviews(interviewsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [templateId, authToken]);

  const handleCreateInterview = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/interviews`,
        { templateId, participant: { name: '', email: '' } },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setNewInterviewLink(response.data.joinLink);
      setShowCreateModal(true);

      // Refresh the interview list
      const interviewsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/interviews/template/${templateId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setInterviews(interviewsResponse.data);
    } catch (err) {
      setError('Failed to create new interview');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(newInterviewLink);
    alert('Interview link copied to clipboard!');
  };

  if (loading) {
    return <div className="text-center mt-8">Loading interviews...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded m-6">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{template?.title} Interviews</h1>
          <p className="text-gray-600">Product: {template?.product}</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to={`/templates/${templateId}`}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Edit Template
          </Link>
          <button
            onClick={handleCreateInterview}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Interview
          </button>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Participant
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Duration
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No interviews yet. Create one to get started.
                </td>
              </tr>
            ) : (
              interviews.map((interview) => (
                <tr key={interview._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {interview.participant?.name || 'Unnamed'}
                    </div>
                    <div className="text-sm text-gray-500">{interview.participant?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        interview.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : interview.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interview.startTime
                      ? new Date(interview.startTime).toLocaleDateString()
                      : new Date(interview.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interview.startTime && interview.endTime
                      ? `${Math.round(
                          (new Date(interview.endTime) - new Date(interview.startTime)) / (1000 * 60)
                        )} min`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {interview.status === 'completed' ? (
                      <Link
                        to={`/interviews/${interview._id}/analysis`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Analysis
                      </Link>
                    ) : interview.status === 'in-progress' ? (
                      <Link
                        to={`/interviews/${interview._id}/observe`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Observe
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${process.env.REACT_APP_FRONTEND_URL}/interviews/join/${interview._id}`
                          );
                          alert('Interview link copied to clipboard!');
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Copy Link
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Interview Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Interview Created</h2>
            <p className="mb-4">Share this link with the participant to start the interview:</p>
            <div className="flex mb-4">
              <input
                type="text"
                value={newInterviewLink}
                readOnly
                className="flex-1 p-2 border rounded-l text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewList;