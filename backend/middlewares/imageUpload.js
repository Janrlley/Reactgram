const multer = require("multer") // upload de arquivos
const path = require("path") // diretorios deste projeto

// Destination to store image
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = ""

        if(req.baseUrl.includes("users")) {  // se incluir "users" no caminho, salva na pasta "users"
            folder = "users"
        } else if(req.baseUrl.includes("photos")) { // e se incluir "photos" no caminho, salva na pasta "photos"
            folder = "photos"
        }

        cb(null, `uploads/${folder}/`) // setando a pasta em que a imagem vai ficar salva 'uploads/photos || users'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)) // tratando o novo nome do arquivo
    }
}) 

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) { // fileFilter controla quais arquivos são aceitos
        if(!file.originalname.match(/\.(png|jpg)$/)) { // expressão regular verifica se no fim do arquivo tem uma extensão de jpg ou png
            // upload only png and jpg formats
            return cb(new Error("Por favor, envie apenas png ou jpg!"))
        }
        cb(undefined, true) // retorna um booleano para o arquivo ser aceito
    }
})

module.exports = {
    imageUpload
}