<template>
  <div class="success-page">
    <h2>✅ Payment Successful!</h2>
    <p>Thank you for your order.</p>
    <router-link to="/">Return to Home</router-link>
  </div>
</template>

<script>
export default { name: 'PaymentSuccess' }
</script>

<style>
.success-page {
  text-align: center;
  margin-top: 250px;
}
</style>