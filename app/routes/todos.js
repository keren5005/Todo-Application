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
route.get('/size', async (req,res,next) => {
    const { status , persistenceMethod }  = req.query;
    let totalSizeTodos = 0;
    if(!['LATE','DONE','ALL','PENDING'].includes(status)) {
        res.status(400).json()
    } else {
        // if(status === undefined || status === 'ALL') {
        //     totalSizeTodos = todosData._data.length;
        // } else {
            // TODO: fetch size from relevant persistance method
        totalSizeTodos = await todosData.size(persistenceMethod, status)
            // todosData._data.forEach(todo => {
            //     if(todo.status === Statuses[status]) {
            //         totalSizeTodos += 1
            //     }
            // })
        // }
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
route.get('/content', async (req,response,next) => {
    let { status , sortBy, persistenceMethod  } = req.query;
    if(!['LATE','DONE','ALL','PENDING'].includes(status)) {
        response.status(400).json()
    } else if(!['ID','DUE_DATE','TITLE',undefined].includes(sortBy)) {
        response.status(400).json()
    } else {
        // TODO: fetch content from relevant persistance method
        req.todoLogger.info(`Extracting todos content. Filter: ${status} | Sorting by: ${sortBy}`,{
            requestNumber: req.requestNumber
        })
        try {
            
            let data = await todosData.list(persistenceMethod, status);
            data = data
                .map(todo => ({
                    id: todo.rawid,
                    title: todo.title,
                    content: todo.content,
                    status: todo.state === Statuses.DONE ? 'DONE' : todo.state === Statuses.LATE ? 'LATE' : todo.state === Statuses.PENDING ? 'PENDING' : todo.state,
                    dueDate: new Date(Number(todo.duedate)).getTime()
                }));
                // .filter(todo => status === 'ALL' ? true : todo.status === Statuses[status])
                
            req.todoLogger.debug(`There are a total of ${todosData._data.length} todos in the system. The result holds ${data.length} todos`,{
                requestNumber: req.requestNumber
            })
            response
                .status(200)
                .json(
                    data
                    .sort(
                        (a,b) => sortBy === undefined || sortBy === 'ID'
                        ? a.id - b.id 
                        : sortBy === 'DUE_DATE' 
                        ? a.dueDate - b.dueDate 
                        : sortBy === 'TITLE' 
                        ? a.title.localeCompare(b.title) : -1 )
                )
        } catch (error) {
            response
                .status(500)
                .json({
                    message: `Internal server error: ${error}`
                })

        }
    }
})

// Creates a new TODO item in the system.
route.post('/', async (req,res,next) => {
    const { title, content, dueDate } = req.body;
    let currentList = await todosData.list("POSTGRES", "ALL");
    if(
        currentList
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
        let size = await todosData.size("POSTGRES", "ALL");
        // Success
        let newTodo = new Todo(
            size + 1,
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
        // Saving the new TODO into DB's
        await todosData.addTodo(newTodo);
        res
            .status(200)
            .json({
                result: newTodo.id,
                errorMessage: undefined
            })
    }
})

// Updates todo status property 
route.put('/', async (req,res,next) => {
    const { id, status } = req.query;
    req.todoLogger.info(`Update TODO id [${id}] state to ${status}`,{
        requestNumber: req.requestNumber
    })
    if(!['LATE','DONE','PENDING'].includes(status)) {
        res.status(400).json()
    } else {
        let todo = await todosData.get(id);
        if(todo) {
            const oldStatus = todo.state;
            req.todoLogger.debug(`Todo id [${id}] state change: ${oldStatus === Statuses.PENDING ? 'PENDING' : oldStatus === Statuses.DONE ? 'DONE' : oldStatus === Statuses.LATE ? 'LATE' : oldStatus} --> ${status}`,{
                requestNumber: req.requestNumber
            })
            await todosData.updateTodo(id, status);
            res
                .status(200)
                .json({
                    result: oldStatus === Statuses.PENDING ? 'PENDING' : oldStatus === Statuses.DONE ? 'DONE' : oldStatus === Statuses.LATE ? 'LATE' : oldStatus
                })
        } else {
            let errMsg = `Error: no such TODO with id ${id}`;
            req.todoLogger.error(`${errMsg}`,{
                requestNumber: req.requestNumber
            })
            res.status(404).json({
                errorMessage: errMsg
            })
        }
    }
})

// Deletes a TODO object.
route.delete('/', async (req,res,next) => {
    const { id } = req.query;
    let data = await todosData.list("POSTGRES", "ALL");
    let deletedTodo = data.find(todo => todo.rawid === Number(id))
    if(deletedTodo) {
        req.todoLogger.info(`Removing todo id ${id}`,{
            requestNumber: req.requestNumber
        })
        await todosData.delete(deletedTodo);
        req.todoLogger.debug(`After removing todo id [${id}] there are ${todosData._data.length} TODOs in the system`, {
            requestNumber: req.requestNumber
        })
        let size = await todosData.size("POSTGRES", "ALL");
        res.status(200).json({
            result: size
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
