import { prisma } from "../lib/db";
import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";

const JWT_SECRET = "jwt-secret";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(salt: string, password: string) {
    const hash = createHmac("sha256", salt).update(password).digest("hex");
    return hash;
  }

  public static getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;

    const salt = randomBytes(32).toString("hex");
    const hash = UserService.generateHash(salt, password);

    return prisma.user.create({
      data: { firstName, lastName, email, salt, password: hash },
    });
  }

  private static getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error(`User not found`);
    const userSalt = user.salt;
    const userHashPassword = UserService.generateHash(userSalt, password);

    if (userHashPassword !== user.password)
      throw new Error(`User password mismatch`);

    // generate token
    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }
  public static decodeJWTToken(token: string) {
    return JWT.verify(token, JWT_SECRET);
  }
}

export default UserService;
