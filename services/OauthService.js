import Promise from 'bluebird';
import { getOauthInstance, required } from '../utils';

export default class OauthService {
    constructor(config) {
        this.config = config;
        this.oauth = getOauthInstance(config.trello);
        this.secrets = {};
    }

    getOAuthRequestToken(){
        return Promise.fromCallback(callback =>
            this.oauth.getOAuthRequestToken(callback)
        , {multiArgs: true}).spread((token, _tokenSecret, results) => {
            this.secrets[token] = _tokenSecret;
            return {
                token: token,
                secret: _tokenSecret,
                results: results
            }
        });
    }

    processOAuthCallback(opt){
        required(opt, ['token', 'verifier']);

        return Promise.fromCallback(callback =>
            this.oauth.getOAuthAccessToken(opt.token, this.secrets[opt.token], opt.verifier, callback)
        , {multiArgs: true}).spread((accessToken, accessTokenSecret, results) => {
            delete this.secrets[opt.token];
            return { token: accessToken, secret: accessTokenSecret }
        })
    }
}
