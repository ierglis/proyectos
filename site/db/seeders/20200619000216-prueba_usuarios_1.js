'use strict';
const faker = require('faker');
var bcrypt = require('bcrypt');
const db = require('../../database/models')

module.exports = {
  up: (queryInterface, Sequelize) => {

    // let users = [];

    //  for (let i = 1; i < 10; i++) {
    //  users.push({
    //  email: faker.internet.email(),
    //  password: bcrypt.hashSync('12345678', 10),
    // avatar: '1591744954745.jpg',
    // id: i+1
    //   })
    // }

    return queryInterface.bulkInsert('Users', [
      {
        id: 1,
        email: faker.internet.email(),
        password: bcrypt.hashSync('12345678', 10),
        avatar: '1591744954745.jpg',
        
      },
      {
        id: 2,
        email: faker.internet.email(),
        password: bcrypt.hashSync('12345678', 10),
        avatar: '1591744954745.jpg',
        
      }
    ] , {})


   
  },

  down: (queryInterface, Sequelize) => {

    return queryInterface.bulkDelete('Users', null, {});

  }
};





    // let user = await db.Users.create({
    //   email: faker.internet.email(),
    //   password: bcrypt.hashSync('12345678', 10),
    //   avatar: '1591744954745.jpg',
    // }, {
    //   include: ['admins']
    // })
    
    // let admin = user.setAdmins({
    //   user_id : user.id
    // })

    // console.log("USER", user)
    // console.log("ADMIN", admin)