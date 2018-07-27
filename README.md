# Prometheus plugin for Timelion

[Timelion](https://www.elastic.co/blog/timelion-timeline) (part of [Kibana](https://www.elastic.co/products/kibana)) provides a plugin mechanism by which you can create your own connectors to external datasets.

This plugin allows rendering data from [Prometheus](https://prometheus.io) in Timelion, without having to duplicate timeseries into Elasticsearch.



## Installation instructions

#### Package
```
git clone https://github.com/lmangani/timelion-prometheus && cd timelion-prometheus
VERSION="6.2.4" ./release.sh
kibana-plugin install ./timelion-prometheus-1.0.0.zip
```

### Configuration
* All parameters including hostname can be defined inside the Timelion function
* *OPTIONAL* static prometheus hostname, username and password can be stored in `src/core_plugins/timelion/timelion.json`, e.g.
```
"prometheus": {
    "hostname": "my.prometheus.ip",
    "port": 9090,
    "username": "username",
    "password": "password"
  },
```
* restart Kibana



## Versions

The plugin is intended for use with Kibana 5 and 6

If you are using a version of Kibana, you will need to edit kibana.version in the "package.json" file.


#### Other plugins that might be of interest

* [Random](https://github.com/rashidkpc/timelion-random) (by the author of Timelion) - A demo showing how to create a timelion plugin
* [USAFacts](https://github.com/rashidkpc/timelion-usafacts) (by the author of Timelion) - grabs series data from [usafacts.org](http://usafacts.org)
* [Google Analytics](https://github.com/bahaaldine/timelion-google-analytics) - brings Google Analytics data to Timelion
* [Mathlion](https://github.com/fermiumlabs/mathlion) (from Fermium Labs) - enables equation parsing and advanced maths

## Credits

The timelion-prometheus plugin is sponsored by [QXIP BV](http://qxip.net)

Elasticsearch and Kibana are trademarks of Elasticsearch BV, registered in the U.S. and in other countries.


