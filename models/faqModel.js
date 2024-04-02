const mongoose = require("mongoose");
const faqSchema = new mongoose.Schema(
    {
        id: { type: Number },
        question: { type: String },
        answer: { type: String },
    },
    { versionKey: false }
);
const faqModel = mongoose.model("faq", faqSchema);
module.exports = faqModel;
