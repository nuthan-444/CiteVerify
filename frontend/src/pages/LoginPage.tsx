import React from 'react';
import { Layout } from '../components/layout/Layout';
import { LoginForm } from '../components/auth/LoginForm';
import { usePageEntrance } from '../hooks/usePageEntrance';

export const LoginPage: React.FC = () => {
  const pageRef = usePageEntrance();

  return (
    <Layout>
      <div ref={pageRef} className="py-12 flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
        <div data-animate className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};
