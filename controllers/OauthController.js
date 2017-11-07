import path from 'path';
import OauthService from '../services/OauthService';

export default class OauthController{
    constructor(config){
        this.config = config;
        this.service = new OauthService(config);
        this.TEN_YEARS = (10 * 365 * 24 * 60 * 60 * 1000);
    }

    setupRouter(router){
        router.get('/login', this.getOAuthRequestToken.bind(this));
        router.get('/callback', this.processOAuthCallback.bind(this));

        return router;
    }

    getOAuthRequestToken(req, res, next) {
        return this.service.getOAuthRequestToken()
            .then(results => {
                res.status(200)
                res.json({url: `${this.config.trello.urls.authorize}?expiration=never&oauth_token=${results.token}&name=${this.config.trello.appName}&scope=read,write,account`});
                res.end();
            });
    }

    processOAuthCallback(req, res, next) {
        return this.service.processOAuthCallback({
            token: req.query.oauth_token,
            verifier: req.query.oauth_verifier
        }).then(results => {
            res.cookie('trelloToken', results.token, { maxAge: this.TEN_YEARS, httpOnly: true });
            res.cookie('trelloSecret', results.secret, { maxAge: this.TEN_YEARS, httpOnly: true });

            res.status(200).sendFile(path.join(__dirname, '../public', 'on-oauth-callback.html'));
        });
    }
}
