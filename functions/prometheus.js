var alter = require('../../../src/core_plugins/timelion/server/lib/alter.js')
var Datasource = require('../../../src/core_plugins/timelion/server/lib/classes/datasource')
var fetch = require('node-fetch')
fetch.Promise = require('bluebird')
var _ = require('lodash')
const querystring = require('querystring')
import moment from 'moment'

/*
  This timelion plugin can pull data from you prometheus deployment.

  Configure hostname, port and optional auth in the file
  kibana/src/core_plugins/timelion/timelion.json.

  See README.md for instructions
*/

module.exports = new Datasource('prometheus', {
  args: [
    {
      name: 'label',
      types: ['string', 'null'],
      help: 'The label for the chart'
    },
    {
      name: 'hostname',
      types: ['string', 'null'],
      help: 'The prometheus host to query.'
    },
    {
      name: 'port',
      types: ['string', 'null'],
      help: 'The prometheus port to query.'
    },
    {
      name: 'db',
      types: ['string', 'null'],
      help: 'The database to query.'
    },
    {
      name: 'metric',
      types: ['string', 'null'],
      help: 'The metric measurement to plot.'
    },
    {
      name: 'field',
      types: ['string', 'null'],
      help: 'The metric field to plot.'
    },
    {
      name: 'groupBy',
      types: ['string', '1m'],
      help: 'Timeseries grouping measure, ie: 1m'
    }
  ],
  help: 'Pull data from prometheus.',

  fn: function prometheusFn (args, tlConfig) {
    var config = _.defaults(args.byName, {
      deviceId: 1,
      chartId: 1000,
      label: 'Data from prometheus'
    })

    /*
      For details of the URL, see the SL API Documentation.
      beginstamp and endstamp are both required, and need to be in Seconds
      since Epoch (Kibana provides them in milliseconds since Epoch)
    */

    var beginTime = new Date(tlConfig.time.from).toISOString()
    var endTime = new Date(tlConfig.time.to).toISOString()
    var username = tlConfig.settings['timelion:prometheus.username']
    var password = tlConfig.settings['timelion:prometheus.password']
    var sl_hostname = tlConfig.settings['timelion:prometheus.hostname']
    var sl_port = tlConfig.settings['timelion:prometheus.port'] || 9090
    var sl_groupBy = tlConfig.settings['timelion:prometheus.groupBy'] || '1m'

    if (!sl_hostname && !config.hostname) {
      throw new Error('prometheus plugin: hostname must be configured! ' +
        'Edit the file kibana/src/core_plugins/timelion/timelion.json or add a hostname parameter.')
    }

    if (!config.metric) {
      throw new Error('prometheus plugin: metric must be defined!')
    }

    var Q = config.metric

    var PARAMS = {
      query: Q,
      start: beginTime,
      end: endTime,
      step: sl_groupBy
    }
    if (config.username && config.password) { PARAMS.username = config.username; PARAMS.password = config.password }
    var QPARAMS = querystring.stringify(PARAMS)

    var url = 'http://' + (config.hostname || sl_hostname) + ':' + (config.port || sl_port) + '/api/v1/query_range?' + QPARAMS
    console.log('PROMETHEUS QUERY URL:', url, PARAMS)

    return fetch(url)
      .then(res => res.json())
      .then(function (resp) {
      // Debug
        console.log('PROMETHEUS RESP:', resp)

        if (resp.errors || !resp) {
          throw new Error('Error connecting to prometheus API: ' +
          resp.errors[0].errorcode + ' ' + resp.errors[0].message || resp.code)
        }
        if (!resp.results || !resp.data || !resp.data.result) {
          throw new Error('No results from prometheus API! ')
        }

        var list = []
        // Prom series to Timelion seriesList
        _(resp.data.result).forEach(function (res) {
          var data = _.compact(_.map(res.values, function (pair, count) {
            if (pair[1] == null || !pair[1]) return
            return [ moment(pair[0]).valueOf(), pair[1] ]
          }))
          list.push({
            data: data,
            type: 'series',
            label: res.metric['__name__'],
            meta: {
              instance: res.metric.instance
            }
          })
        })

        return {
          type: 'seriesList',
          list: list
        }
      }).catch(function (e) {
        throw e
      })
  }
})
