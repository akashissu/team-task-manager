import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { Task } from '../../database/models/task.model.js';
import { ProjectMember } from '../../database/models/project-member.model.js';

async function assigneeMustBeMember(projectId, assigneeId) {
  if (!assigneeId) return true;
  if (!mongoose.isValidObjectId(assigneeId)) return false;
  const m = await ProjectMember.findOne({ project: projectId, user: assigneeId }).lean();
  return Boolean(m);
}

function canModifyTask(task, membership, userId) {
  const isAssignee =
    task.assignee && task.assignee.toString() === userId;
  const isCreator = task.createdBy.toString() === userId;
  if (membership.role === 'ADMIN') return true;
  return isAssignee || isCreator || !task.assignee;
}

/** Member may edit tasks they created, are assigned to, or unassigned tasks */
export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ project: req.projectId })
      .sort({ updatedAt: -1 })
      .populate('assignee', 'email name')
      .populate('createdBy', 'email name')
      .lean();
    const list = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate,
      assignee: t.assignee
        ? { id: t.assignee._id.toString(), email: t.assignee.email, name: t.assignee.name }
        : null,
      createdBy: {
        id: t.createdBy._id.toString(),
        email: t.createdBy.email,
        name: t.createdBy.name,
      },
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      overdue:
        Boolean(t.dueDate) &&
        t.status !== 'done' &&
        new Date(t.dueDate).getTime() < Date.now(),
    }));
    res.json({ tasks: list });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { title, description, status, assigneeId, dueDate } = req.body;
    assigneeId = assigneeId || null;
    const okAssignee = await assigneeMustBeMember(req.projectId, assigneeId);
    if (!okAssignee) {
      return res.status(400).json({ message: 'Assignee must be a project member' });
    }
    const task = await Task.create({
      project: req.projectId,
      title: String(title).trim(),
      description: description != null ? String(description).trim() : '',
      status: ['todo', 'in_progress', 'done'].includes(status) ? status : 'todo',
      assignee: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user.id,
    });
    await task.populate([
      { path: 'assignee', select: 'email name' },
      { path: 'createdBy', select: 'email name' },
    ]);
    res.status(201).json({
      task: serializeTask(task),
    });
  } catch (err) {
    next(err);
  }
}

function serializeTask(t) {
  const doc = typeof t.toObject === 'function' ? t.toObject() : t;
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    dueDate: doc.dueDate,
    assignee: doc.assignee
      ? {
          id: doc.assignee._id.toString(),
          email: doc.assignee.email,
          name: doc.assignee.name,
        }
      : null,
    createdBy: {
      id: doc.createdBy._id.toString(),
      email: doc.createdBy.email,
      name: doc.createdBy.name,
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    overdue:
      Boolean(doc.dueDate) &&
      doc.status !== 'done' &&
      new Date(doc.dueDate).getTime() < Date.now(),
  };
}

export async function getTask(req, res, next) {
  try {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findOne({ _id: taskId, project: req.projectId })
      .populate('assignee', 'email name')
      .populate('createdBy', 'email name');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task: serializeTask(task) });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findOne({ _id: taskId, project: req.projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!canModifyTask(task, req.membership, req.user.id)) {
      return res.status(403).json({
        message: 'You can only edit tasks you created, are assigned to, or unassigned tasks',
      });
    }

    const { title, description, status, assigneeId, dueDate } = req.body;
    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (status !== undefined) {
      if (!['todo', 'in_progress', 'done'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      task.status = status;
    }
    if (assigneeId !== undefined) {
      const aid = assigneeId === null || assigneeId === '' ? null : assigneeId;
      const ok = await assigneeMustBeMember(req.projectId, aid);
      if (!ok) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
      task.assignee = aid;
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate === null || dueDate === '' ? null : new Date(dueDate);
    }
    await task.save();
    await task.populate([
      { path: 'assignee', select: 'email name' },
      { path: 'createdBy', select: 'email name' },
    ]);
    res.json({ task: serializeTask(task) });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    const task = await Task.findOne({ _id: taskId, project: req.projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.membership.role !== 'ADMIN') {
      const isAssignee =
        task.assignee && task.assignee.toString() === req.user.id;
      const isCreator = task.createdBy.toString() === req.user.id;
      if (!(isAssignee || isCreator)) {
        return res.status(403).json({ message: 'Only admins or task creator/assignee can delete' });
      }
    }
    await Task.deleteOne({ _id: task._id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
