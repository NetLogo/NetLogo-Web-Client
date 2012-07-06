
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: "Philip's Chat"})
};

exports.thing = function(req, res){
    res.render('thing', { title: "thing" })
};

exports.error = function(req, res){
    res.render('error', { title: "Error" })
};

exports.indexPost = function(req, res){
    var name = req.body.username;
    if ((name !== null) && (name !== "") && (name !== "null") && (name.length < 13) && (validName(name))) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write(name.toString());
        res.end();
    } else {
        res.send('/error');
    }
};
