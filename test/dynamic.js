// use a dropdown, which loads code and displays it


// load another bundle which depends on phosphor-disposable
// we want it to fail or detect somehow
// what then happens if we load phosphor-disposable from other.js

var select = document.getElementById('selector');
console.log('loaded')
select.onchange = function() {
  var value = select.options[select.selectedIndex].value;
  console.log('loading', value);
  System.import(value).then(function (module) {
    console.log('loaded', value);
    console.log(module);
  });
};


console.log('importing');
for (var key in System.npmPaths) {
  var obj = System.npmPaths[key];
  // check for one occurrence of `node_modules` in the fileUrl
  var fileUrl = obj.fileUrl;
  var index = fileUrl.indexOf('node_modules');
  var lastIndex = fileUrl.lastIndexOf('node_modules');
  if (index > 0 && index === lastIndex) {
    console.log(obj);
    console.log(fileUrl);
    System.import(obj.name + '/baz/foo.json').then(function (result) {
      console.error('here');
    });
    System.import(obj.name + '/package.json').then(function (module) {
      window.package_json = module;
      console.log(module);
      if (module.hasOwnProperty('phosphide')) {
        console.log('got a plugin');
      }
    });
  }
}
