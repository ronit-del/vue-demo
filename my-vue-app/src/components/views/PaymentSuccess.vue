<template>
  <div class="success-page">
    <div class="success-card">
      <div class="success-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="4" fill="none"/>
          <path d="M25 40L35 50L55 30" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your order. Your payment has been processed successfully.</p>
      <p class="success-message">You will receive a confirmation email shortly.</p>
      <router-link to="/" class="btn btn-primary">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L2 10L10 18M2 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Return to Home
      </router-link>
    </div>
  </div>
</template>

<script>
export default { 
  name: 'PaymentSuccess' 
}
</script>

<style scoped>
.success-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
}

.success-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  color: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  padding: 1rem;
}

.success-icon svg {
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--success-color), #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.success-message {
  color: var(--success-color);
  font-weight: 600;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  margin-top: 1rem;
  text-decoration: none;
}

@media (max-width: 768px) {
  .success-card {
    padding: 2rem 1.5rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  p {
    font-size: 1rem;
  }
}
</style>
