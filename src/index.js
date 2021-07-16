const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const itExists = users.some(usuario => usuario.username === username)

  if(!itExists) { return response.status(404).json({error: "user does not exist"})}

  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const itExists = users.some(usuario => usuario.username === username)

  if(itExists) { return response.status(400).json({error: "username already exists"})}

  const user = { 
    id: uuidv4(),
    name: name, 
    username: username, 
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const foundUser = users.find(userToFilter => userToFilter.username === username)

  return response.json(foundUser.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {username} = request.headers

  const todo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  users.forEach(userToCheck => {
    if (userToCheck.username === username) {
        userToCheck.todos.push(todo);
      }
    })
    return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {username} = request.headers
  const {id} = request.params

  users.forEach(userToCheck => {
    if (userToCheck.username === username) {
      userToCheck.todos.forEach(todoToCheck => {
        if (todoToCheck.id === id) {
            if(title) {todoToCheck.title = title}
            if(deadline) {todoToCheck.deadline = new Date(deadline)}
            return response.status(200).json(todoToCheck)
        }
      })
        return response.status(404).json({error: "this todo id does not exist"})
    }
  })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {id} = request.params

  users.forEach(userToCheck => {
    if (userToCheck.username === username) {
      userToCheck.todos.forEach(todoToCheck => {
        if (todoToCheck.id === id) {
            todoToCheck.done = true
            return response.status(200).json(todoToCheck)
        }
      })
        return response.status(404).json({error: "this todo id does not exist"})
    }
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const {id} = request.params
  let status = 500 

  users.forEach(userToCheck => {
    if (userToCheck.username === username) {
      const findedTodoindex = userToCheck.todos.findIndex((todoToCheck) => todoToCheck.id === id)
      if (findedTodoindex === -1) {
        return response.status(404).json({error: "this todo id does not exist"})
      }
      userToCheck.todos.splice(findedTodoindex, 1)
      return response.status(204).send()
    }
  })
});

module.exports = app;