function requestFile(url, callback) {
  function fail(code) {
    var element = document.getElementById('test-response-text');
    element.innerHTML = 'Error code: ' + code;
    console.log("fail");
  }
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        return callback(request.responseText);
      } else {
        return fail(request.status);
      }
    } else {
    }
  }
  request.open('GET', url);
  request.send();
}

function joinPath(parts, sep){
   var separator = sep || '/';
   var replace   = new RegExp(separator+'{1,}', 'g');
   return parts.join(separator).replace(replace, separator);
}

ctx = {
  'meta': null,
  'selectedImageId': 0,
  'selectedInstanceId': 0,
};

function init() {
  requestFile("target/meta.json", function(content) {
    window.ctx.meta = JSON.parse(content);
    console.log(window.ctx.meta)
    initializeContent()
  });
}

function getImagePathForInstance(imageId, instanceId) {
  imageName = window.ctx.meta.imageList[imageId]
  instance = window.ctx.meta.instanceList[instanceId]
  return joinPath(["target", instance.dirPathname, imageName + instance.suffix + instance.extension])
}

function updateImageList() {
  imageList = window.ctx.meta.imageList;
  var template = document.getElementById("template-select-image-list").innerHTML;
  var selectImageList = document.getElementById("select-image-list");
  data = {};
  data.imageList = [];
  for (i = 0; i < imageList.length; i++) {
    imageName = imageList[i]
    data.imageList.push({
      "imageDispName": imageName,
      "imageId": i
    });
  }
  var content = Mustache.render(template, data);
  selectImageList.innerHTML = content;
  selectImageList.selectedIndex = 0;
}

function updateImage() {
  selectedImageId = window.ctx.selectedImageId;
  selectedInstanceId = window.ctx.selectedInstanceId;
  selectedInstance = window.ctx.meta.instanceList[selectedInstanceId];
  imageName = window.ctx.meta.imageList[selectedImageId];
  console.log(imageName)
  
  var template = document.getElementById("template-sbs-elements").innerHTML;
  data = []
  curr_row = []
  currInstanceId = 0;
  while (currInstanceId < window.ctx.meta.instanceList.length) {
    var currInstance = window.ctx.meta.instanceList[currInstanceId]
    var imageSource = getImagePathForInstance(selectedImageId, currInstanceId)
    var hoverSource = getImagePathForInstance(selectedImageId, selectedInstanceId)
    var element = {
      'instanceTitle': currInstance.title,
      'hoverInstanceTitle': selectedInstance.title,
      'instanceId': currInstanceId,
      'instanceSelectionClass': currInstanceId == selectedInstanceId ? 'selected' : 'unselected',
      'imageSource': imageSource,
      'hoverImageSource': hoverSource,
    };
    curr_row.push(element);
    currInstanceId += 1;
    if (currInstanceId % window.ctx.meta.ncols == 0) {
      data.push(curr_row)
      curr_row = [];
    }
  }
  var content = Mustache.render(template, data);
  document.getElementById("sbs-main-win").innerHTML = content;
}

function onSelectImageListChanged() {
  window.ctx.selectedImageId = document.getElementById("select-image-list").selectedIndex;
  updateImage()
}

function onSelectedInstanceChanged(instanceId) {
  window.ctx.selectedInstanceId = instanceId;
  updateImage()
}

function onImageHoverStart() {
}

function onImageHoverEnd() {
}

function initializeContent() {
  updateImageList()
  updateImage()
}

window.onload = function() {
  init();
}
