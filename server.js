const express= require("express");
const app=express();
const path=require("path");
const fs=require("fs");
const jwt=require("jsonwebtoken");
const users=require("./data/users.json")
const cookieParser = require("cookie-parser");
const port=8000;
const filePath=path.join(__dirname,"/data/list.json");
  
app.use(express.json());
app.use(cookieParser());
let list;
fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
    console.error(err, 'Error Reading questions ')
  }
  if (data) {
    list = JSON.parse(data)
  }
})



app.get('/', validateUser, (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, './public/index.html'))
})
app.use(express.static('public'))

function validateUser (req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res
      .status(401)
      .sendFile(path.join(__dirname, './public/loginSignup.html'))
  }
  try {
    const newcookie = jwt.verify(token, 'abacadc')
    users.forEach(item => {
      if (item.email === newcookie.email) {
        return next()
      }
    })
  } catch (err) {
    console.error('Unauthorized User')
    return res.status(401).send('Unauthorized')
  }
}


app.get('/clearCookies', (req, res) => {
  const user = jwt.verify(req.cookies.token, 'abacadc')
  res.clearCookie('token')
  console.log(user, ' Logged out Successfully')
  res.json({ redirect: '/' })
})
app.get('/user', validateUser, (req, res) => {
  let token = req.cookies.token
  let newcookie = jwt.verify(token, 'abacadc')
  return res.status(200).json(newcookie)
})

app.post('/submit', (req, res) => {
  let userdata = req.body
  console.log(userdata)
  let flag = 0
  users.forEach(user => {
    if (user.email === userdata.email) {
      console.log(userdata.email + ' Already Registered')
      flag = 1
    }
  })
  if (flag) {
    return res.status(409).json({ status: 'Already Registered' })
  } else {
    users.push(userdata)
    fs.writeFile(
      path.join(__dirname, '/data/users.json'),
      JSON.stringify(users),
      (err, data) => {
        console.log(userdata.email + ' Got Registered')
        res.status(200).json({
          status: 'Signed Up Successfully'
        })
      }
    )
  }
})

app.post('/login', (req, res) => {
  let loguser = req.body
  var flag = 0
  console.log(loguser)
  const email = loguser.email
  const password = loguser.password
  users.forEach(user => {
    if (user.email === email && user.password === password) {
      console.log(user.name + ' Logged In Sccessfully')
      const token = jwt.sign({ email: email, name: user.name }, 'abacadc')
      res.cookie('token', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true
      })
      flag = 1
    }
  })
  if (flag) {
    return res.status(200).json({ status: 'Login Successful' })
  } else {
    console.log('Invalid Credentials')
    return res.status(409).json({status: 'Invalid Credentials'})
  }
})

app.get('/id', (req, res) => {

  fs.readFile(path.join(__dirname, '/data/id.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error(err + 'Error Reading id')
    }
    if (data) {
      res.end(data)
    }
  })
})

app.post('/id', (req, res) => {
  const data = req.body
  fs.writeFile(path.join(__dirname, '/data/id.json'), JSON.stringify(data), err => {
    if (err) {
      console.error(err)
      res.status(404).end(err)
    }
    res.end()
  })
})
app.get('/list', (req, res) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err, 'Error Reading questions ')
    }
    if (data) {
      list = JSON.parse(data)
      res.json(list)
    }
  })
})

app.post('/newQuestion', (req, res) => {
  const ques = req.body
  list[ques.id] = ques
  fs.writeFile(filePath, JSON.stringify(list), err => {
    if (err) {
      console.error(err)
      res.status(404).end(err)
    }
    res.end()
  })
})
app.post('/addresponse', (req, res) => {
  list[req.body.id].responses.push(req.body.response)
  fs.writeFile(filePath, JSON.stringify(list), err => {
    if (err) {
      console.error(err)
      res.status(404).end(err)
    }
    res.end()
  })
})

app.post('/deleteQues', (req, res) => {
    delete list[req.body.id]
    fs.writeFile(filePath, JSON.stringify(list), err => {
      if (err) {
        console.error(err)
        res.status(404).end(err)
      }
      res.end()
    })
  })
app.post('/star', (req, res) => {
    list[req.body.id].star = list[req.body.id].star ? false : true ;
    fs.writeFile(filePath, JSON.stringify(list), err => {
      if (err) {
        console.error(err)
        res.status(404).end(err)
      }
      res.end()
    })
  })
  app.post('/like', (req, res) => {
    list[req.body.id].responses.find(elem=> elem.id==req.body.resid).likes++;
    fs.writeFile(filePath, JSON.stringify(list), err => {
      if (err) {
        console.error(err)
        res.status(404).end(err)
      }
      res.end()
    })
  })
  app.post('/dislike', (req, res) => {
    list[req.body.id].responses.find(elem=> elem.id==req.body.resid).dislikes++;
    fs.writeFile(filePath, JSON.stringify(list), err => {
      if (err) {
        console.error(err)
        res.status(404).end(err)
      }
      res.end()
    })
  })
  


app.get('*', validateUser, (req, res) => {
  console.error('Page not found')

  res.sendFile(__dirname + '/public/error.html')
})

app.listen(port, () => {
  console.log('✅ Server running at http://localhost:8000')
})
