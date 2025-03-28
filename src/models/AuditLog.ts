// models/AuditLog.ts
import mongoose, { Document, Schema } from 'mongoose';
import { AuditLog } from '../types/admin';

const AuditLogSchema: Schema<AuditLog & Document> = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String
}, {
  timestamps: true,
  collection: 'audit_logs'
});

export default mongoose.model<AuditLog & Document>('AuditLog', AuditLogSchema);