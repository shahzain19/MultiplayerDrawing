import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in.');
      setLoading(false);
      return;
    }

    // Upsert user profile (create or update)
    const { error: upsertError } = await supabase.from('users').upsert([
      {
        id: user.id,
        username,
        description,
      },
    ]);

    if (upsertError) {
      console.error(upsertError);
      alert('Error saving user profile.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/'); // redirect to home or another page
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full mb-3 p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <textarea
        placeholder="Short Description"
        className="w-full mb-3 p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
};

export default OnboardingPage;
