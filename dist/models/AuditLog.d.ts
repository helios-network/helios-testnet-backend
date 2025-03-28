import mongoose from 'mongoose';
import { AuditLog } from '../types/admin';
declare const _default: mongoose.Model<AuditLog & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, AuditLog & mongoose.Document<any, any, any>> & AuditLog & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
