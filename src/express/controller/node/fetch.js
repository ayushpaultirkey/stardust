import MySQL from "../../../config/mysql.js";
import { IsValidURL } from "../../../config/url.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function Fetch(request, response) {

    //Create response
    const _response = { message: "", success: false, data: {} };

    //Create new connection
    const _connection = new MySQL.Connection();

    try {

        //Connect to database
        await _connection.Connect();

        //Create new response data
        const _data = { nodes: [], links: [] };

        //Get query parameter
        const _root = request.query.url;
        if(typeof(_root) === "undefined") {

            //Get all root and crawled nodes
            const _resultnode = await _connection.Query("SELECT `source` AS l_src, `group` AS l_grp FROM `star-node` WHERE `crawled` = 1 AND `isroot` = 1;", [ _root, _root ]);

            //Iterate for the result
            _resultnode.forEach(x => {
                _data.nodes.push({ "id": x["l_src"], "group": x["l_grp"] });
            });

        }
        else {

            //Check if url is valid
            if(!IsValidURL(_root)) {
                throw Error("Invalid url");
            };

            //Create new url from the query string
            const _url = new URL(_root);
            const _urlbase = _url.protocol + '//' + _url.host + _url.pathname;

            //Get all link and nodes
            const _resultlink = await _connection.Query(
            "SELECT `source` AS l_src, `target` AS l_tar, "+
            "(SELECT `group` FROM `star-node` WHERE `source` = l_src LIMIT 1) AS n_grp "+
            "FROM `star-link` WHERE `target` = ?;"
            , [ _urlbase ]);
    
            //Iterate for the result
            _resultlink.forEach(x => {
                const _direction = (Math.floor(Math.random() * (8 - 0 + 1)) + 0);
                _data.nodes.push({ "id": x["l_src"], "group": x["n_grp"] });
                _data.links.push({ "source": x["l_src"], "target": x["l_tar"], value: _direction });
            });

            //Add root node
            if(_resultlink.length > 0) {
                _data.nodes.push({ "id": _urlbase, "group": 1 });
            };

        };

        //Assign response data
        _response.data = _data;
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

export default Fetch;