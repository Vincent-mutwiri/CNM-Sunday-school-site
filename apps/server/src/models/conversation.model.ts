import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

// Indexes for better query performance
conversationSchema.index({ participants: 1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;