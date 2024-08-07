db.createUser({
  user: "dbuser",
  pwd: "dbpass",
  roles: [
    {
      role: "readWrite",
      db: "dats",
    },
  ],
});
