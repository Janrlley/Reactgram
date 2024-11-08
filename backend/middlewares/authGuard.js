const User = require("../models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET

const authGuard = async (req, res, next) => {
    const authHeader = req.headers["authorization"] // cabeçalho importante ao mexer com token
    const token = authHeader && authHeader.split(" ")[1]; // split no espaço para separar o token em um array de 2 partes

    // check if header has a token
    if(!token) return res.status(401).json({errors: ["Acesso negado!"]})

    // check if token is valid
    try {
        const verified = jwt.verify(token, jwtSecret) // verificando se o token e jwt tem o msm secret para ser válido

        req.user = await User.findById(verified.id).select("-password") // tirando a senha do retorno com o select
        
        next();
    } catch (error) {
        res.status(401).json({errors: ["Token inválido."]})
    }
};

module.exports = authGuard


