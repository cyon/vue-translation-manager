<template>
  <div>
    <h1>Hallo Welt {{ name }}</h1>
    <h1>Your name: {{ name }}</h1>
    <button @click="clicks++">Click me</button>
    <p>You clicked the button {{ clicks }} times</p>
  </div>
</template>
<script>
export default {
  data: () => ({
    name: '',
    clicks: 0
  })
}
</script>
