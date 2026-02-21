import React from 'react';
import { useNavigate } from 'react-router-dom';

const endpoints = [
  {
    group: 'Autenticação',
    items: [
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Realiza login de administrador e retorna um token JWT.',
        auth: false,
        body: {
          username: 'string',
          password: 'string',
        },
        response: {
          token: 'string (JWT)',
          username: 'string',
        },
        example: {
          request: '{\n  "username": "onlykgzin",\n  "password": "sua_senha"\n}',
          response: '{\n  "token": "eyJhbGciOiJIUzI1NiIs...",\n  "username": "onlykgzin"\n}',
        },
      },
    ],
  },
  {
    group: 'Códigos',
    items: [
      {
        method: 'POST',
        path: '/api/v1/codes/generate',
        description: 'Gera um novo código de 12 caracteres. A validade conta a partir do 1º uso do código. tempo = duração em horas (ex: 1, 6, 12, 24, 168).',
        auth: true,
        body: {
          nome: 'string — nome do usuário que comprou',
          tempo: 'number — duração em horas (1=1h, 24=1 dia, 168=7 dias)',
        },
        response: {
          _id: 'string',
          code: 'string (12 chars)',
          nome: 'string',
          tempo: 'number (horas)',
          firstUsedAt: 'Date | null',
          active: 'boolean',
          createdBy: 'string (admin id)',
          createdAt: 'string (date)',
        },
        example: {
          request: '{\n  "nome": "João Silva",\n  "tempo": 24\n}',
          response: '{\n  "_id": "65f...",\n  "code": "aB3kL9mNpQ2x",\n  "nome": "João Silva",\n  "tempo": 24,\n  "firstUsedAt": null,\n  "active": true,\n  "createdAt": "2026-02-19T...",\n  "expired": false\n}',
        },
      },
      {
        method: 'GET',
        path: '/api/v1/codes',
        description: 'Lista todos os códigos gerados, ordenados do mais recente.',
        auth: true,
        body: null,
        response: '[ { code, nome, tempo, active, expired, createdAt, createdBy } ]',
        example: null,
      },
      {
        method: 'DELETE',
        path: '/api/v1/codes/:id',
        description: 'Remove permanentemente um código pelo seu ID.',
        auth: true,
        body: null,
        response: { message: 'Código removido com sucesso' },
        example: null,
      },
      {
        method: 'GET',
        path: '/api/v1/codes/verify/:code',
        description: 'Verifica se um código é válido. No 1º uso, registra o início da contagem. Rota pública. Para códigos especiais (ex: FreeUser12Hours), envie o header X-Device-ID ou query ?deviceId= — cada dispositivo tem 12h independentes, válido até 28/02/2026.',
        auth: false,
        body: null,
        response: {
          valid: 'boolean',
          nome: 'string',
          tempo: 'number (horas)',
          expiresAt: 'string (date) — quando expira (após 1º uso)',
          message: 'string (se inválido)',
        },
        example: {
          request: 'GET /api/v1/codes/verify/FreeUser12Hours\nHeader: X-Device-ID: device-uuid-123\nou: GET /api/v1/codes/verify/FreeUser12Hours?deviceId=device-uuid-123',
          response: '{\n  "valid": true,\n  "nome": "FreeUser",\n  "tempo": 12,\n  "expiresAt": "2026-02-19T12:00:00.000Z"\n}',
        },
      },
    ],
  },
];

function MethodBadge({ method }) {
  const colors = {
    GET: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.25)' },
    POST: { bg: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.25)' },
    DELETE: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
  };
  const c = colors[method] || colors.GET;
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.5px',
    }}>
      {method}
    </span>
  );
}

function ApiDocs() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Master Cheat
        </span>
        <div className="header-right">
          <button className="btn-nav" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <span className="username">{username}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="docs-header">
          <h1>API Documentation</h1>
          <p>Referência completa dos endpoints disponíveis. Todas as rotas protegidas exigem o header <code>Authorization: Bearer {'<token>'}</code>.</p>
        </div>

        <div className="docs-auth-info">
          <div className="docs-auth-title">Autenticação</div>
          <p>Obtenha um token JWT via <code>POST /api/v1/auth/login</code>. Use o token retornado no header de todas as requisições protegidas:</p>
          <pre className="docs-code-block">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>O token expira em 24 horas.</p>
        </div>

        {endpoints.map((group) => (
          <div key={group.group} className="docs-group">
            <h2 className="docs-group-title">{group.group}</h2>
            {group.items.map((ep, i) => (
              <div key={i} className="docs-endpoint">
                <div className="docs-endpoint-header">
                  <MethodBadge method={ep.method} />
                  <code className="docs-path">{ep.path}</code>
                  {ep.auth && <span className="docs-auth-badge">Auth</span>}
                </div>
                <p className="docs-description">{ep.description}</p>

                {ep.body && (
                  <div className="docs-section">
                    <h4>Request Body</h4>
                    <pre className="docs-code-block">
                      {JSON.stringify(ep.body, null, 2)}
                    </pre>
                  </div>
                )}

                {ep.response && (
                  <div className="docs-section">
                    <h4>Response</h4>
                    <pre className="docs-code-block">
                      {typeof ep.response === 'string' ? ep.response : JSON.stringify(ep.response, null, 2)}
                    </pre>
                  </div>
                )}

                {ep.example && (
                  <div className="docs-section">
                    <h4>Exemplo</h4>
                    <div className="docs-example-grid">
                      {ep.example.request && (
                        <div>
                          <span className="docs-example-label">Request</span>
                          <pre className="docs-code-block">{ep.example.request}</pre>
                        </div>
                      )}
                      {ep.example.response && (
                        <div>
                          <span className="docs-example-label">Response</span>
                          <pre className="docs-code-block">{ep.example.response}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApiDocs;
