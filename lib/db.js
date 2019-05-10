'use strict';

const { Pool, Client } = require('pg')
const util = require('util');
const log = require('./logger')(module);
var nconf = require('./config')

var db_config = nconf.get('database');
const pool = new Pool(db_config)


pool.on('error', (err, client) => {
    log.error(err)
})

var createUser = async function (username, email, pass) {

    if (username && pass) {
        await pool.query("INSERT INTO users (username,password,email) VALUES ($1,$2,$3)", [username, pass, email]).catch((err)=>{
            log.error(err)
        })
    }
}

var getUser = async function (username, pass, id) {
    if (username && pass) {
        var user = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, pass])
    } else if (+id) {
        var user = await pool.query("SELECT * FROM users WHERE id = $1 ", [id])
    } else {
        return
    }

    return user.rows[0]
}

var getAllData = async function () {

    var user = await pool.query("SELECT * FROM users")

    return user.rows
}


var createToken = async function (user, token, exp) {

    let data = await pool.query("SELECT COUNT(*) as count FROM tokens WHERE user_id = $1", [user])

    if (+data.rows[0].count >= 10) {
        await deleteToken(user)
        throw "TOO_MANY_TOKENS"
    }

    await pool.query("INSERT INTO tokens (user_id,token,expires) VALUES ($1,$2,$3)", [user, token, exp])

    return
}

var getToken = async function (user, token) {
    let data = await pool.query("SELECT * FROM tokens WHERE user_id = $1 AND token = $2", [user, token])

    return data.rows[0]
}

var deleteToken = async function (user, token) {

    if (token) {
        await pool.query("DELETE FROM tokens WHERE user_id = $1 AND token = $2", [user, token])

    } else {
        await pool.query("DELETE FROM tokens WHERE user_id = $1 ", [user])

    }
    return

}



module.exports = {
    createUser,
    getUser,
    createToken,
    getToken,
    deleteToken,
    getAllData
}