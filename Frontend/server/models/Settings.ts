import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  maintenanceMode: boolean;
  allowUserSignup: boolean;
  allowRecruiterSignup: boolean;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowUserSignup: {
    type: Boolean,
    default: true
  },
  allowRecruiterSignup: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model<ISettings>('Settings', settingsSchema);
