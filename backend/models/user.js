const User = require('../schemas/DB_user.js');
class Users {
    constructor() {
        this.users = [];
    }
    addUser(userId, username, password, name, rftoken) {
        var user = { userId, username, password, name, rftoken };
        this.players.push(user);
        return user;
    }
    removeUser(userId) {
        var user = this.getUser(userId);

        if (user) {
            this.users = this.users.filter((user) => user.userId !== userId);
        }
        return user;
    }
    getUser(userId) {
        return this.users.filter((user) => user.userId === userId)[0]
    }
}

module.exports = { Users };