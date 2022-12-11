var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
  }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
  if (path === '/sign_in' && method === 'POST') {
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    const array = [] // 不能确定数据长度,有可能是分段上传的
    const userArray = JSON.parse(fs.readFileSync('./db/user.json')) // 获取当前数据库的数据
    // 监听数据上传事件
    request.on('data', (chunk) => {
      array.push(chunk)
    })
    // 监听数据上传结束事件
    request.on('end', () => {
      // utf-8 数据 合成字符串
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string) // 获取用户的输入
      const user = userArray.find(
        (user) => user.name === obj.name && user.password === obj.password
      )
      if (user === undefined) {
        response.statusCode = 400 // 注意不是status
        response.end('name password 不匹配')
      } else {
        response.statusCode = 200
        // 下发给浏览器cookie
        response.setHeader('Set-Cookie', `user_id=${user.id}; HttpOnly`)
      }
    })
  } else if (path === '/home.html') {
    const cookie = request.headers['cookie']
    let userId
    try {
      userId = cookie
        .split(';')
        .filter((s) => s.indexOf('user_id=') >= 0)[0]
        .split('=')[1]
    } catch (error) {}
    const homeHtml = fs.readFileSync('./public/home.html').toString()
    if (userId) {
      const userArray = JSON.parse(fs.readFileSync('./db/user.json')) // 获取当前数据库的数据
      const user = userArray.find((user) => user.id.toString() === userId)
      let string
      if (user) {
        string = homeHtml
          .replace('{{loginStatus}}', '已登录')
          .replace('{{user.name}}', user.name)
        response.write(string)
      } else {
      }
    } else {
      string = homeHtml
        .replace('{{loginStatus}}', '未登录')
        .replace('{{user.name}}', '')
      response.write(string)
    }
  } else if (path === '/register' && method === 'POST') {
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    const array = [] // 不能确定数据长度,有可能是分段上传的
    const userArray = JSON.parse(fs.readFileSync('./db/user.json')) // 获取当前数据库的数据
    // 监听数据上传事件
    request.on('data', (chunk) => {
      array.push(chunk)
    })
    // 监听数据上传结束事件
    request.on('end', () => {
      // utf-8 数据 合成字符串
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string) // 获取用户的输入
      // 整理输入数据上传到数据库
      const lastUser = userArray[userArray.length - 1]
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1, // 当前数据库最后一个对象的id + 1
        name: obj.name,
        password: obj.password,
      }
      userArray.push(newUser)
      fs.writeFileSync('./db/user.json', JSON.stringify(userArray))
    })
  } else {
    // 首页默认为index.html
    const filePath = path === '/' ? '/index.html' : path
    const index = filePath.lastIndexOf('.')
    const suffix = filePath.substring(index) // 文件后缀
    const fileTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
    }
    response.statusCode = 200
    response.setHeader(
      'Content-Type',
      `${fileTypes[suffix] || 'text/html'};charset=utf-8`
    )
    let content
    // 错误处理
    try {
      content = fs.readFileSync(`./public${filePath}`)
    } catch (error) {
      response.statusCode = 404
      content = '文件不存在'
    }
    response.write(content)
  }
  response.end()
  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log(
  '监听 ' +
    port +
    ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' +
    port
)
