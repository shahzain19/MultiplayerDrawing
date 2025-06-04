import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const credential = credentialResponse.credential;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (error) {
      console.error('Supabase login error:', error);
    } else {
      console.log('Signed in:', data.user);
      navigate('/onboarding'); // Redirect to onboarding page after successful login
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => console.error('Login Failed')}
      />
    </div>
  );
};

export default Login;
