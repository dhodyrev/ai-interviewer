// frontend/src/components/analysis/InterviewAnalysisDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InterviewAnalysisDashboard = () => {
  const { id } = useParams();
  const { authToken } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/interviews/${id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setInterview(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load interview data');
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, authToken]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading analysis...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded m-6">{error}</div>;
  }

  if (!interview) {
    return <div className="text-center p-6">Interview not found</div>;
  }

  // Format data for sentiment chart
  const sentimentData = [
    { name: 'Positive', value: interview.insights?.get('sentiment') === 'positive' ? 1 : 0 },
    { name: 'Neutral', value: interview.insights?.get('sentiment') === 'neutral' ? 1 : 0 },
    { name: 'Negative', value: interview.insights?.get('sentiment') === 'negative' ? 1 : 0 }
  ];

  // Helper for getting array data from insights Map
  const getInsightArray = (key) => {
    const data = interview.insights?.get(key);
    return Array.isArray(data) ? data : [];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{interview.template.title} - Analysis</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Participant:</span> {interview.participant.name}
          </div>
          <div>
            <span className="font-medium">Date:</span>{' '}
            {new Date(interview.startTime).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Duration:</span>{' '}
            {interview.endTime && interview.startTime
              ? Math.round(
                  (new Date(interview.endTime) - new Date(interview.startTime)) / (1000 * 60)
                ) + ' minutes'
              : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Overall Sentiment:</span>{' '}
            <span
              className={`font-semibold ${
                interview.insights?.get('sentiment') === 'positive'
                  ? 'text-green-600'
                  : interview.insights?.get('sentiment') === 'negative'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {interview.insights?.get('sentiment')?.toUpperCase() || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['insights', 'pain points', 'suggestions', 'transcript'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'insights' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Main Findings</h3>
              <ul className="list-disc pl-5 space-y-2">
                {getInsightArray('insights').map((insight, index) => (
                  <li key={index} className="text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'pain points' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pain Points</h2>
            <div className="space-y-4">
              {getInsightArray('painPoints').length > 0 ? (
                getInsightArray('painPoints').map((point, index) => (
                  <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r">
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No specific pain points identified.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Feature Suggestions</h2>
            <div className="space-y-4">
              {getInsightArray('suggestions').length > 0 ? (
                getInsightArray('suggestions').map((suggestion, index) => (
                  <div key={index} className="border-l-4 border-green-400 bg-green-50 p-4 rounded-r">
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No specific feature suggestions identified.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Interview Transcript</h2>
            <div className="space-y-6">
              {interview.messages
                .filter(m => m.role !== 'system') // Exclude system prompts
                .map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-3/4 p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-100 rounded-br-none'
                          : 'bg-gray-100 rounded-bl-none'
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {message.role === 'user' ? 'Participant' : 'AI Interviewer'} • 
                        {message.timestamp 
                          ? new Date(message.timestamp).toLocaleTimeString() 
                          : ''}
                      </div>
                      <p className="text-gray-800">{message.content}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewAnalysisDashboard;