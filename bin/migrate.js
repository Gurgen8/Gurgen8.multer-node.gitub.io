import Users from "../models/Users";


async function migrate() {
  await Users.sync({ alter: true });
  console.log('ok');
  process.exit(0)
}

migrate();
