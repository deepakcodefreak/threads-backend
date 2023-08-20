import express from 'express';
import { expressMiddleware } from '@apollo/server/express4'
import { createApolloGraphqlServer } from './graphql/index'
import UserService from './services/user';

async function init() {
    const app = express()
    app.use(express.json())
    const port = Number(process.env.PORT) || 3000


    const gqlServer = await createApolloGraphqlServer()


    app.get('/', (req, res) => {
        res.send({
            message: "Server is up and running !! again"
        })
    })

    app.use('/graphql', expressMiddleware(gqlServer, {
        context: async ({ req }) => {
            try {
                const token = req.headers.token
                // @ts-ignore
                const user = await UserService.decodeToken(token)
                if (user) {
                    return user;
                } else {
                    return {}
                }
            } catch (error) {
                return {}
            }

        }
    }))

    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
}

init();