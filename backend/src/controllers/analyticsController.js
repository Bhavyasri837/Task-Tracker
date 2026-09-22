const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, completed] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, status: 'Done' })
  ]);

  const pending = total - completed;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.status(200).json({
    success: true,
    data: {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionPercentage
    }
  });
});

module.exports = { getAnalytics };
