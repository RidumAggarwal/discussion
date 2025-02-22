// Get elements
const subject = document.getElementById('subject')
const submit = document.getElementById('submit')
const question = document.getElementById('question')
const questionList = document.getElementById('question-list')
const questionClicked = document.getElementById('question-clicked')
const formSection = document.getElementById('form-section')
const responseSection = document.getElementById('response-section')
const listSection = document.getElementById('list-section')
const addrspbtn = document.getElementById('add-response-button')
// const rsp_name = document.getElementById('name')
const response = document.getElementById('response')
const addQuesBtn = document.getElementById('add-ques')
const responselist = document.getElementById('response-list')
const resolvebtn = document.getElementById('resolve-button')
const headques = document.getElementById('head-ques')
const search = document.getElementById('search')
const logoutBtn = document.getElementById('logout-btn')
const usname = document.getElementById('usname')
const usemail = document.getElementById('usemail')
const writer = document.getElementById('writer')
var username
var userEmail
fetch('/user', {
  method: 'GET',
  credentials: 'include'
})
  .then(response => response.json())
  .then(data => {
    if (data) {
      username = data.name
      usname.innerHTML = data.name
      userEmail = data.email
      usemail.innerHTML = `&lt${data.email}&gt`
    }
  })
  .catch(error => console.error('Error:', error))

// Initialize variables
let id
let list = {}
let openid = null

// Load data from local storage

async function postRequest (item, url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    const data = response
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}
async function getRequest (url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
    return null
  }
}
async function initialize () {
  const idObj = await getRequest('/id')
  console.log(idObj)
  if (idObj && idObj.id >= 0) {
    id = idObj.id
    try {
      list = await getRequest('/list')
    } catch (error) {
      console.error('Error parsing JSON data:', error)
    }
  } else {
    id = -1
  }
  loadQuestions()
}

initialize()
// Add event listeners

submit.addEventListener('click', addQuestion)
question.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addQuestion()
  }
})
listSection.addEventListener('click', addFavourites)
addrspbtn.addEventListener('click', addResponse)
response.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addResponse()
  }
})
addQuesBtn.addEventListener('click', toggleForm)
resolvebtn.addEventListener('click', deleteQuestion)

search.addEventListener('input', e => {
  const searchValue = e.target.value.trim()
  if (searchValue) {
    headques.style.display = 'none'
    let searchedlist = Object.keys(list).filter(
      id =>
        list[id].subject.toLowerCase().includes(searchValue.toLowerCase()) ||
        list[id].question.toLowerCase().includes(searchValue.toLowerCase())
    )

    if (searchedlist.length) {
      questionList.innerHTML = ''
      searchedlist.forEach(key => {
        const li = document.createElement('li')
        questionList.appendChild(li)
        li.className = 'questions-list'
        li.id = key
        li.innerHTML = `<div class="ques-head-part"><h1 class="subject-head">
        ${list[key].subject.replace(
          new RegExp(searchValue, 'gi'),
          `<mark>$&</mark>`
        )}
         </h1><div><span class='time' timestamp= ${list[key].time} >
        </span><span class='star'>${
          list[key].star ? '⭐️' : '☆'
        }</span> </div></div><hr><p class="subject-head">
                    ${list[key].question.replace(
                      new RegExp(searchValue, 'gi'),
                      `<mark>$&</mark>`
                    )} </p>`
      })
    } else {
      questionList.innerHTML = 'No Question Matched!'
    }
  } else {
    headques.style.display = 'block'
    loadQuestions()
  }
})

