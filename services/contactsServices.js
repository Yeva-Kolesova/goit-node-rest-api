import Contact from "../models/Contact.js";

export function listContacts() {
    return Contact.find();
}

export function listContactsByFilter(filter, query) {
    return Contact.find(filter, "", query);
}

export function getContactById(id) {
    return Contact.findById(id);
}

export function getContactByFilter(filter) {
    return Contact.findOne(filter);
}

export function removeContact(id) {
    return Contact.findByIdAndDelete(id);
}

export function removeContactByFilter(filter) {
    return Contact.findOneAndDelete(filter);
}

export function addContact(body) {
    return Contact.create(body);
}

export function updateContact(id, body) {
    return Contact.findByIdAndUpdate(id, body);
}

export function updateContactByFilter(filter, data) {
    return Contact.findOneAndUpdate(filter, data);
}

export function updateStatus(id, body) {
    return Contact.findByIdAndUpdate(id, body);
}

export function updateStatusContactByFilter(filter, data) {
    return Contact.findOneAndUpdate(filter, data);
}