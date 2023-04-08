/**
 * @name todos
 * This is our core API's for our todo list data
 */

import { Router } from 'express'
import { Todo, TodosList } from '../api/todo.mjs';

let route = Router();

// Our "DataBase" for todos
let todosData = new TodosList([
    new Todo(1,'Test todo','this is some test',new Date('2023-04-20'))
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
route.get('/content/:id', (req,res,next) => {
    const {id} = req.params; 

    res
        .status(200)
        .json({
            result: todosData.search(id),
            errorMessage: undefined
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
