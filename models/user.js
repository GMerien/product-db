module.exports = mongoose => {

    const userSchema = new mongoose.Schema({
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            unique: true, 
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
        },
    });
    
    return mongoose.model('User', userSchema);
}
