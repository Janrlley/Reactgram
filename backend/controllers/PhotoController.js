const Photo = require("../models/Photo")
const User = require("../models/User")
const mongoose = require("mongoose")

// Insert a photo, with an user related to it
const insertPhoto = async(req, res) => {
    const { title } = req.body;
    const image = req.file.filename

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    // Create a photo
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name
    });

    // if photo was created successfuly, return data
    if(!newPhoto) {
        res.status(422).json({
            errors: ["Houve um problema, por favor tente novamente mais tarde."]
        });
        return
    };

    res.status(201).json(newPhoto);

    res.send("Photo insert");
};

// Remove a photo from BD
const deletePhoto = async(req, res) => {
    const { id } = req.params;
    const reqUser = req.user;
    
    try {
        const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

        // check if photo exists
        if(!photo) {
            res.status(404).json({errors: ["Foto não encontrada."]});
            return;
        };

        // Check if photo belong to user
        if(!photo.userId.equals(reqUser._id)) {
            res.status(422).json({
                errors: ["Ocorreu um erro, por favor tente novamente mais tarde"]
            });
        };

        await Photo.findByIdAndDelete(photo._id);  // Deletando a foto

        res.status(200).json({
            id: photo._id, message: 'Foto excluída com sucesso.'
        });

    } catch (error) {
        res.status(404).json({errors: ["Foto não encontrada."]});
            return;
    }
};

// Get all photos 
const getAllPhotos = async(req, res) => {
    const photos = await Photo.find({}) // objeto vazio ({}) para buscar todos
        .sort([["createdAt", -1]]) // sort para ordenar "-1" em ordem decrescente, mostrando a mais recente primeiro
        .exec(); // executando a consulta ao banco de dados

    return res.status(200).json(photos);
};

// Get user photos
const getUserPhotos = async(req, res) => {
    const {id} = req.params;
    const photos = await Photo.find({userId: id}) // pegando a foto pelo id do usuário
        .sort([['createdAt', -1]]) // ordenando em ordem decrescente com base no 'createdAt' mostrando o mais recente
        .exec(); // executando a consulta ao banco de dados
    return res.status(200).json(photos); 
};

// Get photo by id
const getPhotoById = async(req, res) => {
    const {id} = req.params;
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id)); // findById() permite buscar um dado no BD com base no seu identificador

    // check if photo exists
    if(!photo) {
        res.status(404).json({errors: ["Foto não encontrada."]});
        return
    };

    res.status(200).json(photo);
};

// update a photo
const updatePhoto = async(req, res) => {
    const {id} = req.params;
    const {title} = req.body;

    const reqUser = req.user; // se o usuário está pela a requisição
    const photo = await Photo.findById(id); 

    // check if photo exists
    if(!photo) {
        res.status(404).json({errors: ["Foto não encontrada"]});
        return
    };

    // check if photo belongs to user
    if(!photo.userId.equals(reqUser._id)) {
        res
            .status(422)
            .json({errors: ['Ocorreu um erro, por favor tente novamente mais tarde.'],
        });
        return
    };

    if(title) {
        photo.title = title
    }

    await photo.save();

    res.status(200).json({photo, message: "Foto atualizada com sucesso."});
};

// like functionality
const likePhoto = async(req, res) => {
    const {id} = req.params;
    const reqUser = req.user;
    const photo = await Photo.findById(id);

    // Check if photo exists
    if(!photo) {
        res.status(404).json({errors: ["Foto não encontrada."]})
        return
    }

    // checkif user already liked the photo
    if(photo.likes.includes(reqUser._id)) {
        res.status(422).json({errors: ["Você ja curtiu a foto."]});
        return
    }

    // Put user id in likes array
    photo.likes.push(reqUser._id)

    await photo.save()

    res.status(200).json({photoId: id, userId: reqUser._id, message: "A foto foi curtida."})
};

// Comment functionality
const commentPhoto = async(req, res) => {
    const {id} = req.params
    const {comments} = req.body

    const reqUser = req.user
    const user = await User.findById(reqUser._id)
    const photo = await Photo.findById(id);

    // Check if photo exists
    if(!photo) {
        res.status(404).json({errors: ['Foto não encontrada']})
        return
    }

    // Put comment in the array comments
    const userComment = {
        comments,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id
    };

    photo.comments.push(userComment) // inserindo comentarios dos usuários na rede de comentarios

    await photo.save() // salvando comentarios

    res.status(200).json({
        comments: userComment,
        message: "O comentário foi adicionado com sucesso"
    });

};

// Search photos by title
const searchPhotos = async(req, res) => {
    const {q} = req.query // parametro que não faz parte da url
    const photos = await Photo.find({title: new RegExp(q, "i")}).exec()

    res.status(200).json(photos);
};

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos,
}