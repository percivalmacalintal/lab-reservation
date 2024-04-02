const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
    {
        name: { type: String },
        pass: { type: String },
        description: { type: String },
        profile: { type: String },
        isTech: { type: Boolean },
    },
    { versionKey: false }
);
const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