responselist.addEventListener('click', actionResponse)
logoutBtn.addEventListener('click', () => {
  fetch('/clearCookies', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      if (data.redirect) {
        window.location.href = data.redirect
      }
    })
    .catch(error => console.error('Error:', error))
})
// Functions
function addQuestion () {
  const subjectValue = subject.value.trim()
  const questionValue = question.value.trim()

  if (subjectValue && questionValue) {
    headques.innerText = 'All questions'
    id++
    const newQuestion = {
      id: id,
      subject: subjectValue,
      question: questionValue,
      responses: [],
      star: false,
      time: Date.now(),
      name: username,
      email: userEmail
    }

    const li = document.createElement('li')
    questionList.appendChild(li)
    li.className = 'questions-list'
    li.id = id
    list[id] = newQuestion
    postRequest({ id: id }, '/id')
    postRequest(newQuestion, '/newQuestion')
    li.innerHTML = `<div class="ques-head-part"><h1 class="subject-head">${subjectValue}
     </h1> <div><span class='time' timestamp='${list[id].time}'>
     </span><span class='star'>☆</span></div></div><hr><p class="subject-head">${questionValue} </p>`
    subject.value = ''
    question.value = ''
    
    toggleForm()
  } else {
    alert('Please fill in all fields')
  }
  toggleForm()
}

function displayQuestion (e) {
   openid = e.target.closest('li').id
  const storedList = list
  if (list && list[openid]) {
    questionClicked.innerHTML = `<h1>${list[openid].subject} </h1> <hr><p>${list[openid].question} </p>`
    writer.innerText = `${
      list[openid].name == username ? 'You' : list[openid].name
    }:`
    
   reloadResponses()
    toggleResponseSection()
  }
}

 function addResponse () {
  const responseValue = response.value.trim()
  const rspname = username;

  if (responseValue && rspname) {
    const currentQuestionId = openid
    if (list && list[currentQuestionId]) {
        let resid;
      if (list[currentQuestionId].responses.length ===0) {
        resid = -1
      }else{
        resid = list[currentQuestionId].responses.length -1
      }
      let res={
        id: ++resid,
        name: rspname,
        response: responseValue,
        likes: 0,
        dislikes: 0
      }
      list[currentQuestionId].responses.push(res)
     postRequest({id:currentQuestionId,response: res}, '/addresponse')
      const newResponse = document.createElement('li')
      newResponse.className = 'responses-list'
      newResponse.id=resid;
      newResponse.innerHTML = `
           <div class="resp-div"> <span class="resp-name">${rspname}:</span>${responseValue}</div>
            <hr> 
            <div class="action-buttons">
            <span class='like-btn'>👍</span>
            <span class='like-count'>0</span>
            <span class='dislike-btn'>👎</span>
            <span class='dislike-count'>0</span>
            </div>`
      responselist.insertBefore(newResponse,responselist.firstChild)
      response.value = ''
    }
  } else {
    alert('Please fill in all fields')
  }
}
function actionResponse(e){
  if(e.target.classList.contains("like-btn")){
    e.target.nextElementSibling.innerHTML=Number(e.target.nextElementSibling.innerHTML)+1;
    let resId=e.target.closest("li").id;
    list[openid].responses.find(elem=> elem.id==resId).likes++;
    postRequest({id:openid,resid:resId},"/like")
    reloadResponses();
  }
  if(e.target.classList.contains("dislike-btn")){
    e.target.nextElementSibling.innerHTML=Number(e.target.nextElementSibling.innerHTML)+1;
    let resId=e.target.closest("li").id;
    list[openid].responses.find(elem=> elem.id==resId).dislikes++;
    postRequest({id:openid,resid:resId},"/dislike")
    reloadResponses();
  }
}
function reloadResponses(){
  responselist.innerHTML = ''
  if (list[openid].responses) {
    list[openid].responses.sort((a,b)=>{
      if((a.likes-a.dislikes)>(b.likes-b.dislikes)){
        return -1;
      }
      if((a.likes-a.dislikes)<(b.likes-b.dislikes)){
        return 1;
      }
      return 0;
    })
    list[openid].responses.forEach(response => {
      const responseHtml = `<li class="responses-list" id=${response.id}>
         <div class="resp-div"> <span class="resp-name">${response.name}:</span>${response.response}</div>
          <hr> 
          <div class="action-buttons">
          <span class='like-btn'>👍</span>
          <span class='like-count'>${response.likes}</span>
          <span class='dislike-btn'>👎</span>
          <span class='dislike-count'>${response.dislikes}</span>
          </div></li>`
      responselist.innerHTML += responseHtml
    })
  }
}

