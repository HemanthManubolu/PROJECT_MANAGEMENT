import type { RequestHandler } from 'express';
import { clientService } from '../services/client.service.js';
import { ok } from '../utils/response.js';
export const listClients: RequestHandler = async (_request, response) => ok(response, await clientService.list());
export const getClient: RequestHandler = async (request, response) => ok(response, await clientService.get(String(request.params.id)));
export const createClient: RequestHandler = async (request, response) => ok(response, await clientService.create(request.body), 201);
export const updateClient: RequestHandler = async (request, response) => ok(response, await clientService.update(String(request.params.id), request.body));
export const deleteClient: RequestHandler = async (request, response) => { await clientService.remove(String(request.params.id)); response.status(204).send(); };

