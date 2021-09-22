import express from "express";
import UsersController from "../controllers/UsersController";
import os from "os";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import HttpError from "http-errors";

const router = express.Router();

router.post('/login', UsersController.login);
router.post('/register', UsersController.register);

router.get('/profile', UsersController.profile);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      const allowTypes = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/gif': '.gif',
        'image/webp': '.webp',
      }
      if (!allowTypes[file.mimetype]) {
        cb(new HttpError(422, 'Invalid Image Format'));
        return;
      }
      cb(null, uuidv4() + '_' + file.originalname)
    }
  })
});

const upload2 = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
  }
})


router.put('/profile', upload2.single('avatar'), UsersController.profileUpdate);

// put, delete, patch, options


router.get('/', UsersController.usersList);


export default router;
