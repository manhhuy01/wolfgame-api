const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const db = require('./db')

const login = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(400)
    return res.send('err')
  }
  let { error, data } = await db.getUser({ userName, password });
  if (error) {
    res.status(404);
    return res.send({ error })
  } else {
    return res.send({ 
      token: data.token,
      
    })
  }
}

const register = async (req, res) => {
  // validate
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(400)
    return res.send('err')
  }
  
  let result = await db.createUser({ userName, password });
  if (result.error) {
    res.status(400)
    switch (result.error.code) {
      case '23505':
        return res.send(JSON.stringify({ error: 'Username đã tồn tại' }))
      default:
        return res.send(JSON.stringify({ error: 'lỗi qq gì rồi ' }))
    }
  } else {
    return res.send({ token: result.token })
  }
}

const decryptToken = async (req, res, next) => {
  // validate
  let token;
  token = req.cookies.token;
  if (!token) {
    token = req.query.token;
  }
  if(!token){
    token = req.headers.token
  }
  if (!token) return next()
  
  try {
    let userStr = cryptr.decrypt(token);
    if(!userStr) next();
    req.user = {
      userName: userStr,
    }
    next()
  } catch(err){
    console.log(err)
    next()
  }
  // console.log(token, encryptor.decrypt(token))
 

}

const getInfo = async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(400);
    return res.send({ error: 'không tìm thấy' })
  } else {
    return res.send({ userName: user.userName })
  }
}

module.exports = {
  login,
  register,
  decryptToken,
  getInfo
}