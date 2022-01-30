const http = require("http")
const fs = require("fs")

const host = "localhost"
const port = 8000

const user = {
    id: 123,
    username: "testuser",
    password: "qwerty",
}

const requestListener = (req, res) => {
    if (req.url === "/auth" && req.method === "POST") {
        let data = ""
        req.on("data", (chunk) => {
            data += chunk
        })
        req.on("end", () => {
            const parsedData = JSON.parse(data)
            if (
                parsedData.username === user.username &&
                parsedData.password === user.password
            ) {
                let setCookieUserID = `${user.id}; Expires=${new Date(
                    Date.now() + 1000 * 60 * 60 * 24 * 2
                ).toUTCString()}; max_age=${
                    60 * 60 * 24 * 2
                }; domain=localhost; path=/;`
                let setCookieUserAuth = `true; Expires=${new Date(
                    Date.now() + 1000 * 60 * 60 * 24 * 2
                ).toUTCString()}; max_age=${
                    60 * 60 * 24 * 2
                }; domain=localhost; path=/;`
                res.setHeader("Set-Cookie", [
                    `userId=${setCookieUserID}`,
                    `authorized=${setCookieUserAuth}`,
                ])
                res.writeHead(200)
                res.end(`Добро пожаловать ${user.username}!`)
            } else {
                res.writeHead(400)
                res.end("Неверный логин или пароль")
            }
        })
    } else if (req.url === "/post" && req.method === "POST") {
        stringOfCookie = req.headers.cookie
        if (
            +parseCookie(stringOfCookie).userId === user.id &&
            parseCookie(stringOfCookie).authorized
        ) {
            let data = ""
            req.on("data", (chunk) => {
                data += chunk
            })
            req.on("end", () => {
                const parsedData = JSON.parse(data)
                try {
                    let dir = "./files"
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir)
                    }
                    fs.writeFileSync(
                        `${dir}/${parsedData.filename}`,
                        `${parsedData.content}`,
                        {
                            encoding: "utf-8",
                            flag: "a",
                        }
                    )
                } catch (err) {
                    res.writeHead(500)
                    res.end("Internal server error")
                }
            })
            res.writeHead(200)
            res.end(
                `Добро пожаловать user ${parseCookie(stringOfCookie).userId}`
            )
        } else {
            res.writeHead(200)
            res.end(`Вы не авторизованы`)
        }
    } else if (req.url === "/delete" && req.method === "DELETE") {
        stringOfCookie = req.headers.cookie
        if (
            +parseCookie(stringOfCookie).userId === user.id &&
            parseCookie(stringOfCookie).authorized
        ) {
            let data = ""
            req.on("data", (chunk) => {
                data += chunk
            })
            req.on("end", () => {
                const parsedData = JSON.parse(data)
                try {
                    let dir = "./files"
                    if (
                        fs.existsSync(dir) &&
                        fs.existsSync(`${dir}/${parsedData.filename}`)
                    ) {
                        fs.unlinkSync(`./${dir}/${parsedData.filename}`)
                    }
                } catch (err) {
                    res.writeHead(500)
                    res.end("Internal server error")
                }
            })
            res.writeHead(200)
            res.end(
                `Пользователь с id=${
                    parseCookie(stringOfCookie).userId
                } удалил файл`
            )
        } else {
            res.writeHead(200)
            res.end(`Вы не авторизованы`)
        }
    } else if (req.url === "/auth") {
        res.writeHead(405)
        res.end("HTTP method not allowed")
    } else {
        res.writeHead(404)
        res.end("not found")
    }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
    console.log(`Сервер запущен на http://${host}:${port}`)
})

function parseCookie(stringOfCookie) {
    return Object.assign(
        {},
        ...stringOfCookie
            .split(";")
            .map((prop) => prop.trim().split("="))
            .map(([key, value]) => ({ [key]: value }))
    )
}
