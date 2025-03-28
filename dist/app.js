"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const xpRoutes_1 = __importDefault(require("./routes/xpRoutes"));
const onboardingRoutes_1 = __importDefault(require("./routes/onboardingRoutes"));
const faucetRoutes_1 = __importDefault(require("./routes/faucetRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const badgeRoutes_1 = __importDefault(require("./routes/badgeRoutes"));
const contributorRoutes_1 = __importDefault(require("./routes/contributorRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
(0, db_1.connect)();
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Helios Testnet API',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use('/api/users', userRoutes_1.default);
app.use('/api/users/xp', xpRoutes_1.default);
app.use('/api/users/onboarding', onboardingRoutes_1.default);
app.use('/api/faucet', faucetRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/users/badges', badgeRoutes_1.default);
app.use('/api/users/contributors', contributorRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Helios Testnet API is running',
        version: '1.0.0',
    });
});
app.use(errorHandler_1.errorHandler);
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map