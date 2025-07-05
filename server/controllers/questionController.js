import Question from '../models/Question.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Admin
export const createQuestion = asyncHandler(async (req, res, next) => {
  const { title, description, difficulty, sampleInput, sampleOutput, testCases } = req.body;

  const question = await Question.create({
    title,
    description,
    difficulty,
    sampleInput,
    sampleOutput,
    testCases: testCases || [],
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: question
  });
});

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
export const getQuestions = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Question.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Question.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const questions = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: questions.length,
    pagination,
    data: questions
  });
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
export const getQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = asyncHandler(async (req, res, next) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is question owner or admin
  if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this question`,
        401
      )
    );
  }

  question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: question
  });
});

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is question owner or admin
  if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this question`,
        401
      )
    );
  }

  await question.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
