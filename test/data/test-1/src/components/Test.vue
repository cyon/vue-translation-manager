<template>
  <div>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        <b>Name: </b> {{user.name}}<br>
        <b>Birthday: </b> {{user.birthday}}<br>
        <b>Hello text: {{ user.male ? 'Mr' : 'Mrs' }} {{ user.name }}</b><br>
        <b>{{ user.name }} Birthday: {{ user.birthday}}</b><br>
      </li>
    </ul>
  </div>
</template>

<script>
export default {}
</script>
