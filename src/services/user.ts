import {
    createHmac,
    randomBytes
} from 'crypto';
import { prismaClient } from './../lib/db'
import JWT from 'jsonwebtoken'

const JWT_SECRET = 'secet@81679'

export interface CreateUserInterface {
    firstName: string
    lastName?: string
    email: string
    password: string
}

export interface getUserTokenPayload {
    email: string,
    password: string,
}

class UserService {

    private static generateHash(salt: Buffer, password: string) {
        const hashedPassword = createHmac('sha256', salt)
            .update(Buffer.from(password, 'utf-8'))
            .digest('hex')

        return hashedPassword;
    }

    public static async createUser(payload: CreateUserInterface) {
        const { firstName, lastName, email, password } = payload;
        const salt = randomBytes(32).toString('hex');
        console.log('salt used', salt)
        const hashedPassword = UserService.generateHash(Buffer.from(salt), password)

        return await prismaClient.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                salt: salt,
            }
        })

    }

    public static async findUserByEmail(email: string) {
        return prismaClient.user.findUnique({ where: { email: email } })
    }

    public static async getUserToken(payload: getUserTokenPayload) {
        const { email, password } = payload;
        const user = await UserService.findUserByEmail(email)
        if (!user) {
            throw new Error('No user found')
        }
        const salt = user.salt
        const hashedPassword = UserService.generateHash(Buffer.from(salt), password)


        if (user.password !== hashedPassword) {
            throw new Error('Incorrect password')
        }

        const token = JWT.sign({ email: user.email, id: user.id }, JWT_SECRET)
        return token;

    }

    public static async decodeToken(token: string) {
        try {
            const user = JWT.verify(token, JWT_SECRET)
            return user;
        } catch (error) {
            throw new Error('Invalid token')
        }
    }

}

export default UserService;