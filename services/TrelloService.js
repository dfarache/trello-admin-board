import _ from 'lodash';
import Promise from 'bluebird';
import TrelloApi from '../apis/trello';
import { required ,throwHttpError } from '../utils';

export default class TrelloService {
    constructor(config){
        this.config = config;
        this.api = new TrelloApi(config);
    }

    deleteCardWebhook(opt) {
        required(opt, ['cardId', 'credentials', 'adminBoardId']);

        // 1st delete the replica card
        return Promise.props({
            modifiedCard: this.aggregateCardData(opt.cardId, opt.credentials),
            adminBoardCards: this.api.getBoardCards({
                boardId: opt.adminBoardId,
                credentials: opt.credentials
            })
        }).then(results => {
            const adminBoardCards = _.map(results.adminBoardCards, c => { return { card: c } });
            const matchingCard = this.getMatchingCardInAdminBoard(adminBoardCards, results.modifiedCard);

            return this.api.deleteExistingCard({cardId: matchingCard.card.id, credentials: opt.credentials })
        })

        // 2nd delete the corresponding webhook
        .then(() => this.api.listWebhooks({
            credentials: opt.credentials
        }))
        .then(webhooks => {
            let index = _.findIndex(webhooks, ['idModel', opt.cardId]);
            let webhookToDelete = webhooks[index];

            return this.api.deleteWebhook({
                webhookId: webhookToDelete.id,
                credentials: opt.credentials
            });
        });
    }

    createCardWebhook(opt) {
        required(opt, ['memberId', 'callbackUrl', 'credentials']);
        return this.api.createWebhook(opt);
    }

    deleteAllWebhooks(opt) {
        required(opt, ['credentials']);

        return this.api.listWebhooks(opt).then(webhooks =>
            Promise.map(webhooks, webhook => this.api.deleteWebhook({
                webhookId: webhook.id,
                credentials: opt.credentials
            }))
        )
    }

    getAllWebhooks(opt) {
        required(opt, ['credentials']);

        return this.api.listWebhooks({
            credentials: opt.credentials
        });
    }

    getBoard(opt) {
        return new Promise((resolve, reject) => {
            if(opt.boardId == null) { throwHttpError(404, 'board not found'); }

            resolve();
        }).then(() => this.api.getBoard({
            boardId: opt.boardId,
            credentials: opt.credentials
        }));
    }

    getAllOrganiationBoards(opt) {
        required(opt, ['organizationId', 'credentials']);

        return this.api.getAllOrganiationBoards({
            organizationId: opt.organizationId,
            credentials: opt.credentials
        });
    }

    aggregateCardData(cardId, credentials) {
        var opt = { cardId: cardId, credentials: credentials };

        return Promise.props({
            card: this.api.getCard(opt),
            cardActions: this.api.getCardActions(opt),
            cardList: this.api.getCardList(opt)
        })
    }

    getMatchingListInAdminBoard(adminLists, modifiedCard) {
        var list;

        for(var i=0; i<adminLists.length; i++) {
            if(adminLists[i].name === modifiedCard.cardList.name) {
                list = adminLists[i];
                break;
            }
        }
        return list;
    }

    getMatchingCardInAdminBoard(adminCards, modifiedCard) {
        var card;

        for(var i=0; i<adminCards.length; i++) {
            if(adminCards[i].card.name === modifiedCard.card.name) {
                card = adminCards[i];
                break;
            }
        }
        return card;
    }

    isOriginCardDeleted(opt) {
        return opt.action.type === 'updateCard' && opt.action.display.translationKey === 'action_archived_card';
    }
}
