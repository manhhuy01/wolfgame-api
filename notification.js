const socket = require('./socket');

const notification = (req, res, next) => {
  switch (req.path) {
    case '/player/action':
      let indexSound = undefined;
      if(req.body.type == 'BET') {
        indexSound = Math.round(Math.random()*100);
      }
      socket.notifyToAllPlayer({ 
        id: Math.random(), 
        action: req.body.type, 
        userName: req?.user?.userName,
        indexSound,
      })
      break;
    case '/player/tip':
      socket.notifyToAllPlayer({ id: Math.random(), action: 'TIP', userName: req?.user?.userName, tip: Math.round(+req.body.tip) })
      break;
    case '/game/updateProfile':
      socket.notifyToAllPlayer({
        id: Math.random(), action: 'CASH-IN-OUT',
        userName: req.body?.userName,
        accBalance: +req.body.accBalance
      })
      break;
    case '/game/shuffleCards':
      socket.notifyToAllPlayer({
        id: Math.random(),
        action: 'SHUFFLE',
      })
      break;
    default:
      break;
  }
  next()
}

module.exports = notification