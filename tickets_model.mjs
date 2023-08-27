/* tickets_model.mjs
Model for tickets in the database
Uses mongoose to connect to MongoDB
*/

import mongoose from 'mongoose';
import 'dotenv/config';
import { response } from 'express';

mongoose.connect(
    process.env.MONGODB_CONNECT_STRING,
    {dbName: 'tickets'},
    { useNewUrlParser: true }
);

// Connect to to the database
const db = mongoose.connection;
// The open event is called when the database connection successfully opens
db.once("open", () => {
    console.log("Successfully connected to tickets using Mongoose!");
});

// Schema
const ticketSchema = mongoose.Schema({
    cust_name : {type: String, required: true},
    date : {type: String, required: true},
    time: {type: String, required: true},
    ticket_items : {type: Array, required: true},
    promo_code: {type: String, required: true},
    active: {type: Boolean, required: true}
});

// Compile model from the Schema
const Ticket = mongoose.model("Ticket", ticketSchema);

// Create
const addTicket = async (cust_name, date, time, ticket_items, promo_code, active) => {
    const ticket = new Ticket({cust_name: cust_name, 
        date: date,
        time: time,  
        ticket_items: ticket_items,
        promo_code: promo_code, 
        active: active});
    return ticket.save();
}

// Retrieve all tickets (regardless of active status)
const getAllTickets = async() => {
    const query = Ticket.find();
    return query.exec();
}

// Retrieve active tickets
const getActiveTickets = async() => {
    const query = Ticket.find({"active" : true});
    return query.exec();
}

// Retrieve one ticket by id
const getOneTicket = async(id) => {
    const query = Ticket.findById(id);
    return query.exec();
}

// Toggle active status for a single ticket
const toggleActiveStatus = async(id) => {
    const query = Ticket.findById(id);
    const ticket = await query.exec();

    if (ticket.active) {
        const result = Ticket.findByIdAndUpdate(id, {active: 'false'}, {new: true});
        return result;
    } else {
        const result = Ticket.findByIdAndUpdate(id, {active: 'true'}, {new: true});
        return result;
    }
}

// Update items in a ticket
const updateTicketItems = async(id, updates) => {
    const result = Ticket.findByIdAndUpdate(id, updates, {new: true});
    return result;
}

// Delete a ticket
const deleteTicket = async(id) => {
    const result = Ticket.findByIdAndDelete(id);
    return result;
}

// Micro service handling
// count all tickets that have used a particular promo code
const promoCodeCount = async(code) => {
    const result = Ticket.countDocuments({"promo_code": code});
    return result;
}

export {addTicket, getAllTickets, getActiveTickets, getOneTicket, toggleActiveStatus, updateTicketItems, promoCodeCount, deleteTicket}