// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { currentUser, authToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageDuration: 0,
    sentimentCounts: { positive: 0, neutral: 0, negative: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch templates
        const templatesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/templates`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setTemplates(templatesResponse.data.slice(0, 5)); // Only get the 5 most recent
        
        // We'd normally fetch aggregated stats from an endpoint
        // For now, let's simulate that with mock data
        
        // In a real implementation, you'd have a dedicated endpoint:
        // const statsResponse = await axios.get(
        //   `${process.env.REACT_APP_API_URL}/api/stats/dashboard`,
        //   { headers: { Authorization: `Bearer ${authToken}` } }
        // );
        // setStats(statsResponse.data);
        
        // Mock stats for demonstration
        setStats({
          totalTemplates: templatesResponse.data.length,
          totalInterviews: 28,
          completedInterviews: 22,
          averageDuration: 18, // minutes
          sentimentCounts: { positive: 15, neutral: 5, negative: 2 }
        });
        
        // Mock recent interviews
        setRecentInterviews([
          {
            _id: '1',
            template: { title: 'Mobile App Usability', _id: templatesResponse.data[0]?._id },
            participant: { name: 'Alex Johnson' },
            status: 'completed',
            startTime: new Date(Date.now() - 86400000),
            endTime: new Date(Date.now() - 86400000 + 1200000)
          },
          {
            _id: '2',
            template: { title: 'Website Checkout Flow', _id: templatesResponse.data[0]?._id },
            participant: { name: 'Maria Garcia' },
            status: 'completed',
            startTime: new Date(Date.now() - 172800000),
            endTime: new Date(Date.now() - 172800000 + 1500000)
          },
          {
            _id: '3',
            template: { title: 'Onboarding Process', _id: templatesResponse.data[0]?._id },
            participant: { name: 'Jamal Wilson' },
            status: 'in-progress',
            startTime: new Date(),
            endTime: null
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken]);

  // Format data for sentiment chart
  const sentimentData = [
    { name: 'Positive', value: stats.sentimentCounts.positive },
    { name: 'Neutral', value: stats.sentimentCounts.neutral },
    { name: 'Negative', value: stats.sentimentCounts.negative }
  ];

  if (loading) {
    return <div className="text-center mt-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded m-6">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {currentUser.name}</h1>
        <Link
          to="/templates/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Template
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Interview Templates</h3>
          <p className="text-3xl font-bold">{stats.totalTemplates}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Interviews</h3>
          <p className="text-3xl font-bold">{stats.totalInterviews}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Completion Rate</h3>
          <p className="text-3xl font-bold">
            {stats.totalInterviews > 0
              ? `${Math.round((stats.completedInterviews / stats.totalInterviews) * 100)}%`
              : '0%'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Avg. Duration</h3>
          <p className="text-3xl font-bold">{stats.averageDuration} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sentiment Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill={(entry) => {
                    if (entry.name === 'Positive') return '#10B981';
                    if (entry.name === 'Neutral') return '#F59E0B';
                    return '#EF4444';
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Templates */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Templates</h2>
            <Link to="/templates" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          
          {templates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No templates yet. Create your first one!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {templates.map((template) => (
                <li key={template._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{template.title}</h3>
                      <p className="text-sm text-gray-500">Product: {template.product}</p>
                    </div>
                    <Link
                      to={`/templates/${template._id}/interviews`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Interviews
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
        
        {recentInterviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No interviews yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInterviews.map((interview) => (
                  <tr key={interview._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {interview.template.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interview.participant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                        interview.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interview.startTime.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interview.status === 'completed' && interview.startTime && interview.endTime
                        ? `${Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / (1000 * 60))} min`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {interview.status === 'completed' ? (
                        <Link to={`/interviews/${interview._id}/analysis`} className="text-blue-600 hover:text-blue-900">
                          View Analysis
                        </Link>
                      ) : (
                        <Link to={`/templates/${interview.template._id}/interviews`} className="text-indigo-600 hover:text-indigo-900">
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;