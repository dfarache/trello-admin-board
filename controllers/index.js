import express from 'express';
import WebhookController from './WebhookController';

module.exports = function(){
    return class PublicAPIController{
        constructor(){
            this.WebhookController = new WebhookController();
        }
        
        setupRouter(router){
            router.use('/trello', this.WebhookController.setupRouter(express.Router()));
            return router;
        }
    }
}