import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post("http://localhost:3000/api/auth/user/login", {
      email,
      password
    }, { withCredentials: true });

    console.log(response.data);

    localStorage.setItem("user", JSON.stringify(response.data?.user ?? response.data ?? null));

    navigate("/"); // Redirect to home after login

  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <div className="auth-branding">
          <h2 className="auth-brand-logo">ReelBite</h2>
          <p className="auth-brand-tagline">Scroll. Crave. Order.</p>
        </div>
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>
        <nav className="auth-role-toggle" aria-label="Account type">
          <Link className="auth-toggle-btn is-active" to="/user/login">User</Link>
          <Link className="auth-toggle-btn" to="/food-partner/login">Food Partner</Link>
        </nav>
        <form className="auth-form user-login-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New here? <Link to="/user/register">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;