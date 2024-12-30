import { Sequelize } from "sequelize-typescript";
import Message from "../models/Message";
import User from "../models/User";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Setting from "../models/Setting";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import { v4 as uuidv4 } from 'uuid';  // Importando a função para gerar UUIDs

const bodys = [
    "café", "ação", "árvore", "pingüim", "pão",
    "maçã", "fórmula", "técnico", "história", "avó"
];

const sequelize = new Sequelize({
    dialect: "postgres",
    host: "localhost",  
    username: `postgres`, 
    password: `290517`,  
    database: `Desafio`,  
    models: [User, Contact, Ticket, Message, Whatsapp, ContactCustomField, Setting, Queue, WhatsappQueue, UserQueue, QuickAnswer],
});

async function generateMessages(numMessages: number) {

    const messages: Partial<Message>[] = [];

    for (let i = 0; i < numMessages; i++) {

        const body = `Mensagem de teste com acentuação: ${bodys[i % bodys.length]} ` +
            `${bodys[(i + 1) % bodys.length]} e ` +
            `${bodys[(i + 2) % bodys.length]}.`;

        const messageId = uuidv4();

        messages.push({
            id: messageId,  
            ack: 0,
            read: false,
            fromMe: true,
            body: body,
            mediaUrl: null,
            mediaType: "chat",
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            quotedMsgId: undefined, 
            ticketId: 1,
            contactId: 1,
        });
    }

 
    await Message.bulkCreate(messages, {
        validate: true,
        ignoreDuplicates: true,
    });
    console.log(`Inseridos ${numMessages} registros`);
}

async function main() {
    try {
        const batchSize = 10000;
        const numMessages = 1000000;

        for (let i = 0; i < numMessages; i += batchSize) {
            const batch = Math.min(batchSize, numMessages - i);
            console.log(`Inserindo lote de ${batch} registros...`);
            await generateMessages(batch);
        }

        console.log("Inserção de dados concluída.");
        await sequelize.close();
    } catch (error) {
        console.error("Erro ao conectar ou inserir dados:", error);
    }
}

main();
