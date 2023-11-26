import MySQL from "../../../config/mysql.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function Count(request, response) {

    //Create response
    const _response = { message: "", success: false, data: { nodes: 0, links: 0 } };

    //Create new connection
    const _connection = new MySQL.Connection();

    try {

        //Connect to database
        await _connection.Connect();

        //Get all root and crawled nodes
        const _result = await _connection.Query("SELECT COUNT(*) as c_link FROM `star-link` UNION SELECT COUNT(*) as c_link FROM `star-node`;");

        //Assign response data
        _response.data = { nodes: _result[1]["c_link"], links: _result[0]["c_link"] };
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

export default Count;