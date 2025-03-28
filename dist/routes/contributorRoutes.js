"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contributorController_1 = require("../controllers/contributorController");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
router.post('/apply', auth_1.protect, upload_1.uploadMiddleware.single('resumeFile'), contributorController_1.applyForContributorship);
router.get('/my-application', auth_1.protect, contributorController_1.getCurrentContributorApplication);
router.get('/applications', auth_1.protect, auth_1.restrictToAdmin, contributorController_1.getContributorApplications);
router.patch('/applications/:id', auth_1.protect, auth_1.restrictToAdmin, contributorController_1.reviewContributorApplication);
router.get('/', auth_1.protect, contributorController_1.listContributors);
router.get('/stats', auth_1.protect, contributorController_1.getContributorStats);
router.get('/projects', auth_1.protect, contributorController_1.listContributorProjects);
router.get('/:id', auth_1.protect, contributorController_1.getContributorProfile);
router.patch('/profile', auth_1.protect, upload_1.uploadMiddleware.single('profileImage'), contributorController_1.updateContributorProfile);
router.post('/assign-role', auth_1.protect, auth_1.restrictToAdmin, contributorController_1.assignContributorRole);
exports.default = router;
//# sourceMappingURL=contributorRoutes.js.map