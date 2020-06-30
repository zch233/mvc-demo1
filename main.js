var getData = function () { return new Promise(function (resolve, reject) {
    var data = JSON.parse(window.localStorage.getItem('list') || '[]');
    resolve(data);
}); };
