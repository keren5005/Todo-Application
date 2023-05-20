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
        req.todoLogger.info(`Total TODOs count for state ${status} is ${totalSizeTodos}`,{
            requestNumber: req.requestNumber
        })
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
    if(!['LATE','DONE','ALL','PENDING'].includes(status)) {
        response.status(400).json()
    } else if(!['ID','DUE_DATE','TITLE',undefined].includes(sortBy)) {
        response.status(400).json()
    } else {
        req.todoLogger.info(`Extracting todos content. Filter: ${status} | Sorting by: ${sortBy}`,{
            requestNumber: req.requestNumber
        })
        const todosFiltered = [...todosData._data]
        .filter(todo => status === 'ALL' ? true : todo.status === Statuses[status])
        .map(todo => ({
            ...todo,
            status: todo.status === Statuses.DONE ? 'DONE' : todo.status === Statuses.LATE ? 'LATE' : todo.status === Statuses.PENDING ? 'PENDING' : 'UNKNOWN',
            dueDate: new Date(todo.dueDate).getTime()
        }));
        req.todoLogger.debug(`There are a total of ${todosData._data.length} todos in the system. The result holds ${todosFiltered.length} todos`,{
            requestNumber: req.requestNumber
        })
        response
            .status(200)
            .json(
                todosFiltered
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
        let errMsg = `Error: TODO with the title [${title}] already exists in the system`;
        req.todoLogger.error(`Error: ${errMsg}`,{
            requestNumber: req.requestNumber
        })
        // Fail same title error (already exists)
        res
            .status(409)
            .json({
                result: undefined,
                errorMessage: errMsg
            })
    } else if(new Date(dueDate).getTime() <= new Date().getTime()) {
        let errMsg = `Error: Can\’t create new TODO that its due date is in the past`;
        req.todoLogger.error(`Error: ${errMsg}`,{
            requestNumber: req.requestNumber
        })

        // Fail due date is in the past
        res
            .status(409)
            .json({
                result: undefined,
                errorMessage: errMsg
            })
    } else {
        
        // Success
        let newTodo = new Todo(
            todosData._data.length + todosData._deleted.length + 1,
            title,
            content,
            new Date(dueDate)
        );
        req.todoLogger.info(`Creating new TODO with Title [${title}]`,{
            requestNumber: req.requestNumber
        })
        req.todoLogger.debug(`Currently there are ${todosData._data.length} TODOs in the system. New TODO will be assigned with id ${newTodo.id}`,{
            requestNumber: req.requestNumber
        })
        todosData.addTodo(newTodo)
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
    req.todoLogger.info(`Update TODO id [${id}] state to ${status}`,{
        requestNumber: req.requestNumber
    })
    if(!['LATE','DONE','PENDING'].includes(status)) {
        res.status(400).json()
    } else {
        let todo = [...todosData._data].find(todo => todo.id === Number(id));
        if(todo) {
            const oldStatus = todo.status;
            req.todoLogger.debug(`Todo id [${id}] state change: ${oldStatus} --> ${status}`,{
                requestNumber: req.requestNumber
            })
            todo.status = Statuses[status];
            res
                .status(200)
                .json({
                    result: oldStatus === Statuses.PENDING ? 'PENDING' : oldStatus === Statuses.DONE ? 'DONE' : oldStatus === Statuses.LATE ? 'LATE' : 'UNKNOWN'
                })
        } else {
            let errMsg = `Error: no such TODO with id ${id}`;
            req.todoLogger.error(`Error: ${errMsg}`,{
                requestNumber: req.requestNumber
            })
            res.status(404).json({
                errorMessage: errMsg
            })
        }
    }
})

// Deletes a TODO object.
route.delete('/', (req,res,next) => {
    const { id } = req.query;
    let deletedTodo = [...todosData._data].find(todo => todo.id === Number(id))
    if(deletedTodo) {
        req.todoLogger.info(`Removing todo id ${id}`,{
            requestNumber: req.requestNumber
        })
        todosData.delete(deletedTodo);
        req.todoLogger.debug(`After removing todo id [{todo ID}] there are ${todosData._data.length} TODOs in the system`, {
            requestNumber: req.requestNumber
        })
        res.status(200).json({
            result: todosData._data.length
        })
    } else {
        let errMsg = `Error: no such TODO with id ${id}`;
        res.status(400).json({
            errorMessage: errMsg
        });
    }
})

module.exports = {
    route
};
