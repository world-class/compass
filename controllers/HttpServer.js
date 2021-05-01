const fs = require("fs");
const http = require("http");

class HttpServer {
	constructor(app) {
		this.createHttpServer(app);
	}

	createHttpServer(app) {
		const httpServer = http.createServer(app);
		const httpPort = process.env.HTTP_PORT || "8087";

		httpServer.listen(httpPort, () => {
			console.log(`HTTP Server started at port ${httpPort}`);
		});

		}
	}
}

module.exports = HttpServer;
