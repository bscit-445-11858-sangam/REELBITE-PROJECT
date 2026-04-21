const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const userModel = require("../models/user.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())
    console.log(fileUploadResult)

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({})
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    try {
        console.log(req.body)
        const { userId, foodId } = req.body;

        if (!userId || !foodId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const isAlreadyLiked = await likeModel.findOne({
            user: user._id,
            food: foodId
        })

        if (isAlreadyLiked) {
            await likeModel.deleteOne({
                user: user._id,
                food: foodId
            })

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { likeCount: -1 }
            })

            return res.status(200).json({
                message: "Food unliked successfully",
                liked: false
            })
        }

        const like = await likeModel.create({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: 1 }
        })

        return res.status(201).json({
            message: "Food liked successfully",
            like,
            liked: true
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

}

async function saveFood(req, res) {
    try {
        console.log(req.body)
        const { userId, foodId } = req.body;

        if (!userId || !foodId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        })

        if (isAlreadySaved) {
            await saveModel.deleteOne({
                user: user._id,
                food: foodId
            })

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { savesCount: -1 }
            })

            return res.status(200).json({
                message: "Food unsaved successfully",
                saved: false
            })
        }

        const save = await saveModel.create({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: 1 }
        })

        return res.status(201).json({
            message: "Food saved successfully",
            save,
            saved: true
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

}

async function getSaveFood(req, res) {
    try {
        const { userId } = req.query;
        const resolvedUserId = userId || req.user?._id;

        if (!resolvedUserId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const user = await userModel.findById(resolvedUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const savedFoods = await saveModel.find({ user: resolvedUserId }).populate('food');

        return res.status(200).json(savedFoods);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

}


module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
}