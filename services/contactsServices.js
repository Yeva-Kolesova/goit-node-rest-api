import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const contactsPath = path.resolve('db', 'contacts.json');

const updateContacts = contacts => fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

export async function listContacts() {
    const buffer = await fs.readFile(contactsPath);
    return JSON.parse(buffer);
}

export async function getContactById(contactId) {
    const contacts = await listContacts();
    const result = contacts.find(item => item.id === contactId);
    return result || null;
}

export async function removeContact(contactId) {
    const contacts = await listContacts();
    const index = contacts.findIndex(item => item.id === contactId);
    if (index === -1) {
        return null;
    }
    const [result] = contacts.splice(index, 1);
    await updateContacts(contacts);
    return result;
}

export async function addContact(name, email, phone) {
    const contacts = await listContacts();
    const newContact = {
        id: nanoid(),
        name: name,
        email: email,
        phone: phone,
    }
    contacts.push(newContact);
    await updateContacts(contacts);
    return newContact;
}

export async function updateContact(id, body) {
    const contacts = await listContacts();

    const index = contacts.findIndex((contact) => contact.id === id);

    if (index === -1) {
        return null;
    }

    contacts[index] = { ...contacts[index], ...body };
    await updateContacts(contacts);

    return contacts[index];
}