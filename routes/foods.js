var Foods = require('../models/foods');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/img/' });

//new food page
router.get('/new', function(req, res){
  res.render('new_food', {script: 'new_food.js', curUserName: req.session.userName,
                        curUserType: req.session.type, curUserId: req.session.userId, script: 'new_food.js'});
});

//create new food
router.post('/submit', upload.any('test'), function(req, res){
  //console.log(req.body);
  //console.log(req.files);

  // will get the cover photo info
  var dateTokens = req.body.date.split("-");
  var startTokens = req.body.startTime.split(":");
  var endTokens = req.body.endTime.split(":");
  var startDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    endTokens[0], endTokens[1], 0, 0);
  var endDate = new Date(dateTokens[0], dateTokens[1], dateTokens[2],
    startTokens[0], startTokens[1], 0, 0);

  var cPhoto = req.files[0];
  //var cPhotoName = cPhoto.path + "." + cPhoto.mimetype.split("/")[1];
  var cPhotoName = "img/" + cPhoto.filename;

  //TODO pUPLOADS for now use the simple filesystem?
  // Adapted from http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
  // Alternatively could do http://howtonode.org/really-simple-file-uploads?
  // The name of the file
  //var writestream = gfs.createWriteStream({filename: req.files[0].filename});
  // The file that is written
  //fs.createReadStream(req.files[0].path).pipe(writestream);

  //writestream.on('close', function (file) {
  //  console.log(file.filename + ' written To DB');
  var submittedFood = new Foods({
    portionsAvailable: req.body.portions,
    timeRange: {start: startDate, end: endDate},
    name: req.body.name,
//    images: [file._id],        //TODO pUPLOADS
    images: [cPhotoName],        // For now we will use the simple way
                                 // idk if the other way is even better
    description: req.body.description,
    portionDefinition: req.body.portionDef,
    address: {
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      street: req.body.street,
      number: req.body.number,
    },
    sellerId: req.session.userId,
  }).save(function(err,saved){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
