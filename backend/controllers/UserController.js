const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
    return jwt.sign( // gerando o token com o jwt.sign()
        { id }, // id do usuário para fazer uma manipulação eventualmente
        jwtSecret, // secrete para que na hr tenha que bater o secrete confg no sistema
        { expiresIn: "7d" } // para fazer o logout automatico
    );
};

// Register user and sign in
const register = async(req, res) => {
    const {name, email, password} = req.body;

    // check if user exists
    const user = await User.findOne({email}) // esperando o model encontrar o usuario pelo o email (findOne)

    if(user) {
        res.status(422).json({errors: ["Por favor, utilize outro e-mail."]})
        return
    }

    // Generate password hash
    const salt = await bcrypt.genSalt() // aqui ele gera uma string aleatória 
    const passwordHash = await bcrypt.hash(password, salt) // gera uma senha aleatória

    // Create user
    const newUser = await User.create({
        name,
        email,
        password: passwordHash // usando o valor gerado na passwordHash 
    })

    // if user was created succssfuly, return the token
    if(!newUser) {
        res
            .status(422)
            .json({errors: ["Houve um erro, por favor tente mais tarde."]})
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id),
    })
};

// Sign user in
const login = async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}); // checando que o usuario existe pelo o e-mail

    //Check if user exists
    if(!user) {
        res.status(404).json({
            errors: ["Usuário não encontrado."]
        });
        return
    };

    // Check if password matches
    if(!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({
            errors: ['Senha inválida.']
        });
        return
    };

    // Return user with token
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id),
    })
};

// Get current logged in user
const getCurrentUser = async(req, res) => {
    const user = req.user;

    res.status(200).json(user);
}

// Update an user
const update  = async(req, res) => {
    const {name, password, bio} = req.body;

    let profileImage = null;
    
    if(req.file) {
        profileImage = req.file.filename;
    };

    const reqUser = req.user;

    const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password")

    if(name) {
        user.name = name
    };

    if(password) {
        // Generate password hash
        const salt = await bcrypt.genSalt() // aqui ele gera uma string aleatória 
        const passwordHash = await bcrypt.hash(password, salt) // gera uma senha aleatória

        user.password = passwordHash;
    }

    if(profileImage) {
        user.profileImage = profileImage
    }

    if(bio) {
        user.bio = bio
    }

    await user.save();

    res.status(200).json(user)
};

// Get user by id
const getUserById = async(req, res) => {
    const {id} = req.params; // por ser um get vamos resgastar esse dado da url

    try {
        const user = await User.findById(new mongoose.Types.ObjectId(id)).select("-password");

        // check if user exists
        if(!user) {
            res.status(404).json({errors: ["Usuário não encontrado."]})
            return
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({errors: ["Usuário não encontrado."]})
        return;
    }
}

module.exports = { // disponibilizando função para rotas
    register,
    login,
    getCurrentUser,
    update,
    getUserById,
};