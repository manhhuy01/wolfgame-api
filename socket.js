const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const game = require('./game')
const chat = require('./chat')
const db = require('./db')
const utils = require('./utils.js')
let io

let chainUpdate = false;

const defaultRoom = 'v-poker-room-1'

const updateGame = (userName) => {
  let data = game.getRoomInfo({ userName })
  io.to(userName).emit('data', data);
}

const updateAllPlayer = async () => {
  let players = game.getAllPlayers();
  let gameData = game.getData();
  if (gameData.table.showDownAt) {
    chainUpdateToAllPlayer()
  } else {
    players.forEach((player) => {
      let data = game.getRoomInfo({ userName: player.userName })
      io.to(player.userName).emit('data', data);
    })
  }

}

const chainUpdateToAllPlayer = async () => {
  if (!chainUpdate) {
    chainUpdate = true;
    let players = game.getAllPlayers();
    let data = game.getData();
    switch (data.table.showDownAt) {
      case 'flop':
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'flop' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'turn' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'river' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'space' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(1500)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName })
          io.to(player.userName).emit('data', data);
        })
        break;
      case 'turn':
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'turn' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'river' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'space' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(1500)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName })
          io.to(player.userName).emit('data', data);
        })
        break;
      case 'river':
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'river' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(3000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'space' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(1500)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName })
          io.to(player.userName).emit('data', data);
        })
        break;
      case 'space':
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName, showDownAt: 'space' })
          io.to(player.userName).emit('data', data);
        })
        await utils.sleep(1000)
        players.forEach((player) => {
          let data = game.getRoomInfo({ userName: player.userName })
          io.to(player.userName).emit('data', data);
        })
        break;
      default:
        break;
    }
    game.setShowDownAt(undefined);
    chainUpdate = false;

  }

}

const notifyToAllPlayer = (data) => {
  io.to(defaultRoom).emit('notification', data)
}

const init = (http) => {
  io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'DELETE']
    }
  });

  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.query.token;
      const userName = (cryptr.decrypt(token) || '').split('|')[0]
      if (!userName) {
        return;
      }
      let info = await db.getInfoAccount({ userName })
      socket.join(defaultRoom)
      socket.join(userName);
      game.addPlayer({ userName, balance: info?.data?.balance })
      updateAllPlayer();
      io.to(defaultRoom).emit('chat', chat.getData());

      socket.on('sendMessage', ({ message, userName }) => {
        chat.setMessage({ message, userName })
        socket.broadcast.to(defaultRoom).emit('chat', chat.getData());
      })

      socket.on('disconnect', async () => {
        const ids = await io.in(defaultRoom).allSockets();
        if (!ids.size) {
          game.removeDealer()
        }
      });
    } catch (err) {
      console.log('io connection err', err)
    }

  });
}


module.exports = {
  io,
  init,
  updateGame,
  updateAllPlayer,
  notifyToAllPlayer,
}