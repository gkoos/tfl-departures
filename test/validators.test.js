const rewire = require("rewire");
const validators = rewire('../src/validators');

describe('checkMissingRequiredParams', () => {
    const checkMissingRequiredParams = validators.__get__("checkMissingRequiredParams");

    test('should return missing param name from parameter list', () => {
        expect(checkMissingRequiredParams(['lat', 'long'], {lat: 1})).toEqual(['long']);
    });

    test('should return empty array if every required param is passed', () => {
        expect(checkMissingRequiredParams(['lat', 'long'], {lat: 1, long: 0})).toEqual([]);
    });
});

describe('atcoCode', () => {
    const atcoCode = validators.__get__("atcoCode");

    test('should return true for a param matching the ATCO regex', () => {
        expect(atcoCode('490009695MA')).toBe(true);
    });

    test('should return false for a string containing character(s) other than 0-9, a-z or A-Z', () => {
        expect(atcoCode('490009695MA.')).toBe(false);
        expect(atcoCode('4^&90009695MA.')).toBe(false);
    });

    test('should return false for a string too long or too short', () => {
        expect(atcoCode('1234')).toBe(false);
        expect(atcoCode('12345678901234567890123456')).toBe(false);
    });
});

describe('checkType', () => {
    const checkType = validators.__get__("checkType");

    test('should return true for a parameter in the whitelist', () => {
        expect(checkType('bus_stop')).toBe(true);
    });

    test('should return false for a parameter not in the whitelist', () => {
        expect(checkType('something_else')).toBe(false);
    });
});

describe('latitude', () => {
    const latitude = validators.__get__("latitude");

    test('should return true for a number between -90 and 90', () => {
        expect(latitude(83.78965644)).toBe(true);
    });

    test('should return true for 0', () => {
        expect(latitude(0)).toBe(true);
    });

    test('should return true for a string representing a number between -90 and 90', () => {
        expect(latitude('-83.78965644')).toBe(true);
    });

    test('should return false for NaN', () => {
        expect(latitude('lat')).toBe(false);
    });

    test('should return false for values not in range', () => {
        expect(latitude('-93.78965644')).toBe(false);
        expect(latitude('93.78965644')).toBe(false);
    });
});

describe('longitude', () => {
    const longitude = validators.__get__("longitude");

    test('should return true for a number between -180 and 180', () => {
        expect(longitude(83.78965644)).toBe(true);
    });

    test('should return true for 0', () => {
        expect(longitude(0)).toBe(true);
    });

    test('should return true for a string representing a number between -90 and 90', () => {
        expect(longitude('-83.78965644')).toBe(true);
    });

    test('should return false for NaN', () => {
        expect(longitude('23.a')).toBe(false);
    });

    test('should return false for values not in range', () => {
        expect(longitude('-183.78965644')).toBe(false);
        expect(longitude('183.78965644')).toBe(false);
    });
});

describe('composeMissingParamsMessage', () => {
    const composeMissingParamsMessage = validators.__get__("composeMissingParamsMessage");

    test('should return the correct error message if required param(s) are missing', () => {
        expect(composeMissingParamsMessage(['alt', 'lat'])).toBe("Missing params: alt,lat");
    });

    test('should return undefined if the param list is empty', () => {
        expect(composeMissingParamsMessage([])).toBe(undefined);
    });
});


describe('nearbyStops', () => {
    test('should return the correct error message if required param(s) are missing', () => {
        expect(validators.nearbyStops({})).toEqual({"errors": ["Missing params: lat,long"], "hasErrors": true});
        expect(validators.nearbyStops({long: '80', type: 'bus_stop'})).toEqual({"errors": ["Missing param: lat"], "hasErrors": true});
    });

    test('should return the correct error message if params are malformed', () => {
        expect(validators.nearbyStops({long: '80', lat: '79.3674575674', type: 'airport'})).toEqual({"errors": ["Wrong type given"], "hasErrors": true});
        expect(validators.nearbyStops({long: 'longitude value', lat: '79.3674575674', type: 'airport'})).toEqual({"errors": ["Malformed parameter long", "Wrong type given"], "hasErrors": true});
        expect(validators.nearbyStops({long: 'long', lat: '279.3674575674', type: 'airport'})).toEqual({"errors": ["Malformed parameter lat", "Malformed parameter long", "Wrong type given"], "hasErrors": true});
    });

    test('should return the correct error message if some params are malformed and others are missing', () => {
        expect(validators.nearbyStops({lat: '279.3674575674', type: 'airport'})).toEqual({"errors": ["Missing param: long", "Malformed parameter lat", "Wrong type given"], "hasErrors": true});
    });

    test('should return hasError: false if every parameter has the right format and all the required ones are present', () => {
        expect(validators.nearbyStops({long: '80', lat: '79.3674575674', type: 'bus_stop'})).toEqual({"errors": [], "hasErrors": false});
        expect(validators.nearbyStops({long: '80', lat: '79.3674575674', type: 'bus_stop', 'another_param': 'value'})).toEqual({"errors": [], "hasErrors": false});
    });
});