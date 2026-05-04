import mongoose from 'mongoose';

export const PROJECT_ROLES = ['ADMIN', 'MEMBER'];

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: PROJECT_ROLES,
      required: true,
      default: 'MEMBER',
    },
  },
  { timestamps: true }
);

projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMember =
  mongoose.models.ProjectMember || mongoose.model('ProjectMember', projectMemberSchema);
