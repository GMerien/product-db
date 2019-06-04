module.exports = mongoose => {
    const modificationSchema = new mongoose.Schema({
        mvalue: {
            type: String, 
            required: true,
        },
        mdate: {
            type: String,
            required: true,
        },
    });

    const elementSchema = new mongoose.Schema({
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        ename: {
            type: String,
            required: true,
            lowercase: true,
        },
        modifications: [modificationSchema],
    });

    const productSchema = new mongoose.Schema({
        name: {
            type: String, 
            required: true, 
            unique: true, 
        },
        description: { 
            type: String,
        },
        composition: [elementSchema],
    });
    
    return mongoose.model('Product', productSchema);
}
