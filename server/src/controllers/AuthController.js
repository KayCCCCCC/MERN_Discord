import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs"
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, {
        expiresIn: maxAge
    })
}

const SignUp = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and Password is required")
        }

        const userExits = await User.findOne({ email: email })
        if (userExits) {
            return res.status(400).json({ message: "Account is already exist!" })
        }

        const user = await User.create({ email, password: password });
        await user.save();

        res.cookie("jwt", createToken(user.email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None"
        })
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password is required" })
        }

        const userExits = await User.findOne({ email: email })
        if (!userExits) {
            return res.status(400).json({ message: "Account is not found!" })
        }

        const auth = await compare(password, userExits.password);
        if (!auth) {
            return res.status(400).json({ message: "Password is incorrect!" })
        }

        res.cookie("jwt", createToken(userExits.email, userExits.id), {
            maxAge,
            secure: true,
            sameSite: "None"
        })
        return res.status(200).json({
            user: {
                id: userExits.id,
                email: userExits.email,
                profileSetup: userExits.profileSetup,
                firstName: userExits.firstName,
                lastName: userExits.lastName,
                image: userExits.image,
                profileSetup: userExits.profileSetup
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const SignOut = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" })
        return res.status(200).json({ message: "Sign out successfully." })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const GetUserInFo = async (req, res) => {
    try {
        const userData = await User.findById(req.userId)
        if (!userData) {
            return res.status(404).json({ message: "User with the given id not found." })
        }
        return res.status(200).json({
            user: {
                id: userData.id,
                email: userData.email,
                profileSetup: userData.profileSetup,
                firstName: userData.firstName,
                lastName: userData.lastName,
                image: userData.image,
                profileSetup: userData.profileSetup,
                color: userData.color
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const UpdateProfile = async (req, res) => {
    try {

        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ message: "FirstName and LastName are required!" })
        }
        const userData = await User.findByIdAndUpdate(userId, {
            firstName, lastName, color, profileSetup: true
        }, { new: true, runValidators: true })

        if (!userData) {
            return res.status(404).json({ message: "User with the given id not found." })
        }

        return res.status(200).json({
            user: {
                id: userData.id,
                email: userData.email,
                profileSetup: userData.profileSetup,
                firstName: userData.firstName,
                lastName: userData.lastName,
                image: userData?.image,
                profileSetup: userData.profileSetup
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const AddProfileImage = async (req, res) => {
    try {
        console.log(req.file)
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "File is required!" });
        }

        // Create a new file name with a timestamp
        const date = Date.now();
        const fileName = "upload/profiles/" + date + req.file.originalname;

        // Rename the file with the new name
        renameSync(req.file.path, fileName);

        // Update the user's profile image in the database
        const updateUser = await User.findByIdAndUpdate(req.userId, { image: fileName }, { new: true, runValidators: true });

        // Send the updated image path in the response
        return res.status(200).json({
            image: updateUser.image
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const DeleteProfileImage = async (req, res) => {
    try {
        const { userId } = req;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User with the given id not found." })
        }

        if (user.image) {
            unlinkSync(user.image)
        }

        user.image = null;
        await user.save();

        return res.status(200).json({
            message: "Profile image delete successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

export default {
    SignUp,
    SignIn,
    SignOut,
    GetUserInFo,
    UpdateProfile,
    AddProfileImage,
    DeleteProfileImage
}