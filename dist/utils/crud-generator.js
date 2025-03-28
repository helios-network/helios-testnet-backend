"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCRUDRoutes = generateCRUDRoutes;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_generator_1 = require("../middlewares/swagger-generator");
const auth_1 = require("../middlewares/auth");
function generateCRUDRoutes(resourceName, options) {
    const router = express_1.default.Router();
    const { model, schemaValidation = {}, customMiddleware = [] } = options;
    const DefaultQuerySchema = zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).optional().default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
    });
    const generateSchemaFromModel = (model, type) => {
        const paths = model.schema.paths;
        const schemaFields = {};
        Object.entries(paths).forEach(([key, schemaType]) => {
            if (key.startsWith('_') || ['createdAt', 'updatedAt'].includes(key))
                return;
            let zodType;
            switch (schemaType.instance) {
                case 'String':
                    zodType = zod_1.z.string();
                    break;
                case 'Number':
                    zodType = zod_1.z.number();
                    break;
                case 'Date':
                    zodType = zod_1.z.date();
                    break;
                case 'Boolean':
                    zodType = zod_1.z.boolean();
                    break;
                case 'ObjectId':
                    zodType = zod_1.z.string();
                    break;
                default:
                    zodType = zod_1.z.any();
            }
            if (type === 'update') {
                zodType = zodType.optional();
            }
            schemaFields[key] = zodType;
        });
        return zod_1.z.object(schemaFields);
    };
    router.get('/', ...customMiddleware, auth_1.protect, auth_1.restrictToAdmin, (0, swagger_generator_1.validateAndDocument)({
        query: schemaValidation.query || DefaultQuerySchema
    }), async (req, res, next) => {
        try {
            const { page, limit, search, sortBy, order } = req.query;
            const searchQuery = search
                ? { $or: Object.keys(model.schema.paths)
                        .filter(path => model.schema.paths[path].instance === 'String')
                        .map(path => ({ [path]: { $regex: search, $options: 'i' } }))
                }
                : {};
            const totalDocs = await model.countDocuments(searchQuery);
            const results = await model
                .find(searchQuery)
                .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            res.json({
                success: true,
                data: results,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalDocs,
                    totalPages: Math.ceil(totalDocs / Number(limit))
                }
            });
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', ...customMiddleware, auth_1.protect, auth_1.restrictToAdmin, (0, swagger_generator_1.validateAndDocument)({
        body: schemaValidation.create || generateSchemaFromModel(model, 'create')
    }), async (req, res, next) => {
        try {
            const newResource = await model.create(req.body);
            res.status(201).json({
                success: true,
                data: newResource
            });
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:id', ...customMiddleware, auth_1.protect, auth_1.restrictToAdmin, (0, swagger_generator_1.validateAndDocument)({
        params: zod_1.z.object({
            id: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), { message: 'Invalid ID format' })
        })
    }), async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `${resourceName} not found`
                });
            }
            res.json({
                success: true,
                data: resource
            });
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/:id', ...customMiddleware, auth_1.protect, auth_1.restrictToAdmin, (0, swagger_generator_1.validateAndDocument)({
        params: zod_1.z.object({
            id: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), { message: 'Invalid ID format' })
        }),
        body: schemaValidation.update || generateSchemaFromModel(model, 'update')
    }), async (req, res, next) => {
        try {
            const updatedResource = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!updatedResource) {
                return res.status(404).json({
                    success: false,
                    message: `${resourceName} not found`
                });
            }
            res.json({
                success: true,
                data: updatedResource
            });
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/:id', ...customMiddleware, auth_1.protect, auth_1.restrictToAdmin, (0, swagger_generator_1.validateAndDocument)({
        params: zod_1.z.object({
            id: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), { message: 'Invalid ID format' })
        })
    }), async (req, res, next) => {
        try {
            const deletedResource = await model.findByIdAndDelete(req.params.id);
            if (!deletedResource) {
                return res.status(404).json({
                    success: false,
                    message: `${resourceName} not found`
                });
            }
            res.json({
                success: true,
                message: `${resourceName} deleted successfully`,
                data: deletedResource
            });
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
//# sourceMappingURL=crud-generator.js.map