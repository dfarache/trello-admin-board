import TrelloService from '../services/TrelloService';

export default class TrelloController{
    constructor(config){
        this.service = new TrelloService(config);
    }

    setupRouter(router){
        router.get('/', this.test.bind(this));
        router.use(this.__ensureAuthenticatedRequests.bind(this));
        router.get('/organizations/:organizationId/boards', this.getAllOrganiationBoards.bind(this));
        router.get('/webhooks/all', this.getAllWebhooks.bind(this));
        router.post('/webhook', this.createCardWebhook.bind(this));
        router.delete('/all', this.deleteAllWebhooks.bind(this));
        router.delete('/:cardId', this.deleteCardWebhook.bind(this));
        return router;
    }

    __ensureAuthenticatedRequests(req, res, next) {      
        if(req.cookies.trelloToken == null || req.cookies.trelloSecret == null) {
            res.status(403).send('Forbidden');
        } else {
            next();
        }
    }

    test(req, res, next) {
        res.send('0k').status(200).end();
    }

    getAllWebhooks(req, res, next) {
        return this.service.getAllWebhooks({
            credentials: req.cookies
        })
        .then(webhooks => res.json(webhooks).status(200).end())
        .catch(err => next(err))
    }

    getAllOrganiationBoards(req, res, next) {
      return this.service.getAllOrganiationBoards({
            organizationId: req.params.organizationId,
            credentials: req.cookies
        })
        .then(boards => res.json(boards).status(200).end())
        .catch(err => next(err))
    }

    createCardWebhook(req, res, next) {
        return this.service.createCardWebhook({
            memberId: req.body.memberId,
            credentials: req.cookies,
            callbackUrl: `https://${req.hostname}/api/webhook?trelloToken=${req.cookies.trelloToken}`
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }

    deleteCardWebhook(req, res, next) {
        return this.service.deleteCardWebhook({
            cardId: req.params.cardId,
            credentials: req.cookies
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }

    deleteAllWebhooks(req, res, next) {
        return this.service.deleteAllWebhooks({
            credentials: req.cookies
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }
}
