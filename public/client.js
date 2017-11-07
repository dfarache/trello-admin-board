/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var BLACK_ROCKET_ICON = 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421';

TrelloPowerUp.initialize({
  // Start adding handlers for your capabilities here!
	'card-buttons': function(t, options) {
	     return [{
	     		 icon: BLACK_ROCKET_ICON,
	         text: 'Sync Card',
	         callback: onCardButtonClick
	 	   }];
    },

    'authorization-status': function(t, options){
        return t.get('member', 'private', 'authToken').then(function(authToken) {
            console.log(authToken)
            return { authorized: authToken != null }
        });
    },

    'show-authorization': function(t, options){
        return t.popup({
            title: 'Authorize Account',
            url: './authorize-account.html',
            height: 140,
        });
    }
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

        return getAdminBoard(t, result.board);
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

function getAdminBoard(t, board) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'GET',
            url: '/api/trello/organizations/' + board.idOrganization + '/boards',
            error: function(err){ reject(err); },
            success: function(data) {
                var adminBoard = data.filter(function(o) { return o.name.toLowerCase() === "admin board" });
                var existsAdminBoard = (adminBoard.length > 0);

                return (existsAdminBoard) ?
                    resolve(adminBoard) :
                    resolve(t.popup({ title: 'Information missing', url: './no-admin.html', height: 200, args: {} }));
            }
        });
    });
}

function setNewCardWebhookAndSync(currentCard, t) {

    // first, we create the webhook
    return setNewCardWebhook(currentCard).then(function() {

        // then, send a request to the server to sync the card.
        // it needs to be done like this the first time the card is created
        return syncCard(currentCard, t);

    });
}

function setNewCardWebhook(currentCard){
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'POST',
            url: '/api/trello/webhook',
            data: {
                memberId: currentCard.id
            },
            error: function(err){ reject(err); },
            success: function(data) { resolve(); }
        });
    });
}

function syncCard(currentCard, t) {
    return t.member('all').then(function(member) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                type: 'POST',
                url: '/api/webhook',
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
