import _ from 'lodash';
import request from 'request-promise';

export function required(obj, params) {
    const absent = _.filter(params, property => _.isNil(_.get(obj, property)));

    if(!_.isEmpty(absent)){
        throw new Error(`${_.join(absent, ',')} must be specified`);
    }
}

export function sensibleRequest(opt) {
    return request(opt).then(function (response) {
        if (response.statusCode >= 300) {
            var e = new Error(response.body);
            e.status = response.statusCode;
            e.body = response.body;
            throw e;
        }
        return response;
    });
}

export function throwHttpError(code, message){
    var e = new Error;
    e.status = code;
    e.message = message;
    throw e;
}