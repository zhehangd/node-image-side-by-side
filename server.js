var fs = require('fs');
var glob = require('glob');
var path = require('path');

var bodyParser = require('body-parser');
var express = require('express');

if (process.argv.length < 3) {
  console.error('You need to provide a meta file.');
  process.exit();
}

meta_file = process.argv[2]
var dataDir = path.dirname(meta_file)
var meta_string = fs.readFileSync(meta_file)
var meta = JSON.parse(meta_string)
console.log(meta);

if (!path.isAbsolute(meta.searchDir)) {
  meta.searchDir = path.join(dataDir, meta.searchDir)
}

searchPattern = path.join(meta.searchDir, meta.searchPattern)
searchedImagePathnameList = glob.sync(searchPattern);
meta.imageList = []
for (pathname of searchedImagePathnameList) {
  var imageParsed = path.parse(path.relative(meta.searchDir, pathname))
  var imageName = path.join(imageParsed.dir, imageParsed.name)
  meta.imageList.push(imageName)
}
console.log(searchPattern)
console.log(meta.imageList)

meta_string = JSON.stringify(meta)

var app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.use("/target/meta.json", function(req, res) {
  res.send(meta_string);
});
app.use("/target", express.static(dataDir))
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, function() {
  console.log("Listening on 8080...");
});
