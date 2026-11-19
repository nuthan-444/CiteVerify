import React from 'react';
import { Layout } from '../components/layout/Layout';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <LoginForm />
      </div>
    </Layout>
  );
};
