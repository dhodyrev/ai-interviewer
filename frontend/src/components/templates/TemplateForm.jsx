// frontend/src/components/templates/TemplateForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const questionTypes = ['open', 'scale', 'multiple-choice'];

const initialValues = {
  title: '',
  description: '',
  product: '',
  goals: [''],
  questions: [{ text: '', type: 'open', options: [], followUpStrategy: '', order: 0 }],
  systemPrompt: 'You are an AI interviewer conducting a user research interview. Ask questions to understand the user\'s experience with the product. Follow up on interesting points. Be conversational and empathetic.'
};

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  product: Yup.string().required('Product name is required'),
  goals: Yup.array().of(Yup.string().required('Goal is required')).min(1, 'At least one goal is required'),
  questions: Yup.array().of(
    Yup.object({
      text: Yup.string().required('Question text is required'),
      type: Yup.string().oneOf(questionTypes).required('Question type is required'),
      options: Yup.array().when('type', {
        is: 'multiple-choice',
        then: Yup.array().of(Yup.string().required('Option is required')).min(2, 'At least two options are required'),
        otherwise: Yup.array()
      }),
      followUpStrategy: Yup.string(),
      order: Yup.number()
    })
  ).min(1, 'At least one question is required'),
  systemPrompt: Yup.string().required('System prompt is required')
});

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [initialFormValues, setInitialFormValues] = useState(initialValues);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState('');
  const isEditMode = !!id;

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setInitialFormValues(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, authToken]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Add order numbers to questions if not already present
      const formattedValues = {
        ...values,
        questions: values.questions.map((q, idx) => ({
          ...q,
          order: q.order || idx
        }))
      };

      if (isEditMode) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/templates/${id}`,
          formattedValues,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/templates`,
          formattedValues,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      navigate('/templates');
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading template...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Interview Template' : 'Create Interview Template'}
      </h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <Formik
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Template Title</label>
                <Field
                  type="text"
                  name="title"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Product Usability Interview"
                />
                <ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="w-full p-2 border rounded"
                  placeholder="Brief description of this interview template's purpose"
                  rows="3"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Product Name</label>
                <Field
                  type="text"
                  name="product"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Mobile Banking App"
                />
                <ErrorMessage name="product" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Interview Goals</label>
                <FieldArray name="goals">
                  {({ remove, push }) => (
                    <div className="space-y-2">
                      {values.goals.map((goal, index) => (
                        <div key={index} className="flex gap-2">
                          <Field
                            name={`goals.${index}`}
                            className="flex-1 p-2 border rounded"
                            placeholder="e.g., Understand pain points in the onboarding process"
                          />
                          {values.goals.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Add Goal
                      </button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="goals" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Interview Questions</label>
                <FieldArray name="questions">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.questions.map((question, index) => (
                        <div key={index} className="p-4 border rounded bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Question {index + 1}</h3>
                            {values.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-1 text-sm">Question Text</label>
                              <Field
                                as="textarea"
                                name={`questions.${index}.text`}
                                className="w-full p-2 border rounded"
                                placeholder="e.g., What challenges do you face when using our product?"
                                rows="2"
                              />
                              <ErrorMessage 
                                name={`questions.${index}.text`} 
                                component="div" 
                                className="text-red-600 text-sm mt-1" 
                              />
                            </div>
                            
                            <div>
                              <label className="block mb-1 text-sm">Question Type</label>
                              <Field
                                as="select"
                                name={`questions.${index}.type`}
                                className="w-full p-2 border rounded"
                              >
                                {questionTypes.map(type => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </Field>
                            </div>
                            
                            {values.questions[index].type === 'multiple-choice' && (
                              <div>
                                <label className="block mb-1 text-sm">Options</label>
                                <FieldArray name={`questions.${index}.options`}>
                                  {({ remove: removeOption, push: pushOption }) => (
                                    <div className="space-y-2">
                                      {values.questions[index].options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex gap-2">
                                          <Field
                                            name={`questions.${index}.options.${optionIndex}`}
                                            className="flex-1 p-2 border rounded"
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeOption(optionIndex)}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => pushOption('')}
                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                      >
                                        Add Option
                                      </button>
                                    </div>
                                  )}
                                </FieldArray>
                                <ErrorMessage 
                                  name={`questions.${index}.options`} 
                                  component="div" 
                                  className="text-red-600 text-sm mt-1" 
                                />
                              </div>
                            )}
                            
                            <div>
                              <label className="block mb-1 text-sm">Follow-up Strategy</label>
                              <Field
                                as="textarea"
                                name={`questions.${index}.followUpStrategy`}
                                className="w-full p-2 border rounded"
                                placeholder="e.g., If user mentions difficulties, probe on specific examples"
                                rows="2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => push({ 
                          text: '', 
                          type: 'open', 
                          options: [], 
                          followUpStrategy: '',
                          order: values.questions.length
                        })}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Add Question
                      </button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="questions" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block mb-1 font-medium">AI System Prompt</label>
                <Field
                  as="textarea"
                  name="systemPrompt"
                  className="w-full p-2 border rounded font-mono text-sm"
                  rows="6"
                />
                <p className="text-sm text-gray-600 mt-1">
                  This prompt guides the AI's behavior during the interview. Customize it to match your interview style.
                </p>
                <ErrorMessage name="systemPrompt" component="div" className="text-red-600 text-sm mt-1" />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/templates')}
                className="px-6 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TemplateForm;