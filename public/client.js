/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var BLACK_ROCKET_ICON = 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421';
var TRELLO_KEY = "";
var TRELLO_TOKEN = "";

var trelloApiUrl = "https://api.trello.com/1/";

TrelloPowerUp.initialize({
  // Start adding handlers for your capabilities here!
	'card-buttons': function(t, options) {
	     return [{
	     		 icon: BLACK_ROCKET_ICON,
	         text: 'Sync Card',
	         callback: onCardButtonClick
	 	   }];
    },
});

function onCardButtonClick(t, options) {
    var secret = t.secret;
    var currentCard;

    return Promise.props({
        currentCard: t.card('all'),
        board: t.board('idOrganization')
    })
    .then(function(result) {
        currentCard = result.currentCard;

        return getAdminBoard(result, t);
    }).then(function(adminBoard) {
        return (adminBoard == null)
            ? undefined
            : setNewCardWebhookAndSync(currentCard, t);
    }).then(function() {
        return displaySuccessPopup(t);
    }).catch(function(err){
        if(err.status != null) {
           handleHttpError(err, t, currentCard);
        }
    });
}

function getAdminBoard(result,t) {
    var urlParam = "organizations/" + result.board.idOrganization + "/boards";
    var currentCard = result.currentCard;

    return new Promise(function(resolve, reject) {
        window._TrelloController.callTrelloApi(urlParam, false, 0, 'GET', function(response){
            var adminBoard = response.obj.filter(function(o) { return o.name.toLowerCase() === "admin board" });
            var existsAdminBoard = (adminBoard.length > 0);

            return (existsAdminBoard) ?
                resolve(adminBoard) :
                resolve(t.popup({ title: 'Information missing', url: './no-admin.html', height: 200, args: {} }));
        });
    })
}

function setNewCardWebhookAndSync(currentCard, t) {

    // first, we create the webhook
    return setNewCardWebhook(currentCard).then(function() {

        // then, send a request to the server to sync the card.
        // it needs to be done lie this the first time the card is created
        return syncCard(currentCard, t);

    });
}

function setNewCardWebhook(currentCard){
    return new Promise(function(resolve, reject) {
        $.ajax({
           type: "POST",
           url: trelloApiUrl + "webhooks?key=" + TRELLO_KEY + "&token=" + TRELLO_TOKEN,
           data: {
               "description": "card " + currentCard.id,
               "callbackURL": "https://outstanding-existence.glitch.me/api/trello",
               "idModel": currentCard.id
           },
           success: function() { resolve() },
           error: function(err){ reject(err); }
      });
  });
}

function syncCard(currentCard, t) {
    return t.member('all').then(function(member) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                type: 'POST',
                url: '/api/trello',
                data: buildTrelloLikeBody(member, currentCard),
                success: function() { resolve() },
                error: function(err){ reject(err); }
            });
        });
    });
}

function buildTrelloLikeBody(member, card) {
    return {
        action: {
            idMemberCreator: member.id,
            type: 'createCard',
            data: {
                card: card
            },
            display: {
                translationKey: 'action_created_card'
            }
        }
    }
}

function displaySuccessPopup(t) {
    return t.popup({
        title: 'The operation was successful!',
        url: './successful-sync.html',
        height: 200,
        args: {}
    })
}

function handleHttpError(error, t, currentCard) {
    switch(error.status) {
        case 400:
            t.popup({ title: 'Card already synced', url: './synced-webhook.html', height: 200, args: {} });
        break;
    }
}
