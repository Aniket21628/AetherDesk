"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticketController_1 = require("../controllers/ticketController");
const getTicketById = require('../controllers/ticketController').getTicketById;
const router = express_1.default.Router();
router.post('/', ticketController_1.createTicket);
router.get('/', ticketController_1.getTickets);
router.get('/:id', getTicketById);
router.put('/:id/status', ticketController_1.updateTicketStatus);
exports.default = router;
