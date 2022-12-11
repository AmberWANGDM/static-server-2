const fs = require('fs')

// 读数据库 得到user数据
const userString = fs.readFileSync('./db/user.json').toString()
const usersArray = JSON.parse(userString) // 反序列化得到数组
console.log(typeof userString) // string
console.log(usersArray instanceof Array) // true

// 写数据库
const user3 = { id: 3, name: 'tom', password: 'yyy' }
usersArray.push(user3)
const string = JSON.stringify(usersArray) // 序列化得到字符串
fs.writeFileSync('./db/user.json', string) // 写入
