

// use a dropdown, which loads code and displays it


// load another bundle which depends on phosphor-disposable
// we want it to fail or detect somehow
// what then happens if we load phosphor-disposable from other.js

var select = document.getElementById('selector');
console.log('loaded')
select.onchange = function() {
    var value = select.options[select.selectedIndex].value;
    console.log('loading', value);
    System.import(value).then(function () {
        console.log('loaded', value);
    });
};
