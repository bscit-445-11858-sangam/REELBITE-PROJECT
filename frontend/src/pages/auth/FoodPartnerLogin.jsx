import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodPartnerLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post("http://localhost:3000/api/auth/food-partner/login", {
      email,
      password
    }, { withCredentials: true });

    console.log(response.data);

    localStorage.setItem("user", JSON.stringify(response.data?.foodPartner ?? response.data?.user ?? response.data ?? null));

    navigate("/create-food"); // Redirect to create food page after login

  };

  return (
    <div className="auth-page-wrapper auth-page-partner">
      <div className="auth-card partner-signup-card partner-login-card" role="region" aria-labelledby="partner-login-title">
        <div className="auth-branding">
          <h2 className="auth-brand-logo">ReelBite</h2>
          <p className="auth-brand-tagline">Scroll. Crave. Order.</p>
        </div>
        <header>
          <h1 id="partner-login-title" className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        </header>
        <form className="auth-form partner-signup-form partner-login-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New partner? <Link to="/food-partner/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;