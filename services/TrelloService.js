import _ from 'lodash';
import Promise from 'bluebird';
import TrelloApi from '../apis/trello';
import { required ,throwHttpError } from '../utils';

export default class TrelloService {
    constructor(config){
        this.config = config;
        this.api = new TrelloApi(config);
    }

    processTrelloCardChange(opt) {
        const memberId = opt.action.idMemberCreator;
        const modifiedCardId = opt.action.data.card.id;

        var adminBoard, modifiedCard, adminBoardCards, targetList, matchingCard;

        return Promise.props({
            boards: this.api.getMemberBoards({
                memberId: memberId
            }),
            modifiedCard: this.aggregateCardData(modifiedCardId)
        }).then(results => {
              adminBoard = getAdminBoards(results.boards);
              modifiedCard = results.modifiedCard;

              return Promise.props({
                  cards: this.api.getBoardCards({
                      boardId: adminBoard.id
                  }),
                  lists: this.api.getBoardLists({
                      boardId: adminBoard.id
                  })
              });
        }).then(result => Promise.props({
            cards: Promise.map(result.cards, card => this.aggregateCardData(card.id)),
            lists: Promise.resolve(result.lists)
        })).then(result => {
            adminBoardCards = result.cards;
            var matchingList = this.getMatchingListInAdminBoard(result.lists, modifiedCard);

            return _.isNil(matchingList)
                ? this.api.createList({
                    boardId: adminBoard.id,
                    listName: modifiedCard.cardList.name,
                    pos: modifiedCard.cardList.pos
                })
                : Promise.resolve(matchingList);
        }).then(list => {
            targetList = list;
            matchingCard = this.getMatchingCardInAdminBoard(adminBoardCards, modifiedCard);

            // delete the card if it exists.
            return _.isNil(matchingCard) ?
                Promise.resolve() :
                this.api.deleteExistingCard({ cardId: matchingCard.card.id })

        }).then(() => {
            return this.isOriginCardDeleted(opt)
                ? this.deleteCardWebhook({
                    cardId: modifiedCard.card.id
                })
                : this.api.createCardFromExisting({
                    listId: targetList.id,
                    originCardId: modifiedCard.card.id,
                    pos: modifiedCard.card.pos
                })
        })
    }

    deleteCardWebhook(opt) {
        required(opt, ['cardId']);

        return this.api.listWebhooks().then(webhooks => {
            let index = _.findIndex(webhooks, ['idModel', opt.cardId]);
            let webhookToDelete = webhooks[index];

            return this.api.deleteWebhook({
                webhookId: webhookToDelete.id
            });
        });
    }
  
    createCardWebhook(opt) {
        required(opt, ['memberId', 'callbackUrl']);
        console.log(opt)
        return this.api.createWebhook(opt);
    }

    deleteAllWebhooks() {
        return this.api.listWebhooks().then(webhooks =>
            Promise.map(webhooks, webhook => this.api.deleteWebhook({
                webhookId: webhook.id
            }))
        )
    }

    getAllWebhooks() {
        return this.api.listWebhooks();
    }
  
    getAllOrganiationBoards(opt) {
        required(opt, ['organizationId']);
      
        return this.api.getAllOrganiationBoards({
            organizationId: opt.organizationId
        });
    }

    aggregateCardData(cardId) {
        var opt = { cardId: cardId };

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

/* PRIVATE FUNCTIONS */
function getAdminBoards(boards) {
    let adminBoards = _.filter(boards, board => {
        return board.name.toLowerCase() === 'admin board'
    });

    return (adminBoards.length === 0) ?
        throwHttpError(404, 'There is no admin board')
        : adminBoards[0];
}
