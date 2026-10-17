const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bookedAt: { type: Date, default: null },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    seatPrice: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1, max: 200 },
    seats: [seatSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate seats on creation if not provided
eventSchema.pre("validate", function () {
  if ((!this.seats || this.seats.length === 0) && this.totalSeats > 0) {
    const seatsPerRow = 10;
    const generatedSeats = [];
    for (let i = 0; i < this.totalSeats; i++) {
      const rowIndex = Math.floor(i / seatsPerRow);
      const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C...
      const seatNum = (i % seatsPerRow) + 1; // 1, 2, ... 10
      const seatLabel = `${rowLetter}${seatNum}`;
      generatedSeats.push({
        seatNumber: seatLabel,
        row: rowLetter,
        number: seatNum,
        isBooked: false,
        bookedBy: null,
      });
    }
    this.seats = generatedSeats;
  }
});

eventSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Event", eventSchema);
