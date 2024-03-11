import * as contactsServices from "../services/contactsServices.js";

import HttpError from '../helpers/HttpError.js';

import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js"

export const getAllContacts = async (req, res) => {
    try {
        const result = await contactsServices.listContacts();
        res.json(result);
    }
    catch (error) {
        next(error)
    }
};

export const getOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contactsServices.getContactById(id);
        if (!result) {
            throw HttpError(404, `Contact with id=${id} not found`);
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contactsServices.removeContact(id);
        if (!result) {
            throw HttpError(404, `Contact with id=${id} not found`);
        }


        res.json({
            message: "Delete success"
        })
    }
    catch (error) {
        next(error);
    }
};

export const createContact = async (req, res) => {
    try {
        const { error } = createContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }
        const result = await contactsServices.addContact(req.body);

        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res) => {
    try {
        const { error } = updateContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }


        const { id } = req.params;
        const result = await contactsServices.updateContact(id, req.body);
        if (!result) {
            throw HttpError(404, `Contact with id=${id} not found`);
        }

        res.json(result);
    }
    catch (error) {
        next(error);
    }
};

