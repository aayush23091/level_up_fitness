"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface RequestOption {
  method: 'POST';
  url: string;
  body: string;
}

const REQUESTS: Record<string, RequestOption> = {
  register: {
    method: 'POST',
    url: '/api/auth/register',
    body: JSON.stringify(
      {
        name: "Aayush Sharma",
        email: "aayush@example.com",
        password: "Password123"
      },
      null,
      2
    )
  },
  login: {
    method: 'POST',
    url: '/api/auth/login',
    body: JSON.stringify(
      {
        email: "aayush@example.com",
        password: "Password123"
      },
      null,
      2
    )
  }
};

export default function PostmanTesterPage() {
  const [selectedRoute, setSelectedRoute] = useState<'register' | 'login'>('register');
  const [requestBody, setRequestBody] = useState(REQUESTS.register.body);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteSelection = (route: 'register' | 'login') => {
    setSelectedRoute(route);
    setRequestBody(REQUESTS[route].body);
  };

  const handleSend = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody('');
    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        setResponseStatus(400);
        setResponseBody(JSON.stringify({ error: "Invalid JSON format in Request Body" }, null, 2));
        setIsLoading(false);
        return;
      }

      const res = await axios.post(REQUESTS[selectedRoute].url, parsedBody);
      setResponseStatus(res.status);
      setResponseBody(JSON.stringify(res.data, null, 2));
    } catch (error: any) {
      if (error.response) {
        setResponseStatus(error.response.status);
        setResponseBody(JSON.stringify(error.response.data, null, 2));
      } else {
        setResponseStatus(500);
        setResponseBody(JSON.stringify({ error: error.message || "Connection to API failed. Please ensure the backend is running." }, null, 2));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-accent font-bold text-xl tracking-wider">LevelUp Fitness</span>
          <span className="text-xs bg-card-secondary text-muted px-2 py-0.5 rounded font-mono">MockPostman v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-muted hover:text-foreground transition-colors">Back to Login</a>
          <a href="/signup" className="text-sm bg-accent text-gray-900 px-3 py-1 rounded font-semibold hover:bg-accent/90 transition-colors">Join Now</a>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {/* Left pane: API Client */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border p-6 gap-6">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span>
            Postman API Playground
          </h2>

          {/* Route selector & Request bar */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRouteSelection('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  selectedRoute === 'register'
                    ? 'bg-accent/10 border-accent/50 text-accent'
                    : 'bg-card-secondary/40 border-transparent text-muted hover:text-foreground'
                }`}
              >
                POST /api/auth/register
              </button>
              <button
                type="button"
                onClick={() => handleRouteSelection('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  selectedRoute === 'login'
                    ? 'bg-accent/10 border-accent/50 text-accent'
                    : 'bg-card-secondary/40 border-transparent text-muted hover:text-foreground'
                }`}
              >
                POST /api/auth/login
              </button>
            </div>

            <div className="flex gap-2 bg-card-secondary p-1 rounded-lg border border-border items-center">
              <span className="text-green-500 font-bold font-mono px-3 py-1 text-sm bg-green-500/10 rounded">POST</span>
              <span className="text-muted font-mono text-sm flex-1 truncate">
                http://localhost:5000{REQUESTS[selectedRoute].url}
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-gray-900 font-semibold px-6 py-1.5 rounded-md text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex flex-col flex-1 gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Request Body (JSON)</span>
            <textarea
              className="flex-1 min-h-[160px] bg-card-secondary text-green-500 font-mono text-sm p-4 rounded-lg border border-border focus:outline-none focus:border-accent/50 resize-y"
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
            />
          </div>

          {/* Response Section */}
          <div className="flex flex-col flex-1 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Response</span>
              {responseStatus && (
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  Status: {responseStatus}
                </span>
              )}
            </div>
            <div className="bg-card-secondary border border-border rounded-lg p-4 font-mono text-xs text-blue-500 min-h-[160px] overflow-auto whitespace-pre">
              {responseBody || <span className="text-muted italic">No request sent yet. Click 'Send' above to trigger the call.</span>}
            </div>
          </div>
        </div>

        {/* Right pane: Explanation & Breakdown */}
        <div className="w-full lg:w-[420px] flex flex-col bg-card rounded-xl border border-border p-6 gap-6">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Response Breakdown</h2>
          
          <div className="flex flex-col gap-4 text-sm text-foreground overflow-y-auto">
            <p>
              When sending requests to the LevelUp Fitness API, the backend responds with a JSON object. Here is what the key properties mean:
            </p>

            <div className="border border-border rounded-lg p-3 bg-card-secondary/40">
              <span className="text-accent font-mono font-semibold text-xs">success</span>
              <p className="text-xs text-muted mt-1">
                A boolean (<code className="text-foreground font-mono">true</code> / <code className="text-foreground font-mono">false</code>) indicating if the request succeeded.
              </p>
            </div>

            <div className="border border-border rounded-lg p-3 bg-card-secondary/40">
              <span className="text-accent font-mono font-semibold text-xs">message</span>
              <p className="text-xs text-muted mt-1">
                A human-readable text detailing the outcome (e.g. "User created successfully" or "Login successful").
              </p>
            </div>

            <div className="border border-border rounded-lg p-3 bg-card-secondary/40">
              <span className="text-accent font-mono font-semibold text-xs">token</span>
              <p className="text-xs text-muted mt-1">
                A JSON Web Token (JWT) returned upon success. This token is stored securely in cookies by the frontend and sent in the <code className="text-foreground font-mono">Authorization</code> header for authenticated requests.
              </p>
            </div>

            <div className="border border-border rounded-lg p-3 bg-card-secondary/40">
              <span className="text-accent font-mono font-semibold text-xs">user</span>
              <p className="text-xs text-muted mt-1">
                Contains essential profile info: the database <code className="text-foreground font-mono">id</code>, <code className="text-foreground font-mono">name</code>, <code className="text-foreground font-mono">email</code>, and default <code className="text-foreground font-mono">role</code> ("user").
              </p>
            </div>

            <div className="border border-border/80 rounded-lg p-3 bg-red-500/5 border-red-500/20">
              <span className="text-red-500 font-mono font-semibold text-xs">Validation Errors (400)</span>
              <p className="text-xs text-muted mt-1">
                If inputs fail the schema checks (e.g., password without capital letter), the backend returns a <code className="text-red-500 font-mono">400</code> error, list of errors, and <code className="text-red-500 font-mono">success: false</code>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
