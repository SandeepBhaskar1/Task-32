import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const BACKEND_URL= import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/read`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedData(response.data.data);
    } catch (error) {
      setError('Failed to fetch data');
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/save`,
        { data },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Data saved successfully');
      fetchData();
    } catch (error) {
      setError('Failed to save data');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
      )}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Save Data</label>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows="4"
        />
        <button
          onClick={handleSave}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Saved Data</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {savedData ? JSON.stringify(savedData, null, 2) : 'No data saved'}
        </pre>
      </div>
    </div>
  );
};

export default Dashboard;