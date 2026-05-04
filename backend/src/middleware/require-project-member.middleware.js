import mongoose from 'mongoose';
import { ProjectMember } from '../database/models/project-member.model.js';

async function membershipFor(projectId, userId) {
  if (!mongoose.isValidObjectId(projectId)) return null;
  return ProjectMember.findOne({
    project: projectId,
    user: userId,
  }).lean();
}

/** Attach req.membership { role } or 404/403 */
export function requireProjectMember({ adminOnly = false } = {}) {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id;
      const m = await membershipFor(projectId, req.user.id);
      if (!m) {
        return res.status(404).json({ message: 'Project not found or access denied' });
      }
      if (adminOnly && m.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin role required' });
      }
      req.projectId = projectId;
      req.membership = { role: m.role };
      next();
    } catch (err) {
      next(err);
    }
  };
}
