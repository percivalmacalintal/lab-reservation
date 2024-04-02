const mongoose = require("mongoose");
const labSchema = new mongoose.Schema(
    {
        name: { type: String },
        seats: { type: Number },
        time_in: { type: String },
        time_out: { type: String },
    },
    { versionKey: false }
);
const labModel = mongoose.model("lab", labSchema);
module.exports = labModel;
