import React from 'react';

export default function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-icon">{icon}</div> : null}
      <h3 className="empty-title">{title}</h3>
      {hint ? <p className="empty-hint muted">{hint}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
