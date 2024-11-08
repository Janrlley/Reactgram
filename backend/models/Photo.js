const mongoose = require('mongoose')
const {Schema} = mongoose;

const photoSchema = new Schema(  // no BD não salvamos imagens e sim o caminho
    {
        image: String,  // para salvar o caminho da imagem
        title: String,
        likes: Array,
        comments: Array,
        userId: mongoose.ObjectId, // indica que não é uma string comum, e sim "string de ID"
        userName: String,
    },
    {
        timestamps: true
    }
);

const Photo = mongoose.model("Photo", photoSchema); // "Photo" é como vai ser chamado o model

module.exports = Photo;