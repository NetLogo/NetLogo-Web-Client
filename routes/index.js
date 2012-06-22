
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