import React from 'react';
import { Layout } from '../components/layout/Layout';
import { SignupForm } from '../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <SignupForm />
      </div>
    </Layout>
  );
};
