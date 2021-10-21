const express = require('express')
const controller = require('./coins.controller')
const { validateCoins, validateTreasuries, validateFundsInvested } = require('./coins.validator')
const { setCurrencyRate } = require('../middlewares')

const router = express.Router()

/**
 * @api {get} /v1/coins List coins
 * @apiDescription Get a list of coins
 * @apiVersion 1.0.0
 * @apiGroup Coin
 *
 * @apiParam  {String=bitcoin,ethereum,...}   [uids]        Coin uids separated by comma
 * @apiParam  {String=name,code,price,price_change_[24h/7d/14d,30d/200d/1y],ath_percentage,atl_percentage,market_cap,market_cap_rank,total_volume,platforms,coingecko_id
 *                                        }   [fields]      Coin's fields separated by comma
 * @apiParam  {Number{1-4000}}                [limit]       Coins per page
 * @apiUse    Currencies
 * @apiUse    Languages
 *
 * @apiSuccess  {String}    coin.uid                Coin's uid
 * @apiSuccess  {String}    [coin.price]            Coin's price
 * @apiSuccess  {Date}      [coin.last_updated]     Updated date
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  [{
 *    "uid": "bitcoin",
 *    "price": "100000"
 *    "last_updated": "2021-12-12 00:00:00.000+00"
 *  }]
 *
 * @apiError (Bad Request 400)  ValidationError   Some parameters may contain invalid values
 */
router.get('/', validateCoins, setCurrencyRate, controller.index)

/**
 * @api {get} /v1/coins/:uid Get coin
 * @apiDescription Get coin information
 * @apiVersion 1.0.0
 * @apiGroup Coin
 *
 * @apiParam    {String}        uid   Coin's uid
 * @apiUse      Currencies
 * @apiUse      Languages
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "uid": "bitcoin",
 *    "name": "Bitcoin",
 *    "price": "100000",
 *    "code": "btc",
 *    "description": "...",
 *    "price_change": {},
 *    "market_data: {},
 *    "performance: {},
 *    "platforms: {},
 *    "category_uids: []
 *  }
 *
 * @apiError (Bad Request 400)  ValidationError   Some parameters may contain invalid values
 * @apiError (Not Found 404)    NotFound          Coin does not exist
 */
router.get('/:uid', setCurrencyRate, controller.show)

/**
 * @api {get} /v1/coins/:uid/details Get coin details
 * @apiDescription Get coin's detailed information
 * @apiVersion 1.0.0
 * @apiGroup Coin
 *
 * @apiParam    {String}        uid   Coin's uid
 * @apiUse      Currencies
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "uid": "supercoin",
 *    "links": {},
 *    "security": {},
 *    "investor_data": {
 *      "funds_invested": "640000000",
 *      "treasuries": "720000000"
 *    }
 *  }
 *
 * @apiError (Bad Request 400)  ValidationError   Some parameters may contain invalid values
 * @apiError (Not Found 404)  NotFound            Coin does not exist
 */
router.get('/:uid/details', setCurrencyRate, controller.details)

/**
 * @api {get} /v1/coins/:uid/treasuries List treasuries
 * @apiDescription Get coin's treasuries
 * @apiVersion 1.0.0
 * @apiGroup Coin
 *
 * @apiParam    {String}        uid   Coin's uid
 * @apiUse      Currencies
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  [{
 *    "type": "public",
 *    "amount": "200000",
 *    "amountInCurrency": "200000000",
 *    "country": "AI"
 *  }]
 *
 * @apiError (Bad Request 400)  ValidationError   Some parameters may contain invalid values
 * @apiError (Not Found 404)    NotFound          Coin does not exist
 */
router.get('/:uid/treasuries', validateTreasuries, setCurrencyRate, controller.treasuries)

/**
 * @api {get} /v1/coins/:uid/funds_invested List Funds Invested
 * @apiDescription Get coin's Funds Invested
 * @apiVersion 1.0.0
 * @apiGroup Coin
 *
 * @apiParam    {String}        uid   Coin's uid
 * @apiUse      Currencies
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  [{
 *    "date": "2021-10-02",
 *    "round": "Venture Round",
 *    "amount": "20003003",
 *    "funds": [{
 *       "name": "ABC fund",
 *       "website": "https://domain.com/abc",
 *       "is_lead": true
 *     }]
 *  }]
 *
 * @apiError (Bad Request 400)  ValidationError   Some parameters may contain invalid values
 * @apiError (Not Found 404)    NotFound          Coin does not exist
 */
router.get('/:uid/funds_invested', validateFundsInvested, setCurrencyRate, controller.fundsInvested)
router.get('/:uid/transactions', controller.transactions)
router.get('/:uid/addresses', controller.addresses)
router.get('/:uid/addresses_holders', controller.addressHolders)
router.get('/:uid/addresses_ranks', controller.addressRanks)

module.exports = router
