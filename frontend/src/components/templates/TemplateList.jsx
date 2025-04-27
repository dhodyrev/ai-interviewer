// frontend/src/components/templates/TemplateList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setTemplates(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch templates');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [authToken]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setTemplates(templates.filter(template => template._id !== id));
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading templates...</div>;
  
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interview Templates</h1>
        <Link 
          to="/templates/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-gray-600">You haven't created any templates yet.</p>
          <Link 
            to="/templates/new"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div 
              key={template._id} 
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
              <p className="text-sm text-gray-500 mb-3">Product: {template.product}</p>
              <p className="text-sm text-gray-500 mb-4">
                {template.questions.length} questions
              </p>
              <div className="flex justify-between mt-4">
                <Link 
                  to={`/templates/${template._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </Link>
                <div className="space-x-2">
                  <Link 
                    to={`/templates/edit/${template._id}`}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;