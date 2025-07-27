import Question from '../models/Question.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import mongoose from 'mongoose';

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Admin
// @body    {string} title - Question title (required)
// @body    {string} description - Question description (required)
// @body    {string} difficulty - Difficulty level (easy|medium|hard)
// @body    {string} sampleInput - Sample input
// @body    {string} sampleOutput - Sample output
// @body    {Array} testCases - Array of test cases
// @body    {Array} topics - Array of topic IDs
// @body    {Array} companies - Array of company names
export const createQuestion = asyncHandler(async (req, res, next) => {
  const { 
    title, 
    description, 
    difficulty = 'medium', 
    sampleInput = '', 
    sampleOutput = '', 
    testCases = [],
    topics = [],
    companies = []
  } = req.body;

  // Input validation
  if (!title || !description) {
    return next(new ErrorResponse('Title and description are required', 400));
  }

  const question = await Question.create({
    title,
    description,
    difficulty,
    sampleInput,
    sampleOutput,
    testCases,
    topics,
    companies,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: question
  });
});

// @desc    Get all questions with filtering, sorting, and pagination
// @route   GET /api/questions
// @access  Public
// @query   {string} search - Search term for title or description
// @query   {string} difficulty - Filter by difficulty (easy|medium|hard)
// @query   {string} topic - Filter by topic ID
// @query   {string} company - Filter by company name
// @query   {string} sort - Sort field (prefix with - for descending)
// @query   {number} page - Page number (default: 1)
// @query   {number} limit - Items per page (default: 10, max: 100)
export const getQuestions = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  
  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Build query
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  let query = Question.find(JSON.parse(queryStr));

  // Search
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Question.countDocuments(query.getFilter());

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const questions = await query;

  // Pagination result
  const pagination = {};
  const totalPages = Math.ceil(total / limit);

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: questions.length,
    pagination: {
      ...pagination,
      total,
      totalPages,
      currentPage: page,
      limit
    },
    data: questions
  });
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
// @params  {string} id - Question ID
export const getQuestion = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid question ID: ${req.params.id}`, 400));
  }

  // TEMP: Remove .populate() to diagnose/fix 500 error. If this works, check topics/createdBy refs in DB.
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
// @params  {string} id - Question ID
export const updateQuestion = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid question ID: ${req.params.id}`, 400));
  }

  let question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  // Verify ownership or admin status
  if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this question`,
        403
      )
    );
  }

  // Prevent updating createdBy
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }

  question = await Question.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { 
      new: true,
      runValidators: true 
    }
  ).populate('topics', 'name');

  res.status(200).json({
    success: true,
    data: question
  });
});

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
// @params  {string} id - Question ID
export const deleteQuestion = asyncHandler(async (req, res, next) => {
  // Find the question first to check permissions
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  // Verify ownership or admin status
  if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this question`,
        403
      )
    );
  }

  // Delete the question
  await Question.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});