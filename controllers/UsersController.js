import Users from "../models/Users";
import Promise from "bluebird";
import HttpError from "http-errors";
import md5 from "md5";
import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const { JWT_SECRET } = process.env;

class UsersController {

  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({
        where: {
          email
        }
      });
      const isLogin = user && user.getDataValue('password') === Users.passwordHash(password);

      if (!isLogin) {
        throw HttpError(403, 'Invalid email or password')
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.json({
        status: 'ok',
        token,
        isLogin
      })
    } catch (e) {
      next(e)
    }
  }

  static register = async (req, res, next) => {
    try {
      const { email, password, fName, lName } = req.body;

      const user = await Users.create({
        email, fName, lName, password
      })

      // const user = await Users.getUser(userId);

      res.json({
        status: 'ok',
        user
      })
    } catch (e) {
      next(e)
    }
  }

  static profile = async (req, res, next) => {
    try {
      const { userId } = req;
      const user = await Users.findByPk(userId);
      res.json({
        status: 'ok',
        user
      })
    } catch (e) {
      next(e)
    }
  }

  static profileUpdate = async (req, res, next) => {
    try {
      const { userId, file } = req;
      const { fName } = req.body;
      if (!/^[a-z]{2,}$/i.test(fName)) {
        throw HttpError(422);
      }
      const allowTypes = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/gif': '.gif',
        'image/webp': '.webp',
      }
      if (!allowTypes[file.mimetype]) {
        throw HttpError(422, 'Invalid Image Format');
      }
      const name = uuidv4();
      // fs.writeFileSync(path.join(__dirname, '../public/images/avatars', name), file.buffer)


      const p1 = sharp(file.buffer)
        .rotate()
        .resize(512)
        .toFile(path.join(__dirname, '../public/images/avatars', name + '.png'))

      const p2 = sharp(file.buffer)
        .rotate()
        .resize(128)
        .toFile(path.join(__dirname, '../public/images/avatars', name + 'x128.png'))

      const p3 = sharp(file.buffer)
        .rotate()
        .resize(512)
        .toFile(path.join(__dirname, '../public/images/avatars', name + '.webp'))
      await Promise.all([p1, p2, p3]);

      res.json({
        status: 'ok',
        fName: req.body.fName
      })
    } catch (e) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      next(e)
    }
  }


  static usersList = async (req, res, next) => {
    try {
      const { page = 1 } = req.query;
      const limit = 2;
      const offset = (page - 1) * limit;
      const users = await Users.findAll({
        limit,
        offset,
      });
      const total = await Users.count();

      const findAndCountAll = await Users.findAndCountAll({
        limit,
        offset,
      })

      const findOne = await Users.findOne({
        where: {
          $or: [
            { fName: 'Poxos' },
            { fName: 'Armen' },
            { lName: 'Poxosyan' },
          ]
        },
      })


      // const [total, users] = await Promise.all([
      //   Users.count(),
      //   Users.findAll({
      //     limit,
      //     offset,
      //   }),
      // ])

      res.json({
        status: 'ok',
        findOne,
        findAndCountAll,
        total,
        pages: Math.ceil(total / limit),
        users
      })
    } catch (e) {
      next(e)
    }
  }

}

export default UsersController;
