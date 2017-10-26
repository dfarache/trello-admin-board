import _ from 'lodash';
import querystring from 'querystring';
import { sensibleRequest, required } from '../utils';

export default class TrelloAPI{
    constructor(config){
        this.TRELLO_KEY = config.trello.key;
        this.TRELLO_TOKEN = config.trello.token;        
        this.trelloUri = 'https://api.trello.com/1/';      
    }

    createTrelloUri(uri, qs = ''){
        return `${this.trelloUri}${uri}?key=${this.TRELLO_KEY}&token=${this.TRELLO_TOKEN}&${qs}`
    }

    getMemberBoards(opt) {
        required(opt, ['memberId']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`members/${opt.memberId}/boards`),
            json: true
        }
        return sensibleRequest(opt);
    }
  
    getAllOrganiationBoards(opt) {
          required(opt, ['organizationId']);

          var opt = {
              method: 'GET',
              uri: this.createTrelloUri(`organizations/${opt.organizationId}/boards`),
              json: true
          }
          return sensibleRequest(opt);
    }
  
    getBoardCards(opt) {
        required(opt, ['boardId']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`boards/${opt.boardId}/cards`),
            json: true
        }
        return sensibleRequest(opt);
    }

    getBoardLists(opt) {
        required(opt, ['boardId']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`boards/${opt.boardId}/lists`),
            json: true
        }
        return sensibleRequest(opt);
    }

    getCard(opt) {
        required(opt, ['cardId']);

      var opt = {
          method: 'GET',
          uri: this.createTrelloUri(`cards/${opt.cardId}`),
          json: true
      }
      return sensibleRequest(opt);
    }

    getCardActions(opt) {
        required(opt, ['cardId']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`cards/${opt.cardId}/actions`),
            json: true
        }
        return sensibleRequest(opt);
    }

    getCardList(opt) {
        required(opt, ['cardId']);

        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`cards/${opt.cardId}/list`),
            json: true
        }
        return sensibleRequest(opt);
    }

    createList(opt) {
        required(opt, ['boardId', 'listName', 'pos']);

        var qs = querystring.stringify({ name: opt.listName, pos: opt.pos });
        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`boards/${opt.boardId}/lists`, qs),
            json: true
        }
        return sensibleRequest(opt);
    }

    createCardFromExisting(opt){
        required(opt, ['listId', 'originCardId', 'pos']);

        var qs = querystring.stringify({
            idList: opt.listId,
            idCardSource: opt.originCardId,
            keepFromSource: 'all',
            pos: opt.pos
        });
        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`cards`, qs),
            json: true
        }
        return sensibleRequest(opt);
    }

    deleteExistingCard(opt) {
        required(opt, ['cardId']);

        var opt = {
            method: 'DELETE',
            uri: this.createTrelloUri(`cards/${opt.cardId}`),
            json: true
        }
        return sensibleRequest(opt);
    }

    listWebhooks()  {
        var opt = {
            method: 'GET',
            uri: this.createTrelloUri(`tokens/${this.TRELLO_TOKEN}/webhooks`),
            json: true
        }
        return sensibleRequest(opt);
    }

    deleteWebhook(opt) {
        required(opt, ['webhookId']);

        var opt = {
            method: 'DELETE',
            uri: this.createTrelloUri(`webhooks/${opt.webhookId}`),
            json: true
        }
        return sensibleRequest(opt);
    }
  
    createWebhook(opt) {
        required(opt, ['memberId', 'callbackUrl']);
      console.log(opt)
        var qs = querystring.stringify({
            description: `card ${opt.meberId}`,
            callbackUrl: opt.callbackUrl,
            idModel: opt.memberId
        });
      console.log(this.createTrelloUri(`webhooks`))
        var opt = {
            method: 'POST',
            uri: this.createTrelloUri(`webhooks`),
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
