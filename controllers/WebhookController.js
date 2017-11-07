import WebhookService from '../services/WebhookService';

export default class WebhookController {
    constructor(config) {
        this.config = config;
        this.service = new WebhookService(config);
    }

    setupRouter(router){
        router.post('/', this.processTrelloCardChange.bind(this));
        return router;
    }

    processTrelloCardChange(req, res, next) {
        const trelloToken = req.query.trelloToken || req.cookies.trelloToken;

        return (trelloToken == null)
            ? res.status(403).send('Forbidden')
            : this.service.processTrelloCardChange(req.body, { trelloToken: trelloToken })
                .then(() => res.status(200).end())
                .catch(err => next(err))
    }
}
