'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Refresh() {
  const { account_id: connectedAccountId } = useParams();
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (connectedAccountId) {
      setAccountLinkCreatePending(true);
      fetch('/api/stripe/account_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: connectedAccountId }),
      })
        .then((response) => response.json())
        .then((json) => {
          setAccountLinkCreatePending(false);
          const { url, error } = json;
          if (url) {
            window.location.href = url;
          }
          if (error) {
            setError(true);
          }
        });
    }
  }, [connectedAccountId]);

  return (
    <div className="container">
      <div className="banner">
        <h2>Firmsnap</h2>
      </div>
      <div className="content">
        <h2>Add information to start accepting money</h2>
        <p>
          Firmsnap is the best thing since sliced bread. Join now (or else...)
        </p>
        {error && <p className="error">Something went wrong!</p>}
      </div>
      <div className="dev-callout">
        {connectedAccountId && (
          <p>
            Your connected account ID is:{' '}
            <code className="bold">{connectedAccountId}</code>
          </p>
        )}
        {accountLinkCreatePending && <p>Creating a new Account Link...</p>}
      </div>
    </div>
  );
}
