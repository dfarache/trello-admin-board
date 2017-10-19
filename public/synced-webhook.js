/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

console.log(window);

// Elements with IDs are available as properties of `window`.
window.analyticsTrelloUnsync.addEventListener('click', deleteCardWebhook);

function deleteCardWebhook() {
    return t.card('all')
        .then(sendDeleteRequest);
}

function sendDeleteRequest(card) {
    return new Promise(function(resolve, reject) {
        $.ajax({
             type: "DELETE",
             url: "https://outstanding-existence.glitch.me/api/trello/" + card.id,
             success: function() { resolve() }, 
             error: function(err){ reject(err); }
        });
    });          
}