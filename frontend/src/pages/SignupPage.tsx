import React from 'react';
import { Layout } from '../components/layout/Layout';
import { SignupForm } from '../components/auth/SignupForm';
import { usePageEntrance } from '../hooks/usePageEntrance';

export const SignupPage: React.FC = () => {
  const pageRef = usePageEntrance();

  return (
    <Layout>
      <div ref={pageRef} className="py-12 flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
        <div data-animate className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
};
