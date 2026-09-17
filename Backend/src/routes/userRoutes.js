    const express = require("express")
    const { GetAllUser, GetUserById, AddUser, UpdateUser, DeleteUser } = require("../controllers/userController")
    const authMiddleware = require("../middlewares/authMiddleware")
    const { userUpload } = require("../middlewares/multer");

    const router = express.Router()

    router.get("/", authMiddleware, GetAllUser)
    router.get("/:id", authMiddleware, GetUserById)
    router.post("/add", authMiddleware,userUpload.single("profileImage"), AddUser)
    router.put("/update/:id", authMiddleware,userUpload.single("profileImage"), UpdateUser)
    router.delete("/delete/:id", authMiddleware, DeleteUser)

    module.exports = router
