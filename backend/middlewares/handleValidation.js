const {validationResult} = require('express-validator')

const validate = (req, res, next) => { // next === deixar prosseguir ou parar por aqui msm

    const errors = validationResult(req)

    if(errors.isEmpty()) { // isEmpty() verifica se os erros estão vazios
        return next() // se n tem erro continua 
    }

    const extractedErros = [] // para armazenar os erros extraidos da req

    errors.array().map((err) => extractedErros.push(err.msg)); // colocando cada mensagem de erro na variavel

    return res.status(422).json({ // mandando a resposta da req mal sucedida(422) em json
        errors: extractedErros
    })
}

module.exports = validate