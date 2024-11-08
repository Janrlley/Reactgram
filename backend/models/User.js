// model do usuário
const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema(
    {
        name: String,
        email: String,
        password: String,
        profileImage: String,
        bio: String
    }, 
    {
        timestamps: true // quando o usuário é criado e atualizado indica a data e o horario desse evento
    }
);

const User = mongoose.model("User", userSchema); // passando o Schema para o model

module.exports = User;