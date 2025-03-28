"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndDocument = validateAndDocument;
const zod_1 = require("zod");
const swagger_generator_1 = __importDefault(require("../utils/swagger-generator"));
function validateAndDocument(config) {
    return (req, res, next) => {
        try {
            if (config.body) {
                req.body = config.body.parse(req.body);
                swagger_generator_1.default.registerSchema(`${config.body.constructor.name}Schema`, config.body);
            }
            if (config.query) {
                req.query = config.query.parse(req.query);
                swagger_generator_1.default.registerSchema(`${config.query.constructor.name}QuerySchema`, config.query);
            }
            if (config.params) {
                req.params = config.params.parse(req.params);
                swagger_generator_1.default.registerSchema(`${config.params.constructor.name}ParamsSchema`, config.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation Failed',
                    details: error.errors
                });
            }
            next(error);
        }
    };
}
//# sourceMappingURL=swagger-generator.js.map