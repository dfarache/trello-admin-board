import _ from 'lodash';
import querystring from 'querystring';
import { sensibleRequest, required } from '../utils';

export default class TrelloAPI{
    constructor(config){
        this.TRELLO_KEY = config.trello.key;
        this.trelloUri = 'https://api.trello.com/1/';
    }

    createTrelloUri(uri, qs = '', credentials = {}){
        const token = credentials.trelloToken;

        return `${this.trelloUri}${uri}?key=${this.TRELLO_KEY}&token=${token}&${qs}`
    }

    getMemberBoards(opt) {
        required(opt, ['memberId', 'credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`members/${opt.memberId}/boards`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    getAllOrganiationBoards(opt) {
          required(opt, ['organizationId', 'credentials']);

          var opt = {
              method: 'GET',
              uri: this.createTrelloUri(`organizations/${opt.organizationId}/boards`, undefined, opt.credentials),
              json: true
          }
          return sensibleRequest(opt);
    }

    getBoardCards(opt) {
        required(opt, ['boardId', 'credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`boards/${opt.boardId}/cards`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    getBoardLists(opt) {
        required(opt, ['boardId', 'credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`boards/${opt.boardId}/lists`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    getCard(opt) {
        required(opt, ['cardId', 'credentials']);

      var opt = {
          method: 'GET',
          uri: this.createTrelloUri(`cards/${opt.cardId}`, undefined, opt.credentials),
          json: true
      }
      return sensibleRequest(opt);
    }

    getCardActions(opt) {
        required(opt, ['cardId', 'credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`cards/${opt.cardId}/actions`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    getCardList(opt) {
        required(opt, ['cardId', 'credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`cards/${opt.cardId}/list`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    createList(opt) {
        required(opt, ['boardId', 'listName', 'pos', 'credentials']);

        var qs = querystring.stringify({ name: opt.listName, pos: opt.pos });
        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`boards/${opt.boardId}/lists`, qs, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    createCardFromExisting(opt){
        required(opt, ['listId', 'originCardId', 'pos', 'credentials']);

        var qs = querystring.stringify({
            idList: opt.listId,
            idCardSource: opt.originCardId,
            keepFromSource: 'all',
            pos: opt.pos,
        });
        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`cards`, qs, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    deleteExistingCard(opt) {
        required(opt, ['cardId', 'credentials']);

        var opt = {
            method: 'DELETE',
            uri: this.createTrelloUri(`cards/${opt.cardId}`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    listWebhooks(opt = {})  {
        required(opt, ['credentials']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`tokens/${opt.credentials.trelloToken}/webhooks`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    deleteWebhook(opt) {
        required(opt, ['webhookId', 'credentials']);

        var opt = {
            method: 'DELETE',
            uri: this.createTrelloUri(`webhooks/${opt.webhookId}`, undefined, opt.credentials),
            json: true
        }
        return sensibleRequest(opt);
    }

    createWebhook(opt) {
        required(opt, ['memberId', 'callbackUrl', 'credentials']);

        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`webhooks`, undefined, opt.credentials),
            json: {
                description: `card ${opt.memberId}`,
                callbackURL: opt.callbackUrl,
                idModel: opt.memberId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return sensibleRequest(opt);
    }
}
