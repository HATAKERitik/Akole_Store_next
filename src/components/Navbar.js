"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { token, role, logoutContext, loaded } = useAuth();
  const router = useRouter();

  if (!loaded) return <nav className="navbar"></nav>; // Or a skeleton

  const handleLogout = () => {
      logoutContext();
      router.push('/login');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">Atharva Store</Link>
      <div className="nav-links">
        {token ? (
          <>
            {role === 'ADMIN' && <Link href="/admin">Admin Controls</Link>}
            <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
