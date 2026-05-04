import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { Project } from '../../database/models/project.model.js';
import { ProjectMember } from '../../database/models/project-member.model.js';
import { User } from '../../database/models/user.model.js';
import { Task } from '../../database/models/task.model.js';

export async function listMyProjects(req, res, next) {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id })
      .populate('project')
      .lean();
    const items = memberships
      .filter((m) => m.project)
      .map((m) => ({
        id: m.project._id.toString(),
        name: m.project.name,
        description: m.project.description,
        role: m.role,
        updatedAt: m.project.updatedAt,
      }));
    res.json({ projects: items });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description } = req.body;
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() ?? '',
      createdBy: req.user.id,
    });
    await ProjectMember.create({
      project: project._id,
      user: req.user.id,
      role: 'ADMIN',
    });
    res.status(201).json({
      project: {
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        role: 'ADMIN',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.projectId).lean();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        role: req.membership.role,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const project = await Project.findByIdAndUpdate(
      req.projectId,
      {
        ...(req.body.name !== undefined && { name: String(req.body.name).trim() }),
        ...(req.body.description !== undefined && {
          description: String(req.body.description).trim(),
        }),
      },
      { new: true, runValidators: true }
    ).lean();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        role: req.membership.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    await ProjectMember.deleteMany({ project: req.projectId });
    await Task.deleteMany({ project: req.projectId });
    await Project.findByIdAndDelete(req.projectId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listMembers(req, res, next) {
  try {
    const rows = await ProjectMember.find({ project: req.projectId })
      .populate('user', 'email name')
      .lean();
    const members = rows.map((m) => ({
      userId: m.user._id.toString(),
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      joinedAt: m.createdAt,
    }));
    res.json({ members });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const email = String(req.body.email).toLowerCase().trim();
    const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'No user with that email — they must register first' });
    }
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are already a member' });
    }
    try {
      await ProjectMember.create({ project: req.projectId, user: user._id, role });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ message: 'User is already a member' });
      }
      throw e;
    }
    res.status(201).json({
      member: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

    const target = await ProjectMember.findOne({
      project: req.projectId,
      user: userId,
    });
    if (!target) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (role === 'MEMBER' && target.role === 'ADMIN') {
      const adminCount = await ProjectMember.countDocuments({
        project: req.projectId,
        role: 'ADMIN',
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot remove the last admin — promote another admin first',
        });
      }
    }

    target.role = role;
    await target.save();
    res.json({
      member: {
        userId: target.user.toString(),
        role: target.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const target = await ProjectMember.findOne({
      project: req.projectId,
      user: userId,
    });
    if (!target) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (target.role === 'ADMIN') {
      const adminCount = await ProjectMember.countDocuments({
        project: req.projectId,
        role: 'ADMIN',
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin' });
      }
    }

    await ProjectMember.deleteOne({ _id: target._id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
