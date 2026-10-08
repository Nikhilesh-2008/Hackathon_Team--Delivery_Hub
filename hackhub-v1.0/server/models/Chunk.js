import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document reference is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    version: {
      type: String,
      required: true,
      default: '1.0',
      trim: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true, // Optional team scope for private documents
    },
    page: {
      type: Number,
      default: 1,
    },
    section: {
      type: String,
      default: 'General',
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Chunk text content is required'],
    },
    embedding: {
      type: [Number], // Float vector for Atlas Vector Search
      default: [],
    },
    embeddingModel: {
      type: String,
      default: 'text-embedding-004',
      trim: true,
    },
    embeddingVersion: {
      type: String,
      default: '1',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// B-tree indexes for filtered vector queries
chunkSchema.index({ eventId: 1, documentId: 1 });
chunkSchema.index({ eventId: 1, version: 1 });
chunkSchema.index({ teamId: 1 });

export const Chunk = mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);
export default Chunk;
