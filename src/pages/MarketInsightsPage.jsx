import React, { useState, useEffect } from 'react';
import {
  BitcoinPriceHeader,
  FearAndGreedChartLine,
} from '../features/market-insights';

export const MarketInsightsPage = () => {
  // Estados para autenticação e menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados para controle financeiro
  const [financialData, setFinancialData] = useState({
    balance: 12450.00,
    btcAmount: 0.042,
    lastExpense: { amount: 320.00, category: 'Alimentação', date: '2024-01-15' }
  });

  // Verificar login ao carregar página
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedUser');
    if (savedUser) {
      setIsLoggedIn(true);
      setUserName(savedUser);
    }
  }, []);

  // Funções do menu hambúrguer
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Funções de autenticação
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      const name = loginEmail.split('@')[0];
      localStorage.setItem('loggedUser', name);
      setIsLoggedIn(true);
      setUserName(name);
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      alert('Preencha e-mail e senha');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setIsLoggedIn(false);
    setUserName('');
    alert('Você saiu da conta. Área financeira bloqueada.');
  };

  const handleSignup = () => {
    const email = prompt('Digite seu e-mail para cadastro:', 'usuario@email.com');
    if (email && email.includes('@')) {
      const name = email.split('@')[0];
      localStorage.setItem('loggedUser', name);
      setIsLoggedIn(true);
      setUserName(name);
    } else if (email) {
      alert('Por favor, insira um e-mail válido');
    }
  };

  // Adicionar nova despesa
  const addExpense = () => {
    const amount = prompt('Valor da despesa (R$):');
    const category = prompt('Categoria (ex: Transporte, Lazer, Alimentação):');
    if (amount && category) {
      setFinancialData(prev => ({
        ...prev,
        balance: prev.balance - parseFloat(amount),
        lastExpense: { amount: parseFloat(amount), category, date: new Date().toISOString().split('T')[0] }
      }));
      alert(`Despesa de R$ ${amount} (${category}) adicionada com sucesso!`);
    }
  };

  return (
    <>
      {/* Barra Superior com Menu Hamburguer e Autenticação */}
      <div className="top-bar">
        <button className="hamburger-btn" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="logo-area">
          <h2>₿ Controle Financeiro Pessoal</h2>
        </div>

        <div className="auth-area">
          {!isLoggedIn ? (
            <>
              <button className="btn-outline" onClick={() => setIsLoginModalOpen(true)}>
                Entrar
              </button>
              <button className="btn-primary" onClick={handleSignup}>
                Registrar
              </button>
            </>
          ) : (
            <div className="user-greeting">
              <span>👋 Olá, {userName}</span>
              <button className="btn-outline" onClick={handleLogout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Lateral */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={closeMenu}>
          ✕ Fechar
        </button>
        <ul>
          <li onClick={closeMenu}>📊 Dashboard BTC</li>
          <li onClick={closeMenu}>📈 Análises</li>
          <li onClick={() => {
            closeMenu();
            document.getElementById('financial-panel')?.scrollIntoView({ behavior: 'smooth' });
          }}>💰 Finanças Pessoais</li>
          <li onClick={closeMenu}>⚙️ Configurações</li>
          <li onClick={closeMenu}>🆘 Suporte</li>
        </ul>
      </div>

      {/* Overlay para fechar menu */}
      {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Modal de Login */}
      {isLoginModalOpen && (
        <div className="modal active" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Acessar sua conta</h3>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="E-mail"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">
                Entrar
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setIsLoginModalOpen(false)}
                style={{ marginTop: '12px' }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Conteúdo Original */}
      <div className="App">
        <header className="App-header">
          <h1>
            <BitcoinPriceHeader />
          </h1>
        </header>

        <div className="chart-container">
          <FearAndGreedChartLine />
        </div>

        {/* Painel de Controle Financeiro Pessoal (só aparece logado) */}
        {isLoggedIn && (
          <div id="financial-panel" className="financial-panel">
            <div className="panel-header">
              <h2>📋 Controle Financeiro Pessoal</h2>
              <button className="btn-primary-small" onClick={addExpense}>
                + Nova Despesa
              </button>
            </div>
            
            <div className="financial-cards">
              <div className="card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Saldo Disponível</h3>
                  <p className="card-value">R$ {financialData.balance.toFixed(2)}</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon">₿</div>
                <div className="card-content">
                  <h3>Investido em BTC</h3>
                  <p className="card-value">{financialData.btcAmount} BTC</p>
                  <p className="card-subtitle">≈ R$ {(financialData.btcAmount * 73517.04 * 5).toFixed(2)}</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon">💳</div>
                <div className="card-content">
                  <h3>Última Despesa</h3>
                  <p className="card-value">R$ {financialData.lastExpense.amount.toFixed(2)}</p>
                  <p className="card-subtitle">{financialData.lastExpense.category} • {financialData.lastExpense.date}</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <button className="action-btn" onClick={() => alert('Transferência em desenvolvimento')}>
                📤 Transferir
              </button>
              <button className="action-btn" onClick={() => alert('Compra de BTC em desenvolvimento')}>
                ₿ Comprar BTC
              </button>
              <button className="action-btn" onClick={() => alert('Relatórios em desenvolvimento')}>
                📊 Relatórios
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketInsightsPage;
