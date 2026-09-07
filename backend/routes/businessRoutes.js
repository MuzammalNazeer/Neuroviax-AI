const express = require('express');
const router = express.Router();
const { protect, requireBusinessContext } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getBusiness,
  updateBusiness,
  listBranches,
  createBranch,
  listMembers,
  updateMemberRole,
  addMember,
  toggleMemberActive,
} = require('../controllers/businessController');

router.use(protect, requireBusinessContext);

router.get('/', getBusiness);
router.put('/', allowRoles('owner', 'admin'), updateBusiness);
router.get('/branches', listBranches);
router.post('/branches', allowRoles('owner', 'admin'), createBranch);

router.get('/members', allowRoles('owner', 'admin', 'manager'), listMembers);
router.post('/members', allowRoles('owner', 'admin'), addMember);
router.put('/members/role', allowRoles('owner', 'admin'), updateMemberRole);
router.put('/members/active', allowRoles('owner', 'admin'), toggleMemberActive);

module.exports = router;
