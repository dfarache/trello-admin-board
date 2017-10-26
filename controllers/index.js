import express from 'express';
import TrelloController from './TrelloController';

module.exports = function(){
    return class PublicAPIController{
        constructor(config){
            this.TrelloController = new TrelloController(config);
        }

        setupRouter(router){
            router.use('/trello', this.TrelloController.setupRouter(express.Router()));
            return router;
        }
    }
}
