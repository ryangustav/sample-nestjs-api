import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function Dashboard() {
  const [codes, setCodes] = useState([]);
  const [nome, setNome] = useState('');
  const [tempoDias, setTempoDias] = useState('30');
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
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(tempoDias));

      const { data } = await api.post('/codes/generate', {
        nome: nome.trim(),
        tempo: expirationDate.toISOString(),
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

  const isExpired = (dateStr) => new Date() > new Date(dateStr);

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
              <label>Tempo de Expiração</label>
              <select value={tempoDias} onChange={(e) => setTempoDias(e.target.value)}>
                <option value="1">1 dia</option>
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="180">180 dias</option>
                <option value="365">1 ano</option>
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
                    <th>Expira em</th>
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
                      <td>{formatDate(item.tempo)}</td>
                      <td>
                        <span className={`status-badge ${isExpired(item.tempo) ? 'expired' : 'active'}`}>
                          {isExpired(item.tempo) ? 'Expirado' : 'Ativo'}
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