function toggleForm () {
  formSection.style.display = 'flex'
  responseSection.style.display = 'none'
  openid = null
}

function toggleResponseSection () {
  formSection.style.display = 'none'
  responseSection.style.display = 'block'
}

async function deleteQuestion () {
  if (openid) {
    delete list[openid]
    await postRequest({id:openid}, '/deleteQues')
    openid = null
    toggleForm()
    questionList.innerHTML = ''
    await loadQuestions()
  }
  if (!Object.keys(list).length) {
    headques.innerText = 'No Questions available'
    id = -1
    await postRequest({ id: id }, '/id')
  }
}

async function loadQuestions () {
  if (Object.keys(list).length) {
    headques.innerText = 'All questions'
    for (const key in list) {
      const li = document.createElement('li')
      questionList.appendChild(li)
      li.className = 'questions-list'
      li.id = key
      li.innerHTML = `<div class="ques-head-part"><h1 class="subject-head">${
        list[key].subject
      } </h1>
                <div><span class='time' timestamp='${
                  list[key].time
                }'>just now</span><span class='star'>${
        list[key].star ? '⭐️' : '☆'
      }</span></div></div>
                <hr><p class="subject-head">${list[key].question} </p>`
      id = JSON.parse(key)
    }
    await postRequest({ id: id }, '/id')
  }
  reorderQuestions()
}

function reorderQuestions () {
  const favoriteQuestions = Object.keys(list).filter(id => list[id].star)
  const nonFavoriteQuestions = Object.keys(list).filter(id => !list[id].star)

  questionList.innerHTML = ''
  favoriteQuestions.forEach(id => {
    const li = document.createElement('li')
    questionList.appendChild(li)
    li.className = 'questions-list'
    li.id = id
    li.innerHTML = `<div class="ques-head-part"><h1 class="subject-head">${list[id].subject} </h1>
        <div><span class='time' timestamp='${list[id].time}'></span><span class='star'>⭐️</span> </div></div>
        <hr><p class="subject-head">${list[id].question} </p>`
  })

  nonFavoriteQuestions.forEach(id => {
    const li = document.createElement('li')
    questionList.appendChild(li)
    li.className = 'questions-list'
    li.id = id
    li.innerHTML = `<div class="ques-head-part"><h1 class="subject-head">${list[id].subject} </h1>
        <div><span class='time' timestamp='${list[id].time}'>just now</span><span class='star'>☆</span> </div></div>
        <hr><p class="subject-head">${list[id].question} </p>`
  })
}
function updateTime () {
  const timer = document.querySelectorAll('.time')
  timer.forEach(function (element) {
    element.innerText = timerx()
    function timerx () {
      let time = Date.now()
      let duration = time - element.getAttribute('timestamp')
      if (duration < 10000) {
        return 'just now'
      } else if (duration < 60000) {
        return `${Math.floor(duration / 1000)} seconds ago`
      } else if (duration < 3600000) {
        return `${Math.floor(duration / 60000)} minutes ago`
      } else if (duration < 86400000) {
        return `${Math.floor(duration / 3600000)} hours ago`
      } else {
        return `${Math.floor(duration / 86400000)} days ago`
      }
    }
  })
}
 function addFavourites (e) {
  let questionid
  if (e.target.classList.contains('star')) {
    questionid = e.target.closest('li').id
    if (!list[questionid].star) {
      list[questionid].star = true
    } else {
      list[questionid].star = false
    }

    e.target.innerText = list[questionid].star ? '⭐️' : '☆'
     postRequest({id:questionid}, '/star')
    reorderQuestions()
  } else if (e.target.closest('li')) {
    displayQuestion(e)
  }
}

updateTime()
setInterval(updateTime, 100)
