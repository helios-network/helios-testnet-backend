"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
mongoose_1.default.set('strictQuery', false);
const connect = async () => {
    try {
        const conn = await mongoose_1.default.connect(index_1.default.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
exports.connect = connect;
const disconnect = async () => {
    await mongoose_1.default.disconnect();
    console.log('MongoDB disconnected');
};
exports.disconnect = disconnect;
//# sourceMappingURL=db.js.map