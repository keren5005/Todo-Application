/**
 * @name health
 * This module is for sanity checks
 */

import { Router } from 'express'

let route = Router();

// This is a sanity endpoint used to check that the server is up and running.
route.get('/health', (req,res,next) => {
    res
        .status(200)
        .send('OK')
})

export default route;