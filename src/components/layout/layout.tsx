'use client';
import { ReactNode } from 'react';
import '../layout/layout.css'; // Import the CSS file for styling

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="layout-sidebar">
        <h2>Agent Protocol</h2>
        <ul>
          <li><a href="/">Connect wallet</a></li>
          <li><a href="/upload">Upload Docker Image</a></li>

        </ul>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
