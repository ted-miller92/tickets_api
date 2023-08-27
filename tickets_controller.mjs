/* tickets_controller.mjs
Server controller file, handles API calls with express
*/

import 'dotenv/config';
import * as tickets from './tickets_model.mjs';
import * as items from './items_model.mjs';
import express from 'express';
import {check, validationResult} from 'express-validator';
import asyncHandler from 'express-async-handler';
import cors from 'cors';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use(cors());

// create a new ticket
app.post('/api/tickets', [
    // Validation
    check('cust_name', 'Name (in string format) required').notEmpty(),
    check('ticket_items', 'Ticket Items required').notEmpty().isArray({min: 1}),
    check('promo_code', 'Promo code field required (even if empty)').notEmpty(),
    check('active', 'Active status required').notEmpty()
    ], 
    asyncHandler(async (req, res) => {
        // store result of validation in validationResult object
        const errors = validationResult(req);

        if (!errors.isEmpty()){
            // log errors to API console
            console.log(errors);

            // send errors to client
            res.status(400).json({errors: errors.array()});
        } else {
            // Date and time are automatically generated
            const current_date = new Date();
            const date_string = current_date.toDateString()
            const time_string = current_date.toLocaleTimeString();

            // request body includes all ticket parameters
            const ticket = await tickets.addTicket(req.body.cust_name, 
                date_string, time_string, req.body.ticket_items, 
                req.body.promo_code, req.body.active);
            
            // response 201 (Created)
            res.status(201).send(ticket);
        }
    }
));

// retrieve all tickets regardless of active status
app.get('/api/tickets', asyncHandler (async (req, res) => {
    if (req.query.code){
        // Microservice Handling
        // If there is a promo code in the query URL, it will call a different 
        // function in the API model to count the number of tickets that use a 
        // specified promo code
        const promoCode = req.query.code
        console.log(`Searching for tickets that use promo code ${promoCode}`)
        const result = await tickets.promoCodeCount(promoCode);
        res.send({"quantity" : result});
    } else {
        // This gets all tickets
        const result = await tickets.getAllTickets();
        res.json(result);
    }
}));

// retrieve only active tickets
app.get('/api/active_tickets', asyncHandler (async (req, res) => {
    const result = await tickets.getActiveTickets();
    res.send(result);
}));

// retrieve ticket by id
app.get('/api/tickets/:_id', asyncHandler (async (req, res) => {
    const result = await tickets.getOneTicket(req.params._id);
    res.send(result);
}))

// toggle active status for one ticket
app.put('/api/tickets/toggle_active/:_id', asyncHandler (async (req, res) => {
    const result = await tickets.toggleActiveStatus(req.params._id);
    res.send(result);
}));

// update ticket items
app.put('/tickets/:_id', asyncHandler (async (req, res) => {
    const updates = req.body;
    const result = await tickets.updateTicketItems(req.params._id, updates);

    res.send(result);
}));

// delete a ticket
app.delete('/api/tickets/:_id', asyncHandler (async (req, res) => {
    console.log("Deleting?");
    const result = await tickets.deleteTicket(req.params._id);

    if (!result) {
        res.status(404).json({Error: "Not Found"});
    } else {
        res.status(204).send(result);
    }
}));

// create a new item
app.post('/api/items', asyncHandler( async (req, res) => {
    const item = await items.addItem(req.body.item_name, req.body.price, req.body.sold_out);
    res.status(201).send(item);
}));

// get all items
app.get('/api/items', asyncHandler (async (req, res) => {
    const result = await items.getAllItems();
    res.send(result);
}));

// get all available items
app.get('/api/available_items', asyncHandler (async (req, res) => {
    const result = await items.getAvailableItems();
    res.send(result);
}));

// toggle sold out status for one item
app.put('/api/items/toggle_sold_out/:_id', asyncHandler (async (req, res) => {
    const result = await items.toggleSoldOutStatus(req.params._id);
    res.send(result);
}));

// delete an item
app.delete('/api/items/:_id', asyncHandler (async (req, res) => {
    const result = await items.deleteItem(req.params._id);
    
    if (!result) {
        res.status(404).json({Error: "Not found"});
    } else {
        res.status(204).send(result);
    }
}));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});