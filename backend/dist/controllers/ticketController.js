"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.getTicketById = exports.getTickets = exports.createTicket = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient")); // Assuming you have a Prisma client instance set up
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, priority, createdBy } = req.body;
    try {
        const ticket = yield prismaClient_1.default.ticket.create({
            data: {
                title,
                description,
                priority,
                status: 'open',
                createdBy,
            },
        });
        res.status(201).json({ ticket });
    }
    catch (error) {
        res.status(500).json({ error: 'Could not create ticket' });
    }
});
exports.createTicket = createTicket;
const getTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield prismaClient_1.default.ticket.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        res.json({ tickets });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});
exports.getTickets = getTickets;
// Get ticket by id
const getTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = Number(req.params.id);
    try {
        const ticket = yield prismaClient_1.default.ticket.findUnique({
            where: { id: ticketId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json({ ticket });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});
exports.getTicketById = getTicketById;
// Update ticket status
const updateTicketStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = Number(req.params.id);
    const { status } = req.body;
    try {
        const updatedTicket = yield prismaClient_1.default.ticket.update({
            where: { id: ticketId },
            data: { status },
        });
        res.json({ ticket: updatedTicket });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update ticket status' });
    }
});
exports.updateTicketStatus = updateTicketStatus;
