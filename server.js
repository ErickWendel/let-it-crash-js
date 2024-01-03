import {
    createServer
} from 'node:http'

import { once } from 'node:events'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Sequelize, DataTypes } from 'sequelize'


const getConnectionString = () => {
    const host = process.env.POSTGRES_HOST || "localhost"
    const db = process.env.POSTGRES_DB || "heroes"
    const password = process.env.POSTGRES_PASSWORD || "mysecretpassword"
    const port = parseInt(process.env.POSTGRES_PORT || "5432")
    return `postgres://postgres:${password}@${host}:${port}/${db}`
}

async function getDB() {
    const sequelize = new Sequelize(
        getConnectionString(),
        {
            logging: false,
            native: false,
        }
    );

    await sequelize.authenticate();
    console.log("postgres is running");

    const Hero = sequelize.define("hero", {
        name: DataTypes.STRING,
        power: DataTypes.STRING,
    });

    await Hero.sync({ force: true });

    return {
        Hero,
        sequelize,
    }
}

const { Hero, sequelize } = await getDB()

async function handleRequest(request, response) {

    // some validation should be done here
    // I'm doing without it to simulate a critical error
    const data = JSON.parse(await once(request, 'data'))
    const result = await Hero.create(data)

    return response.end(JSON.stringify(result))
}


const storage = new AsyncLocalStorage()

// cannot add `async` here otherwise it's gonna be on a different async context
const server = createServer((request, response) => {
    storage.enterWith({ response, id: randomUUID() })
    return handleRequest(request, response)
})
    .listen(3000)
    .once('listening', () =>
        console.log('server running at', server.address().port)
    )


for (const error of ['uncaughtException', 'unhandledRejection']) {
    process.once(error, async (message) => {
        const { response, id } = storage.getStore()
        const shortenId = id.slice(0, 3)
        console.log(`req: [${shortenId}] crashed but will be nicely handled!`)

        console.log(`${error} received!\nmessage: ${message}\n`)
        response.end(`wow! - req id: ${shortenId}`)

        await promisify(server.close.bind(server))()

        console.log('http server closed')

        await sequelize.close()
        console.log('DB connection closed')
        process.exit(1)
    })
}


/*
// turn off docker container to simulate a critical error

curl \
    -H "Content-Type: application/json" \
    -d '{"name":"John Wick", "power": "superhuman strength"}' \
    localhost:3000

curl \
    -H "Content-Type: application/json" \
    -d '{"}' \
    localhost:3000

*/