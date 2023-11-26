import $ from "cheerio";
import crawl from "request-promise";
import MySQL from "../../../config/mysql.js";
import { FormatURL, IsValidURL, IsRootURL } from "../../../config/url.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function Create(request, response) {

    //Create response
    const _response = { message: "", success: false };

    //Create new connection
    const _connection = new MySQL.Connection();

    try {

        //Get query parameter
        const _root = request.query.url;
        if(typeof(_root) === "undefined") {
            throw Error("Invalid url");
        };

        //Format url
        if(!IsValidURL(_root)) {
            throw Error("Invalid url format");
        };

        //Connect to database
        await _connection.Connect();

        //Create data and new url object
        const _url = new URL(_root);
        const _urlbase = _url.protocol + "//" + _url.host + _url.pathname;

        //Get html data and all anchor tags
        const _html = await crawl(_urlbase);
        const _anchor = $("a", _html);

        //Iterate for all anchor tags and store links
        const _href = [];
        for(let i = 0, len = _anchor.length; i < len; i++) {
            const _format = FormatURL(_anchor[i].attribs.href, _urlbase);
            if(_format == null || _format == "null") {
                continue;
            };
            _href.push(_format);
        };
        const _uniquehref = [ ...new Set(_href) ];

        //Insert all new nodes
        //alternatively use createnode(source)
        await _connection.Query("INSERT IGNORE INTO `star-node` (`source`, `group`, `crawled`, `isroot`) VALUES ?;", [ _uniquehref.map((x) => [x, Math.floor(Math.random() * 500), 0, IsRootURL(x)]) ]);

        //Insert new links
        for(const item of _uniquehref) {
            try {

                //await _connection.Query("CALL createlink(?, ?);", [ item, _urlbase ]);
                await _connection.Query(
                    "INSERT INTO `star-link` (`source`, `target`) "+
                    "SELECT * FROM ( SELECT ? AS t_source, ? AS t_target ) AS tmp " +
                    "WHERE NOT EXISTS ( " +
                    "    SELECT `source`, `target` FROM `star-link` WHERE source = ? AND target = ? " +
                    ") LIMIT 1;",
                [ item, _urlbase, item, _urlbase ]);

            }
            catch(exception) {
                console.log("Unable to add", item);
            };
        };

        //Insert root
        await _connection.Query("INSERT IGNORE INTO `star-node` (`source`, `group`, `crawled`, `isroot`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE crawled = 1;", [ _urlbase, Math.floor(Math.random() * 500), 1, IsRootURL(_urlbase)]);

        //Assign response data
        _response.success = true;

    }
    catch(exception) {

        //Log error
        console.log(exception);

        //Assign response data
        _response.message = exception;

    };

    //Close connection
    _connection.Close();

    //Return response
    response.send(_response);

};

export default Create;