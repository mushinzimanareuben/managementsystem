import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['customer_info', 'employee_info', 'service_request', 'job_application'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible payload
    required: true
  },
  cvUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const MongoSubmission = mongoose.model('Submission', submissionSchema);

export default MongoSubmission;
