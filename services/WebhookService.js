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

    processTrelloCardChange(opt, credentials) {
        const memberId = opt.action.idMemberCreator;
        const modifiedCardId = opt.action.data.card.id;

        var adminBoard, modifiedCard, adminBoardCards, targetList, matchingCard;

        return Promise.props({
            boards: this.api.getMemberBoards({
                memberId: memberId,
                credentials: credentials
            }),
            modifiedCard: this.trello.aggregateCardData(modifiedCardId, credentials)
        }).then(results => {
              adminBoard = this.trello.getAdminBoards(results.boards);
              modifiedCard = results.modifiedCard;

              return Promise.props({
                  cards: this.api.getBoardCards({
                      boardId: adminBoard.id,
                      credentials: credentials
                  }),
                  lists: this.api.getBoardLists({
                      boardId: adminBoard.id,
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
                    boardId: adminBoard.id,
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
