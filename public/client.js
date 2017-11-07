/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var BLACK_ROCKET_ICON = 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421';
var ADMIN_WHITE_ICON = 'https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_developer_board_white_24px.svg';

TrelloPowerUp.initialize({
  // Start adding handlers for your capabilities here!
	'card-buttons': function(t, options) {
	     return [{
	     		 icon: BLACK_ROCKET_ICON,
	         text: 'Sync Card',
	         callback: onCardButtonClick
	 	   }];
    },

    'board-buttons': function (t, opts) {
        return [{
            icon: ADMIN_WHITE_ICON,
            text: 'Make this my Admin Board',
            callback: onBoardButtonClick
        }]
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
        return displaySuccessPopup(t, 'card');
    }).catch(function(err){
        if(err.status != null) {
           handleHttpError(err, t, currentCard);
        }
    });
}

function onBoardButtonClick(t, options) {
    return t.board('all').then(function(board) {
        return setAdminBoard(board);
    }).then(function(){
        return displaySuccessPopup(t, 'board');
    }).catch(function(err) {
        if(err.status != null) {
           handleHttpError(err, t);
        }
    });
}

function getAdminBoard(t, board) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'GET',
            url: '/api/trello/admin-board',
            error: function(err){ reject(err); },
            success: function(data) { resolve(data); }
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

function setAdminBoard(adminBoard) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: 'POST',
            url: '/api/trello/admin-board',
            data: { boardId: adminBoard.id },
            success: function(){ resolve(); },
            error: function(err) { reject(err); }
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

function displaySuccessPopup(t, type) {
    var obj;

    switch(type) {
        case 'card':
            obj = { url: './successful-sync.html' }
            break;
        case 'board':
            obj = { url: './updated-admin-board.html' }
            break;
    }

    return t.popup(Object.assign({ title: 'The operation was successful!', height: 200, args: {} }, obj))
}

function handleHttpError(error, t, currentCard) {
    switch(error.status) {
        case 400:
            t.popup({ title: 'Card already synced', url: './synced-webhook.html', height: 200, args: {} });
            break;
        case 403:
            t.popup({ title: 'You need to authenticate first', url: './access-forbidden.html', height: 200, args: {} })
            break;
        case 404:
            t.popup({ title: 'You have no Admin Board', url: './no-admin.html', height: 200, args: {} })
            break;
    }
}
