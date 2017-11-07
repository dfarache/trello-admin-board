import _ from 'lodash';
import Promise from 'bluebird';
import TrelloService from './TrelloService';
import TrelloApi from '../apis/trello';

export default class WebhookService{
    constructor(config) {
        this.config = config;
        this.trello = new TrelloService(config);
        this.api = new TrelloApi(config);
    }

    processTrelloCardChange(opt, credentials, adminBoardId) {
        const memberId = opt.action.idMemberCreator;
        const modifiedCardId = opt.action.data.card.id;

        var modifiedCard, adminBoardCards, targetList, matchingCard;

        return this.trello.aggregateCardData(modifiedCardId, credentials).then(card => {
            modifiedCard = card;

            return Promise.props({
                cards: this.api.getBoardCards({
                    boardId: adminBoardId,
                    credentials: credentials
                }),
                lists: this.api.getBoardLists({
                    boardId: adminBoardId,
                    credentials: credentials
                })
            });
        }).then(result => Promise.props({
            cards: Promise.map(result.cards, card => this.trello.aggregateCardData(card.id, credentials)),
            lists: Promise.resolve(result.lists)
        })).then(result => {
            adminBoardCards = result.cards;
            var matchingList = this.trello.getMatchingListInAdminBoard(result.lists, modifiedCard);

            return _.isNil(matchingList)
                ? this.api.createList({
                    boardId: adminBoardId,
                    listName: modifiedCard.cardList.name,
                    pos: modifiedCard.cardList.pos,
                    credentials: credentials
                })
                : Promise.resolve(matchingList);
        }).then(list => {
            targetList = list;
            matchingCard = this.trello.getMatchingCardInAdminBoard(adminBoardCards, modifiedCard);

            // delete the card if it exists.
            return _.isNil(matchingCard) ?
                Promise.resolve() :
                this.api.deleteExistingCard({ cardId: matchingCard.card.id, credentials: credentials })

        }).then(() => {
            return this.trello.isOriginCardDeleted(opt)
                ? this.trello.deleteCardWebhook({
                    cardId: modifiedCard.card.id,
                    credentials: credentials
                })
                : this.api.createCardFromExisting({
                    listId: targetList.id,
                    originCardId: modifiedCard.card.id,
                    pos: modifiedCard.card.pos,
                    credentials: credentials
                })
        })
    }
}
