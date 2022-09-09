const { Client } = require('pg')
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const saltRounds = 10;

const dbConfig = {
  user: 'xgmxjqvssqyssm',
  host: 'ec2-52-0-114-209.compute-1.amazonaws.com',
  database: 'dfq7upgaj6k5qk',
  password: 'd6871c8cd148e7b8375529a0b26242fcaeb974cfc7393b4faee6d6be65568092',
  port: 5432,
  ssl: { rejectUnauthorized: false }
}

const createUser = async ({ userName, password }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let token;
  try {
    token = cryptr.encrypt(userName);
    let hashPw = bcrypt.hashSync(password, saltRounds);
    const res = await client.query("Insert into accounts (username, password, token) values ($1, $2, $3)", [userName, hashPw, token]);
  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error, token };
}

const getUser = async ({ userName, password }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("select * from accounts where username = $1", [userName]);
    if (res.rows.length) {
      if (bcrypt.compareSync(password, res.rows[0].password)) {
        return {
          error,
          data: {
            userName: res.rows[0].username,
            token: res.rows[0].token
          }
        }
      } else {
        return { error: 'Password sai rồi' }
      }

    } else {
      return { error: 'user không tồn tại', data: null }
    }

  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const getInfoAccount = async ({ userName }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("select * from accounts where username = $1", [userName]);
    if (res.rows.length) {
        return {
          error,
          data: {
            userName: res.rows[0].username,
            balance: +res.rows[0].balance || 0,
          }
        }
    } else {
      return { error: 'user không tồn tại', data: null }
    }

  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const updateBalance = async ({userName, balance}) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("update accounts set balance = $1 where username = $2", [balance, userName]);
  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

module.exports = {
  createUser,
  getUser,
  getInfoAccount,
  updateBalance,
}