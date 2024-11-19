const mongoose = require('mongoose');

const StartValidSchema = new mongoose.Schema({
    Time: String,
    user: String,
    valid: String,
}, { timestamps: true });

module.exports = mongoose.model('Start_Valid', StartValidSchema);