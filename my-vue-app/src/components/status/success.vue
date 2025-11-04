<template>
    <div v-if="success" class="alert alert-success" role="alert">
        <label>{{ success }}</label>
    </div>
</template>

<script>
export default {
    name: 'SuccessComponent',
    props: {
        success: {
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