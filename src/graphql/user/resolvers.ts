import UserService, { CreateUserInterface, getUserTokenPayload } from './../../services/user'

const queries = {
    hello: () => "hello dc boy",
    say: (_: any, { name }: { name: String }) => `hey ${name}`,
    getUserToken: async (_: any, { email, password }: getUserTokenPayload) => {
        return await UserService.getUserToken({ email, password })
    },
    getCurrentLoggedInUser: async (_: any, parameters: any, context: any) => {
        const { email } = context
        if (email) {
            const user = await UserService.findUserByEmail(email)
            return user;
        }
    }
}
const mutations = {
    createUser: async (_: any, payload: CreateUserInterface) => {
        const res = await UserService.createUser(payload)
        return res.id
    }
}

export const resolvers = { queries, mutations }