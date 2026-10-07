import mongoose from 'mongoose';

export const DOCUMENT_STATUSES = ['uploaded', 'extracting', 'embedding', 'ready', 'failed'];
export const DOCUMENT_SOURCE_TYPES = ['pdf', 'markdown', 'webpage', 'text'];

const documentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    version: {
      type: String,
      required: true,
      default: '1.0',
      trim: true,
    },
    sourceType: {
      type: String,
      enum: {
        values: DOCUMENT_SOURCE_TYPES,
        message: '{VALUE} is not a valid source type',
      },
      default: 'pdf',
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: DOCUMENT_STATUSES,
        message: '{VALUE} is not a valid document status',
      },
      default: 'uploaded',
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
documentSchema.index({ eventId: 1, version: 1 });
documentSchema.index({ eventId: 1, status: 1 });

export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;
