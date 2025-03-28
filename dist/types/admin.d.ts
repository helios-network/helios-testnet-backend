export interface SystemConfig {
    maintenanceMode: boolean;
    emailNotifications: boolean;
    maxConcurrentUsers: number;
}
export interface BlockchainStats {
    totalTransactions: number;
    networkHealth: string;
    lastSyncTimestamp: Date;
}
export interface RewardConfig {
    id?: string;
    type: 'XP' | 'TOKEN' | 'NFT';
    name: string;
    description?: string;
    value: number;
    conditions?: Record<string, any>;
    active: boolean;
}
export interface AuditLog {
    userId: string;
    action: string;
    details: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
}
