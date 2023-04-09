const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const {DateTime} = require('luxon');
const messageSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    time: {type: Schema.Types.Date, required: true, default: Date.now()},
    title: {type: String, required: true, minLength: 3, maxLength: 100},
    message: {type: String, require: true, minLength: 3}
})

messageSchema.virtual("formattedtime").get(function() {
    return DateTime.fromJSDate(this.time).toLocaleString(DateTime.DATETIME_MED)
})

module.exports = mongoose.model("Message", messageSchema);