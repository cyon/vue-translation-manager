<template>
  <div>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        <b>Name: </b> {{user.name}}<br>
        <b>Birthday: </b> {{user.birthday}}<br>
      </li>
    </ul>
  </div>
</template>

<script>
export default {}
</script>
