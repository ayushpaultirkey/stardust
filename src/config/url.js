function FormatURL(url = "", root = "") {
    if(url.indexOf("#") == 0) {
        return null;
    };
    let href = new URL(url, root)
    return href.protocol + "//" + href.hostname + href.pathname;
};

function IsValidURL(url = "") {
    try {
        new URL(url);
        return true;
    }
    catch (err) {
        return false;
    }
};

function IsRootURL(url = "") {
    try {

        if(!IsValidURL(url)) {
            throw Error();
        };

        let _url = new URL(url);
        if(_url.pathname == "/") {
            return 1
        };
        return 0;

    }
    catch (err) {
        return 0;
    }
};

export { FormatURL, IsValidURL, IsRootURL };