exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        req.flash('danger', 'Log in first.');
        res.redirect('/users/register');
    }
}

exports.amIUser = function() {
    if (req.isAuthenticated) {
        return true;
    } else return false;
}

exports.isAdmin = function(req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    }
    else {
        req.flash('danger', 'Access Restricted: Please log in as admin.');
        res.redirect('/users/register');
    }
}