const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {type: String, required: true, minLength: 2},
    last_name: {type: String, minLength: 2},
    username: {type: String, required: true, minLength: 6, maxLength: 30},
    password: {type: String, required: true},
    user_level: {type: String, enum:["User", "Member", "Admin"], default: "User", required: true}
});

UserSchema.virtual("full_name").get(function() {
    return `${this.first_name}${this.last_name ? " " + this.last_name : ""}`;
});

module.exports = mongoose.model("User", UserSchema);
