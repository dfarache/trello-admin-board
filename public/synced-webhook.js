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
             url: "/api/trello/" + card.id,
             success: function() {
                 $('.title').html('The card was unsynced');
                 $('.message').html('<p>The copy in the Admin board has been deleted and we won\'t track anymore changes done to this card</p>');
                 resolve();
             },
             error: function(err){ reject(err); }
        });
    });
}
