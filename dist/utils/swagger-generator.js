"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
class SwaggerGenerator {
    constructor() {
        this.schemas = {};
    }
    static getInstance() {
        if (!SwaggerGenerator.instance) {
            SwaggerGenerator.instance = new SwaggerGenerator();
        }
        return SwaggerGenerator.instance;
    }
    convertZodToOpenAPI(schema) {
        const jsonSchema = this.zodToJsonSchema(schema);
        return jsonSchema;
    }
    registerSchema(name, schema) {
        this.schemas[name] = this.convertZodToOpenAPI(schema);
        return this;
    }
    generateSpecification() {
        return {
            openapi: '3.0.0',
            info: {
                title: 'Admin API',
                version: '1.0.0',
                description: 'Dynamic API Documentation'
            },
            components: {
                schemas: this.schemas
            }
        };
    }
    zodToJsonSchema(schema) {
        const baseTypes = {
            ZodString: 'string',
            ZodNumber: 'number',
            ZodBoolean: 'boolean',
            ZodDate: 'string',
        };
        const convert = (zodSchema) => {
            if (zodSchema instanceof zod_1.z.ZodObject) {
                return {
                    type: 'object',
                    properties: Object.fromEntries(Object.entries(zodSchema.shape).map(([key, val]) => [
                        key,
                        convert(val)
                    ]))
                };
            }
            if (zodSchema instanceof zod_1.z.ZodEnum) {
                return {
                    type: 'string',
                    enum: zodSchema.options
                };
            }
            const type = baseTypes[zodSchema.constructor.name] || 'object';
            return { type };
        };
        return convert(schema);
    }
}
exports.default = SwaggerGenerator.getInstance();
//# sourceMappingURL=swagger-generator.js.map