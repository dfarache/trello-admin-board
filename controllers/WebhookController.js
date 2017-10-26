import WebhookService from '../services/WebhookService';

export default class WebhookController{
    constructor(config){
        this.service = new WebhookService(config);
    }

    setupRouter(router){
        router.get('/', this.test.bind(this));
        router.get('/webhooks/all', this.getAllWebhooks.bind(this));
        router.post('/', this.processTrelloCardChange.bind(this));
        router.delete('/all', this.deleteAllWebhooks.bind(this));
        router.delete('/:cardId', this.deleteCardWebhook.bind(this));
        return router;
    }
  
    test(req, res, next) {
        res.send('0k').status(200).end();
    }
  
    getAllWebhooks(req, res, next) {
        return this.service.getAllWebhooks()
            .then(webhooks => res.json(webhooks).status(200).end())
            .catch(err => next(err))
    }
  
    processTrelloCardChange(req, res, next) {                
        return this.service.processTrelloCardChange(req.body)
            .then(() => res.status(200).end())
            .catch(err => next(err))
    }
    
    deleteCardWebhook(req, res, next) {
        return this.service.deleteCardWebhook({
            cardId: req.params.cardId
        })
        .then(() => res.status(204).end())
        .catch(err => next(err))
    }
  
    deleteAllWebhooks(req, res, next) {
        return this.service.deleteAllWebhooks()
            .then(() => res.status(204).end())
            .catch(err => next(err))
    }
}