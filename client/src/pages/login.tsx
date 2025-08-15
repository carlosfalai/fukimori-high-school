import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700 mb-2">Fukimori High</h1>
          <p className="text-gray-600">Login to continue your adventure</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2 border-2"
            onClick={() => window.location.href = '/auth/google'}
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register">
                <a className="text-pink-600 hover:text-pink-800 font-medium">
                  Register
                </a>
              </Link>
            </p>
          </div>
          
          <div className="text-center mt-2">
            <Link href="/">
              <a className="text-sm text-gray-500 hover:text-gray-700">
                Return Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}