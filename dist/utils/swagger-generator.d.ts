import { z } from 'zod';
declare class SwaggerGenerator {
    private static instance;
    private schemas;
    private constructor();
    static getInstance(): SwaggerGenerator;
    convertZodToOpenAPI(schema: z.ZodType): any;
    registerSchema(name: string, schema: z.ZodType): this;
    generateSpecification(): {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
        };
        components: {
            schemas: Record<string, any>;
        };
    };
    private zodToJsonSchema;
}
declare const _default: SwaggerGenerator;
export default _default;
