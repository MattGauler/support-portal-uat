var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Addison Lee Support Portal' });
});
module.exports = router;
