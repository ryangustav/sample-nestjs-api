import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const TEMPO_OPTIONS = [
  { value: 1, label: '1 hora' },
  { value: 6, label: '6 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '1 dia' },
  { value: 168, label: '7 dias' },
  { value: 360, label: '15 dias' },
  { value: 720, label: '30 dias' },
  { value: 1440, label: '60 dias' },
  { value: 2160, label: '90 dias' },
  { value: 4320, label: '180 dias' },
  { value: 8760, label: '1 ano' },
];

function formatTempoHours(hours) {
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`;
  const dias = Math.round(hours / 24);
  return `${dias} dia${dias > 1 ? 's' : ''}`;
}

function Dashboard() {
  const [codes, setCodes] = useState([]);
  const [nome, setNome] = useState('');
  const [tempoHoras, setTempoHoras] = useState('24');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const fetchCodes = useCallback(async () => {
    try {
      const { data } = await api.get('/codes');
      setCodes(data);
    } catch {
      toast.error('Erro ao carregar códigos');
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('Nome do usuário é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/codes/generate', {
        nome: nome.trim(),
        tempo: parseInt(tempoHoras, 10),
      });

      toast.success(`Código gerado: ${data.code}`);
      setNome('');
      fetchCodes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao gerar código');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este código?')) return;

    try {
      await api.delete(`/codes/${id}`);
      toast.success('Código removido');
      fetchCodes();
    } catch {
      toast.error('Erro ao remover código');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExpiraEm = (item) => {
    if (item.tempo instanceof Date || typeof item.tempo === 'string') {
      return formatDate(item.tempo);
    }
    if (!item.firstUsedAt) {
      return `${formatTempoHours(item.tempo)} após 1º uso`;
    }
    const expiresAt = new Date(new Date(item.firstUsedAt).getTime() + item.tempo * 60 * 60 * 1000);
    return formatDate(expiresAt);
  };

  const isExpired = (item) => {
    if (item.tempo instanceof Date || typeof item.tempo === 'string') {
      return new Date() > new Date(item.tempo);
    }
    if (!item.firstUsedAt) return false;
    const expiresAt = new Date(new Date(item.firstUsedAt).getTime() + item.tempo * 60 * 60 * 1000);
    return new Date() > expiresAt;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="logo">Master Cheat</span>
        <div className="header-right">
          <button className="btn-nav" onClick={() => navigate('/docs')}>API Docs</button>
          <span className="username">{username}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="generate-section">
          <h2>Gerar Novo Código</h2>
          <form className="generate-form" onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Nome do Usuário</label>
              <input
                type="text"
                placeholder="Nome de quem comprou"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Validade (a partir do 1º uso)</label>
              <select value={tempoHoras} onChange={(e) => setTempoHoras(e.target.value)}>
                {TEMPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-generate" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar Código'}
            </button>
          </form>
        </div>

        <div className="codes-section">
          <h2>Códigos Gerados ({codes.length})</h2>
          {codes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum código gerado ainda.</p>
            </div>
          ) : (
            <div className="codes-table-wrapper">
              <table className="codes-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Usuário</th>
                    <th>Validade</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span
                          className="code-value"
                          onClick={() => handleCopy(item.code)}
                          title="Clique para copiar"
                        >
                          {item.code}
                        </span>
                      </td>
                      <td>{item.nome}</td>
                      <td>{getExpiraEm(item)}</td>
                      <td>
                        <span className={`status-badge ${isExpired(item) ? 'expired' : 'active'}`}>
                          {isExpired(item) ? 'Expirado' : 'Ativo'}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-copy" onClick={() => handleCopy(item.code)}>
                            Copiar
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(item._id)}>
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
