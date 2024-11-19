const mongoose = require('mongoose');

const QnoSchema = new mongoose.Schema({
    Time: String,
    user: String,
    img : String,
    Questio : String,
    qno : String,
    a : String,
    b : String,
    c : String,
    d : String,
    Ans : String,
    lang :String,
    tough : String
}, { timestamps: true });

module.exports = mongoose.model('Qno_Count', QnoSchema);