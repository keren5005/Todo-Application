/**
 * @name todos
 * This is our core API's for our todo list data
 */

const  Router = require('express');
const { Todo, TodosList, Statuses } = require('../api/todo.js');

let route = Router();

// Our "DataBase" for todos
let todosData = new TodosList([
    // Seed data
    new Todo(1,'Test todo','this is some test',new Date('2023-04-20')),
    new Todo(2,'Test Full','I love ful',new Date('2023-04-20')),
    new Todo(3,'Bigo <3 Full','We all love ful',new Date('2023-04-20'))
]);

// Returns the total number of TODOs in the system, according to the given filter.
route.get('/size', (req,res,next) => {
    res
        .status(200)
        .json({
            result: todosData.todos.size,
            errorMessage: undefined
        })
})

// Returns the content of the todos according to the supplied status
route.get('/content', (req,res,next) => {
    let {status} = req.query;
    status = status === undefined ? 'ALL' : status;
    res
        .status(200)
        .json({
            result: [...todosData.todos].filter(todo => status === 'ALL' ? true : todo.status === status),
            errorMessage: undefined
        })
})

// Creates a new TODO item in the system. 
route.post('/', (req,res,next) => {
    const { title, content, dueDate } = req.body;
    console.log(req.body)
    if(
        todosData._data
            .map(todo => todo.title)
            .includes(title)
    ) {
        // Fail same title error (already exists)
        res
            .status(409)
            .json({
                result: undefined,
                errorMessage: `Error: TODO with the title [${title}] already exists in the system`
            })
    } 
    else if(new Date(dueDate).getTime() <= new Date().getTime()) {
        // Fail due date is in the past
        res
            .status(409)
            .json({
                result: undefined,
                errorMessage: `Error: Can\’t create new TODO that its due date is in the past`
            })
    }  else {
        
        // Success
        let newTodo = new Todo(
            todosData._data.length+1,
            title,
            content,
            new Date(dueDate)
        );
        todosData.addTodo(newTodo)
        // console.log(newTodo)
        res
            .status(200)
            .json({
                result: newTodo.id,
                errorMessage: undefined
            })
    }
})

// Updates todo status property 
route.put('/', (req,res,next) => {
    console.log(req)
    res
        .status(500)
        .json({
            error: 'Endpoint is not implemented'
        })
})

// Deletes a TODO object.
route.delete('/', (req,res,next) => {
    console.log(req)
    res
        .status(500)
        .json({
            error: 'Endpoint is not implemented'
        })
})

module.exports = {
    route
};
