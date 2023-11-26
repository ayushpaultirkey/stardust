import url from "url";
import http from "http";
import path from "path";
import express from "express";
import router from "./router.js";
import compression from "compression";

function init() {

    //Get current directory
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    //
    const app = express();
    const server = http.createServer(app);

    app.use(compression())
    
    /*
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    */
    
    //
    app.use("/", router);
    app.use("/public", express.static(path.join(__dirname, "./../../dist/")));
    app.use("/stardust", function(request, response) {
        response.sendFile(path.join(__dirname, "./../../dist/index.html"))
    });
    
    //
    server.listen(process.env.PORT || 3000, () => {
        console.log("http://localhost:3000/stardust");
    });

}

//
export default init;