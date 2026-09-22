const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SORTABLE_FIELDS = { dueDate: 'dueDate', priority: 'priority' };
// Priority doesn't sort correctly alphabetically (High < Low < Medium),
// so we map it to a numeric rank for sorting.
const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3 };

// GET /api/tasks
// Supports: status, priority, search (title), page, limit, sortBy, order
const getTasks = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };

  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.priority) {
    query.priority = req.query.priority;
  }
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  let sortStage = { createdAt: -1 }; // default: newest first
  const sortByField = req.query.sortBy;
  const sortOrder = req.query.order === 'desc' ? -1 : 1;

  if (sortByField && SORTABLE_FIELDS[sortByField]) {
    if (sortByField === 'priority') {
      // Sort in JS using the priority rank since it's not numeric in the DB
      const allMatching = await Task.find(query).lean();
      allMatching.sort((a, b) => {
        const diff = (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
        return sortOrder === 1 ? diff : -diff;
      });
      const total = allMatching.length;
      const paginated = allMatching.slice(skip, skip + limit);
      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    }
    sortStage = { [SORTABLE_FIELDS[sortByField]]: sortOrder };
  }

  const [tasks, total] = await Promise.all([
    Task.find(query).sort(sortStage).skip(skip).limit(limit),
    Task.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    user: req.user._id
  });

  res.status(201).json({ success: true, data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const { title, description, status, priority, dueDate } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();

  res.status(200).json({ success: true, data: task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  res.status(200).json({ success: true, data: { id: req.params.id } });
});

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
