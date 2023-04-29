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
    // new Todo(4,'Test Pending','this is some test',new Date('2023-05-20')),
    // new Todo(1,'Test todo','this is some test',new Date('2023-04-24')),
    // new Todo(2,'Test Full','I love ful',new Date('2023-04-20')),
    // new Todo(3,'Bigo <3 Full','We all love ful',new Date('2023-04-13')),
    // new Todo(5,'a','this is some test',new Date('2023-05-20')),
    // new Todo(6,'b','this is some test',new Date('2023-05-20')),

]);

// Returns the total number of TODOs in the system, according to the given filter.
route.get('/size', (req,res,next) => {
    const { status }  = req.query;
    let totalSizeTodos = 0;
    if(!['LATE','DONE','ALL','PENDING'].includes(status)) {
        res.status(400).json()
    } else {
        if(status === undefined || status === 'ALL') {
            totalSizeTodos = todosData._data.length;
        } else {
            todosData._data.forEach(todo => {
                if(todo.status === Statuses[status]) {
                    totalSizeTodos += 1
                }
            })
        }
        res
            .status(200)
            .json({
                result: totalSizeTodos,
                errorMessage: undefined
            })
    }
})

// Returns the content of the todos according to the supplied status
route.get('/content', (req,response,next) => {
    let { status , sortBy } = req.query;
    status = status === undefined ? 'ALL' : status;
    if(!['LATE','DONE','ALL','PENDING'].includes(status)) {
        response.status(400).json()
    } else if(!['ID','DUE_DATE','TITLE',undefined].includes(sortBy)) {
        response.status(400).json()
    } else {
        response
            .status(200)
            .json(
                [...todosData._data]
                .filter(todo => status === 'ALL' ? true : todo.status === Statuses[status])
                .map(todo => ({
                    ...todo,
                    status: todo.status === Statuses.DONE ? 'DONE' : todo.status === Statuses.LATE ? 'LATE' : todo.status === Statuses.PENDING ? 'PENDING' : 'UNKNOWN',
                    dueDate: new Date(todo.dueDate).getTime()
                }))
                .sort(
                    (a,b) => sortBy === undefined || sortBy === 'ID'
                    ? a.id - b.id 
                    : sortBy === 'DUE_DATE' 
                    ? a.dueDate - b.dueDate 
                    : sortBy === 'TITLE' 
                    ? a.title.localeCompare(b.title) : -1 )
            )
    }
})

// Creates a new TODO item in the system.
route.post('/', (req,res,next) => {
    const { title, content, dueDate } = req.body;
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
    } else if(new Date(dueDate).getTime() <= new Date().getTime()) {
        // Fail due date is in the past
        res
            .status(409)
            .json({
                result: undefined,
                errorMessage: `Error: Can\’t create new TODO that its due date is in the past`
            })
    } else {
        
        // Success
        let newTodo = new Todo(
            todosData._data.length + todosData._deleted.length + 1,
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
    const { id, status } = req.query;
    if(!['LATE','DONE','PENDING'].includes(status)) {
        res.status(400).json()
    } else {
        let todo = [...todosData._data].find(todo => todo.id === Number(id));
        if(todo) {
            const oldStatus = todo.status;
            console.log(oldStatus)
            todo.status = Statuses[status];
            res
                .status(200)
                .json({
                    result: oldStatus === Statuses.PENDING ? 'PENDING' : oldStatus === Statuses.DONE ? 'DONE' : oldStatus === Statuses.LATE ? 'LATE' : 'UNKNOWN'
                })
        } else {
            res.status(404).json({
                errorMessage: `Error: no such TODO with id ${id}`
            })
        }
    }
})

// Deletes a TODO object.
route.delete('/', (req,res,next) => {
    const { id } = req.query;
    let deletedTodo = [...todosData._data].find(todo => todo.id === Number(id))
    if(deletedTodo) {
        todosData.delete(deletedTodo);
        res.status(200).json({
            result: todosData._data.length
        })
    } else {
        res.status(400).json({
            errorMessage: `Error: no such TODO with id ${id}`
        });
    }
})

module.exports = {
    route
};
