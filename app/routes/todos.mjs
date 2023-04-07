/**
 * @name todos
 * This is our core API's for our todo list data
 */

import { Router } from 'express'
import { Todo } from '../api/todo.mjs';

let route = Router();

// Our "DataBase" for todos
let todosData = [];

// Returns the total number of TODOs in the system, according to the given filter.
route.get('/size', (req,res,next) => {
    console.log(req)
    res
        .status(500)
        .json({
            error: 'Endpoint is not implemented'
        })
})

// Returns the content of the todos according to the supplied status
route.get('/content', (req,res,next) => {
    console.log(req)
    res
        .status(500)
        .json({
            error: 'Endpoint is not implemented'
        })
})

// Creates a new TODO item in the system. 
route.post('/', (req,res,next) => {
    const { title, content, dueDate } = req.body;

    if(
        todosData
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
    } else if(new Date(dueDate).getTime <= new Date().getTime()) {
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
            todosData.length+1,
            title,
            content,
            new Date(dueDate)
        );
        todosData.push(newTodo)
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

export default route;
