const mongoose = require('mongoose');

const STATUS_VALUES = ['Todo', 'In Progress', 'Done'];
const PRIORITY_VALUES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: { values: STATUS_VALUES, message: 'Status must be one of: Todo, In Progress, Done' },
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: { values: PRIORITY_VALUES, message: 'Priority must be one of: Low, Medium, High' },
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Every list/filter query is scoped to a user, so this is the primary index.
// It also speeds up status/priority filtering when combined with user.
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
// Text index to support title search
taskSchema.index({ title: 'text' });

taskSchema.statics.STATUS_VALUES = STATUS_VALUES;
taskSchema.statics.PRIORITY_VALUES = PRIORITY_VALUES;

module.exports = mongoose.model('Task', taskSchema);
