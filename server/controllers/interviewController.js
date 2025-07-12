import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

// Create a new interview session
export const createInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { questionId } = req.body;

    // Find a random question if not provided
    let question;
    if (questionId) {
      question = await Question.findById(questionId);
    } else {
      const count = await Question.countDocuments();
      const random = Math.floor(Math.random() * count);
      question = await Question.findOne().skip(random);
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'No questions available' });
    }

    // Create a new interview session
    const interview = new Interview({
      participants: [userId],
      question: question._id,
      roomId: `room-${randomUUID()}`,
      status: 'waiting'
    });

    await interview.save();
    
    // Populate the question details
    await interview.populate('question');
    
    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Join an existing interview session
export const joinInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { roomId } = req.params;

    const interview = await Interview.findOne({ roomId });
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Check if user is already a participant
    if (interview.participants.includes(userId)) {
      return res.status(200).json({
        success: true,
        data: interview
      });
    }

    // Add user to participants
    if (interview.participants.length < 2) {
      interview.participants.push(userId);
      interview.status = 'in_progress';
      await interview.save();
      
      // Populate the question details
      await interview.populate('question');
      
      return res.status(200).json({
        success: true,
        data: interview
      });
    }

    res.status(400).json({
      success: false,
      message: 'Interview room is full'
    });
  } catch (error) {
    console.error('Error joining interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get interview details
export const getInterview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.user;

    const interview = await Interview.findOne({ roomId })
      .populate('participants', 'name email')
      .populate('question');
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Check if user is a participant
    if (!interview.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this interview'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error getting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Match with another user for an interview
export const matchUserForInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { difficulty, topic } = req.query;

    // Find an existing waiting interview that matches the criteria
    const matchQuery = {
      status: 'waiting',
      participants: { $ne: userId },
      $expr: { $lt: [{ $size: '$participants' }, 2] }
    };

    // Add difficulty filter if provided
    if (difficulty) {
      matchQuery['question.difficulty'] = difficulty;
    }

    // Add topic filter if provided
    if (topic) {
      matchQuery['question.topics'] = topic;
    }

    // Find a matching interview
    let interview = await Interview.findOne(matchQuery)
      .populate('question')
      .sort({ createdAt: 1 });

    // If no matching interview found, create a new one
    if (!interview) {
      const questionQuery = { ...(difficulty && { difficulty }), ...(topic && { topics: topic }) };
      const count = await Question.countDocuments(questionQuery);
      
      if (count === 0) {
        return res.status(404).json({
          success: false,
          message: 'No questions found matching the criteria'
        });
      }

      const random = Math.floor(Math.random() * count);
      const question = await Question.findOne(questionQuery).skip(random);

      interview = new Interview({
        participants: [userId],
        question: question._id,
        roomId: `room-${randomUUID()}`,
        status: 'waiting'
      });

      await interview.save();
      await interview.populate('question');
    } else {
      // Add user to existing interview
      interview.participants.push(userId);
      interview.status = 'in_progress';
      await interview.save();
      await interview.populate('question');
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error matching for interview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
