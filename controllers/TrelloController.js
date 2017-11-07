import _ from 'lodash';
import TrelloService from '../services/TrelloService';

export default class TrelloController{
    constructor(config){
        this.service = new TrelloService(config);
        this.TEN_YEARS = (10 * 365 * 24 * 60 * 60 * 1000);
    }

    setupRouter(router){
        router.use(this.__ensureAuthenticatedRequests.bind(this));
        router.get('/admin-board', this.getTheAdminBoard.bind(this));
        router.get('/organizations/:organizationId/boards', this.getAllOrganiationBoards.bind(this));
        router.get('/webhooks/all', this.getAllWebhooks.bind(this));
        router.post('/webhook', this.createCardWebhook.bind(this));
        router.post('/admin-board', this.saveAdminBoard.bind(this));
        router.delete('/all', this.deleteAllWebhooks.bind(this));
        router.delete('/:cardId', this.deleteCardWebhook.bind(this));
        return router;
    }

    __ensureAuthenticatedRequests(req, res, next) {      
        if(req.cookies.trelloToken == null) {
            res.status(403).send('Forbidden');
        } else {
            next();
        }
    }

    getAllWebhooks(req, res, next) {
        return this.service.getAllWebhooks({
            credentials: _.pick(req.cookies, ['trelloToken'])
        })
        .then(webhooks => res.json(webhooks).status(200).end())
        .catch(err => next(err))
    }

    getTheAdminBoard(req, res, next) {
        return this.service.getBoard({
            boardId: req.cookies.adminBoard,
            credentials: _.pick(req.cookies, ['trelloToken'])
        }).then(adminBoard =>
            res.status(200).json(adminBoard).end()
        ).catch(err =>
            next(err)
        )
    }

    getAllOrganiationBoards(req, res, next) {
      return this.service.getAllOrganiationBoards({
            organizationId: req.params.organizationId,
            credentials: _.pick(req.cookies, ['trelloToken'])
        })
        .then(boards => res.json(boards).status(200).end())
        .catch(err => next(err))
    }

    createCardWebhook(req, res, next) {
        return this.service.createCardWebhook({
            memberId: req.body.memberId,
            credentials: _.pick(req.cookies, ['trelloToken']),
            callbackUrl: `https://${req.hostname}/api/webhook?trelloToken=${req.cookies.trelloToken}&adminBoard=${req.cookies.adminBoard}`
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }

    saveAdminBoard(req, res, next) {
        if(req.body.boardId == null) {
            res.status(500).send({ message: 'boardId is required' });
        } else {
            res.cookie('adminBoard', req.body.boardId, { maxAge: this.TEN_YEARS, httpOnly: true });
            res.status(204).end();
        }
    }

    deleteCardWebhook(req, res, next) {
        return this.service.deleteCardWebhook({
            cardId: req.params.cardId,
            credentials: _.pick(req.cookies, ['trelloToken'])
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }

    deleteAllWebhooks(req, res, next) {
        return this.service.deleteAllWebhooks({
            credentials: _.pick(req.cookies, ['trelloToken'])
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }
}
