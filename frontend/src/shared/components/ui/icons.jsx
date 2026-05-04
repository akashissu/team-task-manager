import React from 'react';

/** Small inline SVG icons — no external deps */

export function IconLayoutDashboard({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6H4V5Zm0 8h8v9H6a2 2 0 0 1-2-2v-7Zm10-11h6a2 2 0 0 1 2 2v17h-8V2Z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  );
}

export function IconFolders({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8l-1-2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export function IconCheck({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 7 9 18l-5-5 1.41-1.41L9 15.17 18.59 5.59 20 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconAlert({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 2 21h20L12 3Zm0 4 6.73 13H5.27L12 7Zm-1 4h2v6h-2v-6Zm0 8h2v2h-2v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconList({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16v2H4V8Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z"
        fill="currentColor"
        opacity="0.88"
      />
    </svg>
  );
}

export function IconUsers({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-8 4c-3.33 0-6 1.34-6 3v2h20v-2c0-1.66-2.67-3-6-3Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export function IconSpark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2 9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  );
}
