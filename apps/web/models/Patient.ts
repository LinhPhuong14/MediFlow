import { Schema, model, models, Types } from "mongoose";

/**
 * Address sub-schema
 */
const AddressSchema = new Schema(
  {
    city: {
      id: { type: Number, required: true },
      name: { type: String, required: true },
    },
    district: {
      id: { type: Number, required: true },
      cityId: { type: Number, required: true },
      name: { type: String, required: true },
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Patient schema
 */
const PatientSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{9,11}$/, // VN phone basic check
    },

    address: {
      type: AddressSchema,
      required: true,
    },

    // future-proof fields 🚀
    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: ["web", "chatbot", "mobile"],
      default: "web",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

export const Patient =
  models.Patient || model("Patient", PatientSchema);
