<template>
    <div v-if="error" class="alert alert-danger" role="alert">
        <label>{{ error }}</label>
    </div>
</template>

<script>
export default {
    name: 'ErrorComponent',
    props: {
        error: {
            type: String
        }
    }
}
</script>

<style>
.alert {
    padding: 0.5rem 0.5rem;
}
label {
    font-weight: 500;
    font-family: 'Fira Sans', sans-serif;
    margin: 0;
}
</style>