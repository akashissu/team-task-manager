import { ProjectMember } from '../../database/models/project-member.model.js';
import { Task } from '../../database/models/task.model.js';

export async function dashboard(req, res, next) {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id })
      .select('project')
      .lean();
    const projectIds = memberships.map((m) => m.project);

    const tasks = await Task.find({
      project: { $in: projectIds },
      assignee: req.user.id,
    })
      .sort({ dueDate: 1, updatedAt: -1 })
      .populate('project', 'name')
      .lean();

    const now = Date.now();
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    let overdueCount = 0;

    for (const t of tasks) {
      if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
      if (
        t.dueDate &&
        t.status !== 'done' &&
        new Date(t.dueDate).getTime() < now
      ) {
        overdueCount += 1;
      }
    }

    const taskList = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      status: t.status,
      dueDate: t.dueDate,
      project: t.project
        ? { id: t.project._id.toString(), name: t.project.name }
        : null,
      overdue:
        Boolean(t.dueDate) &&
        t.status !== 'done' &&
        new Date(t.dueDate).getTime() < now,
    }));

    res.json({
      summary: {
        assignedToMe: tasks.length,
        byStatus,
        overdueCount,
      },
      tasks: taskList,
    });
  } catch (err) {
    next(err);
  }
}

export async function projectDashboard(req, res, next) {
  try {
    const tasks = await Task.find({ project: req.projectId }).lean();
    const now = Date.now();
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    let overdueCount = 0;
    for (const t of tasks) {
      if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
      if (
        t.dueDate &&
        t.status !== 'done' &&
        new Date(t.dueDate).getTime() < now
      ) {
        overdueCount += 1;
      }
    }
    res.json({
      summary: {
        total: tasks.length,
        byStatus,
        overdueCount,
      },
    });
  } catch (err) {
    next(err);
  }
}
