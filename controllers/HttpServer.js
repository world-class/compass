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

		if (process.env.NODE_ENV === "PROD") {
			const certDir = process.env.TLS_CERTDIR;
			const tlsOptions = {
				key: fs.readFileSync(certDir + "privkey.pem", "utf8"),
				cert: fs.readFileSync(certDir + "cert.pem", "utf8"),
				ca: fs.readFileSync(certDir + "chain.pem", "utf8"),
			};

			// create HTTPS server
			const httpsServer = https.createServer(tlsOptions, app);

			httpsServer.listen(httpsPort, () => {
				console.log(`HTTPS Server started at port ${httpsPort}!`);
			});
		}
	}
}

module.exports = HttpServer;
