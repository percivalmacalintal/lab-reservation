const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema(
    {
        lab: { type: String },
        datetime: { type: Date },
        datetime_requested: { type: Date },
        name: { type: String },
        seats: { type: [Number] },
        isAnonymous: { type: Boolean },
    },
    { versionKey: false }
);
const reservationModel = mongoose.model("reservation", reservationSchema);
module.exports = reservationModel;
