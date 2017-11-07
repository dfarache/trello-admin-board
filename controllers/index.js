import express from 'express';
import TrelloController from './TrelloController';
import WebhookController from './WebhookController';
import OauthController from './OauthController';

module.exports = function(){
    return class PublicAPIController{
        constructor(config){
            this.TrelloController = new TrelloController(config);
            this.WebhookController = new WebhookController(config);
            this.OauthController = new OauthController(config);
        }

        setupRouter(router){
            router.use('/trello', this.TrelloController.setupRouter(express.Router()));
            router.use('/webhook', this.WebhookController.setupRouter(express.Router()));
            router.use('/oauth', this.OauthController.setupRouter(express.Router()));
            return router;
        }
    }
}
