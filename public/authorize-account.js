/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = window.TrelloPowerUp.iframe();

t.render(function() {
  return t.sizeTo('#content');
})


var authBtn = document.getElementById('authorize');

authBtn.addEventListener('click', function() {
    getOauthUrl().then(function(data) {
        return t.authorize(data.url);
    }).then(function(token) {
        console.log(token);
        return t.set('member', 'private', 'authToken', token)
    }).then(function(){
        return t.closePopup();
    });
});

function getOauthUrl(){
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'GET',
            url: '/api/oauth/login',
            headers: {
                "Access-Control-Allow-Headers": "X-Requested-With",
                "X-Requested-With": "XMLHttpRequest"
            },
            error: function(err){ reject(err); },
            success: function(data) {
                resolve(data);
            }
        });
    });
}
