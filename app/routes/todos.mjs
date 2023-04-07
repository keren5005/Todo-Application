/**
 * @name todos
 * This is our core API's for our todo list data
 */

import { Router } from 'express'

let route = Router();

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
    console.log(req)
    res
        .status(500)
        .json({
            error: 'Endpoint is not implemented'
        })
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
